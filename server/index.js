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

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  transports: [logTransports.console]
});

//part of the prometheus module. There are defaults it will collect
// when this function is called
const metricsInterval = prometheus.collectDefaultMetrics();

//A custom metric, if we log prometheus we can see all available ones
const pageHits = new prometheus.Counter({
  name: 'page_hits',
  help: 'number of people who access the page'
});

//basically copied this. well see what it looks like hopefully
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500]
});

//need this for later in order to time things
app.use((req, res, next) => {
  res.locals.startEpoch = Date.now();
  next();
});

//typical middlewear
app.use(compression());
app.use(bodyParser.json());
app.use('/:id', express.static(path.join(__dirname + '/../client/dist')));

//MONGO
app.get('/api/details/:id', (req, res) => {
  //this increments our counter metric for pagehits
  pageHits.inc();
  mongoDBGetOne(req, res);
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

//middlewear at the end to catch responses. simple math gives us
// a response time
app.use((req, res, next) => {
  const responseTimeInMs = Date.now() - res.locals.startEpoch;

  httpRequestDurationMicroseconds
    .labels(req.method, req.route.path, res.statusCode)
    .observe(responseTimeInMs);
  next();
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
  clearInterval(metricsInterval);
  server.close((err) => {
    if (err) console.log(err);
    console.log('goodbye');
    process.exit(0);
  });
});
