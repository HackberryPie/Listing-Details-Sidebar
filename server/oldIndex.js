const express = require('express');

//metric modules
const prometheus = require('prom-client');
const winston = require('winston');

//etc
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');

//my 3 different databases. need to export these
const mongoDBGetOne = require('./controllers/MongoDBController.js');
const couchDataGetOne = require('./controllers/CouchDBController.js');
const postgreSQLGetOne = require('./controllers/PostgreSQLController.js');

const app = express();

const logTransports = {
  console: new winston.transports.Console({ level: 'info' })
};

//Winston is a logger to see errors. Told this is a good idea
// but honestly not really sure how this is better than just catching
// error
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  transports: [logTransports.console]
});

//part of the prometheus module. There are defaults it will collect
// when this function is called
// const metricsInterval = prometheus.collectDefaultMetrics();

//A custom metric, if we log prometheus we can see all available ones
const requestsForData = new prometheus.Counter({
  name: 'requests_for_data',
  help: 'number of requests for data'
});

const successCount = new prometheus.Counter({
  name: 'status_code_200',
  help: 'number of successes in retrieving and sending data'
});

const failureCount = new prometheus.Counter({
  name: 'status_code_500',
  help: 'number of failures in retrieving and sending data'
});

//basically copied this. well see what it looks like hopefully
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500]
});

const timeToGetDataFromDatabase = new prometheus.Histogram({
  name: 'time_to_get_data_ms',
  help: 'How long does it take to get data from Mongo',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.0000001, 0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1, 10]
});

const requestTimer = httpRequestDurationMicroseconds.startTimer();

//typical middlewear
app.use(compression());
app.use(bodyParser.json());
// app.use('/:number', express.static(path.join(__dirname + '/../client/dist')));
app.use(express.static(path.join(__dirname + '/../client/dist')));

app.use((req, res, next) => {
  //set up a listener to get data after the response is finished
  res.on('finish', () => {
    httpRequestDurationMicroseconds.labels(
      req.method,
      res.route,
      res.statusCode
    );

    requestTimer();
    if (res.statusCode >= 200 && res.statusCode <= 299) {
      successCount.inc();
    } else {
      failureCount.inc();
    }
  });
  next();
});

app.get('/loaderio-9a0cfa999a746a16178738e7dfcf3aaf.txt', (req, res) => {
  res.send('loaderio-9a0cfa999a746a16178738e7dfcf3aaf');
});

app.get('/api/details/:id', (req, res) => {
  const dataTimer = timeToGetDataFromDatabase.startTimer();
  const { id } = req.params;

  mongoDBGetOne(id, (data) => {
    timeToGetDataFromDatabase.labels(
      req.method,
      req.route.path,
      res.statusCode
    );
    dataTimer();
    requestsForData.inc();
    res.send([data]);
  });
});

//POSTGRESQL
// app.get('/api/details/:id', postgreSQLGetOne);

//COUCHDB
// app.get('/api/details/:id', couchDataGetOne);

//the endpoint our prometheus server hits to scrape the data
app.get('/api/metrics', (req, res) => {
  res.set('Content-type', prometheus.register.contentType);
  //this is a property that is storing all our metrics
  res.end(prometheus.register.metrics());
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/dist/index.html'));
});

let port = 3012;
const server = app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});

//SIGTERM is an 'event' whenever a process starts shutting down.
// I think when we close the server this will utilize
// 'graceful' shutdowns. It basically asks the server to close
// instead of forcing it
process.on('SIGTERM', () => {
  // clearInterval(metricsInterval);
  server.close((err) => {
    if (err) console.log(err);
    process.exit(0);
  });
});
