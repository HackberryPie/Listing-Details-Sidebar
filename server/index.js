const express = require('express');
const router = require('./routes.js');
const prometheus = require('prom-client');
const winston = require('winston');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');

//this established mongo query connection
const loadConnection = require('./controllers/MongoDBController.js');

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

const pageHits = new prometheus.Counter({
  name: 'page_hits',
  help: 'number of people who access the page'
});

app.use(compression());
app.use(bodyParser.json());
app.use('/:id', express.static(path.join(__dirname + '/../client/dist')));

app.use('/', router);

app.get('/metrics', (req, res) => {
  res.set('Content-type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});

let port = 3012;
app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});
