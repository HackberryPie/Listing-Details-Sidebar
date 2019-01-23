const express = require('express');
const { performance } = require('perf_hooks');
const fs = require('fs');

const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');

const mongoDBGetOne = require('./controllers/MongoDBController.js');

const app = express();

let metrics = {
  timeForHTML: []
};
let start;

app.use((req, res, next) => {
  start = performance.now();
  next();
});
app.use(compression());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/../client/dist')));

app.get('/api/details/:id', (req, res) => {
  const { id } = req.params;
  mongoDBGetOne(id, (data) => {
    res.send([data]);
  });
});

app.get('/metrics', (req, res) => {
  let sum = 0;
  metrics.timeForHTML.forEach((elem) => (sum += elem));
  let average = sum / metrics.timeForHTML.length;

  res.send(average.toString());
});

let html;

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/dist/index.html'));
  metrics.timeForHTML.push(performance.now() - start);
});

let port = 3012;

fs.readFile('./client/dist/index.html', (err, data) => {
  if (err) console.log(err);
  html = data;
  app.listen(port, () =>
    console.log(`server running at: http://localhost:${port}`)
  );
});

process.on('SIGTERM', () => {
  // clearInterval(metricsInterval);
  server.close((err) => {
    if (err) console.log(err);
    console.log('yo');
    process.exit(0);
  });
});
