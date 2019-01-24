const http = require('http');
const path = require('path');
const fs = require('fs');

const { performance } = require('perf_hooks');

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

const basePath = './client/dist';
const serveStatic = (req, res) => {
  const resolvedBase = path.resolve(basePath);
  const safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
  const fileLoc = path.join(resolvedBase, safeSuffix);

  if (staticFileCache[fileLoc] !== undefined) {
    res.statusCode = 200;
    res.write(staticFileCache[fileLoc]);
    return res.end();
  }

  fs.readFile(fileLoc, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.write('ERROR 404: Not found');
      return res.end();
    }

    staticFileCache[fileLoc] = data;

    res.statusCode = 200;
    res.write(data);
    return res.end();
  });
};

//note not handling bad requests at all here
// need to add later
const requestHandler = (req, res) => {
  const time = performance.now();
  prom.totalRequests.inc();
  const htmlTimer = htmlHist.startTimer();
  const statTimer = statHist.startTimer();
  const dataTimer = dataHist.startTimer();

  if (req.url.includes('metrics')) {
    return prom.serveMetrics(req, res);
  } else if (req.url.includes('loaderio-f0337bc72e02d581ff9c52de594a4351')) {
    res.write('loaderio-f0337bc72e02d581ff9c52de594a4351');
    return res.end();
  } else if (req.url.includes('/api/details/')) {
    dbGetOne(getId(req.url), (err, data) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end();
        return;
      }

      res.writeHead(200);
      res.write(JSON.stringify([data]));
      res.end();

      // console.log('database:', performance.now() - time);
      prom.histogramLabels(dataHist, req, res);

      return dataTimer();
    });
  } else if (isStaticRequest(req.url)) {
    serveStatic(req, res);

    // console.log('staticFile:', performance.now() - time);
    prom.histogramLabels(statHist, req, res);
    return statTimer();
  } else {
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.write(html);
    res.end();

    // console.log('html:', performance.now() - time);
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
