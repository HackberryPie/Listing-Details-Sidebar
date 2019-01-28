const http = require('http');
const path = require('path');
const fs = require('fs');

const { performance } = require('perf_hooks');

const dbGetMany = require('./controllers/MongoDBController.js');

let html;
let staticFileCache = {};

let requestBatch = [];

const newRequest = (id, res) => {
  if (requestBatch.length < 25) {
    let currentRequest = {};
    currentRequest.id = id;
    currentRequest.res = res;
    requestBatch.push(currentRequest);
  }
};

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

  if (req.url.includes('metrics')) {
    return prom.serveMetrics(req, res);
  } else if (req.url.includes('loaderio-f0337bc72e02d581ff9c52de594a4351')) {
    res.write('loaderio-f0337bc72e02d581ff9c52de594a4351');
    return res.end();
  } else if (req.url.includes('/api/details/')) {
    let batch = [
      { _id: getId(req.url) },
      { _id: 101 },
      { _id: 312 },
      { _id: 1323 },
      { _id: 101231 }
    ];
    let otherBatch = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '123123',
      '124',
      '1234',
      '65345',
      '92340',
      '8741',
      '990238',
      '27239',
      '974032',
      '123',
      '14156',
      '63451',
      '65',
      '9124550'
    ];
    //twice as long for 15x more data per query. This is what i neeeeeeeed.
    dbGetMany(otherBatch, (err, data) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end();
        return;
      }
      console.log('To get data:', performance.now() - time);
      res.writeHead(200);
      //res.write(JSON.stringify([data]));
      res.end();

      // console.log('database:', performance.now() - time);
      return;
    });
  } else if (isStaticRequest(req.url)) {
    serveStatic(req, res);

    // console.log('staticFile:', performance.now() - time);
    return;
  } else {
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.write(html);
    res.end();

    // console.log('html:', performance.now() - time);
    return;
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
