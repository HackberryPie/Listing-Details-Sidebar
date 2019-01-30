const http = require('http');
const path = require('path');
const fs = require('fs');

const dbGetOne = require('./controllers/MongoDBController.js');

const prom = require('./prometheus/prometheus.js');

const htmlHist = prom.htmlDurationMicroseconds;
const dataHist = prom.dataRequestDurationMicroseconds;
const statHist = prom.staticRequestDurationMicroseconds;

let html;
let staticFileCache = {};

const getId = (url) => {
  const start = url.lastIndexOf('/') + 1;
  return url.substring(start, url.length);
};

const isStaticRequest = (url) => {
  return url.includes('.');
};

const handleError = (err, res) => {
  console.log(err);
  res.writeHead(500);
  res.write('ERROR 500: Internal Server Error');
  res.end();
  return;
};

const handleGoodResponse = (data, res) => {
  res.writeHead(200);
  res.write(data);
  res.end();
  return;
};
const handleInvalidId = (id, res) => {
  res.writeHead(404);
  res.write('ERROR 404: Invalid Lookup');
  res.end();
  return;
};

const basePath = './client/dist';
const serveStatic = (req, res) => {
  const resolvedBase = path.resolve(basePath);
  const safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
  const fileLoc = path.join(resolvedBase, safeSuffix);

  console.log(
    'base',
    resolvedBase,
    'safe suffix',
    safeSuffix,
    'fileLoc',
    fileLoc
  );

  if (staticFileCache[fileLoc] !== undefined) {
    res.statusCode = 200;
    res.write(staticFileCache[fileLoc]);
    res.end();
    return;
  }

  fs.readFile(fileLoc, (err, data) => {
    if (err) return handleError(err, res);

    staticFileCache[fileLoc] = data;
    res.statusCode = 200;
    res.write(data);
    res.end();
    return;
  });
};

const requestHandler = (req, res) => {
  const id = getId(req.url);

  prom.totalRequests.inc();
  const htmlTimer = htmlHist.startTimer();
  const statTimer = statHist.startTimer();
  const dataTimer = dataHist.startTimer();

  if (req.url.includes('metrics')) {
    prom.serveMetrics(req, res);
    return;
  } else if (req.url.includes('loaderio-9a0cfa999a746a16178738e7dfcf3aaf')) {
    res.write('loaderio-9a0cfa999a746a16178738e7dfcf3aaf');
    res.end();
    return;
  } else if (req.url.includes('/api/details/')) {
    dbGetOne(id, (err, data) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end();
        return;
      }

      if (data === null) return handleInvalidId(id, res);

      res.writeHead(200);
      res.write(JSON.stringify([data]));
      res.end();

      prom.histogramLabels(dataHist, req, res);
      return dataTimer();
    });
  } else if (isStaticRequest(req.url)) {
    serveStatic(req, res);
    prom.histogramLabels(statHist, req, res);
    return statTimer();
  } else {
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.write(html);
    res.end();
    prom.histogramLabels(htmlHist, req, res);
    return htmlTimer();
  }
};

let port = 3012;
fs.readFile('./client/dist/index.html', (err, data) => {
  if (err) {
    console.log(err);
  } else {
    html = data;
    http.createServer(requestHandler).listen(port, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('listening on port: ' + port);
      }
    });
  }
});
