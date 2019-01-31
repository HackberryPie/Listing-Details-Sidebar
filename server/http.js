const http = require('http');
const path = require('path');
const fs = require('fs');

const dbGetOne = require('./controllers/MongoDBController.js');
const { performance } = require('perf_hooks');

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
  //console.log(req.url);
  const time = performance.now();
  const id = getId(req.url);

  if (req.url.includes('loaderio-9a0cfa999a746a16178738e7dfcf3aaf')) {
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
      //console.log('it took', performance.now() - time, 'to get the data');
      return;
    });
  } else if (isStaticRequest(req.url)) {
    serveStatic(req, res);
    return;
  } else {
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.write(html);
    res.end();
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
