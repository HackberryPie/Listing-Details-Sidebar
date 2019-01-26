const http = require('http');
const fs = require('fs');
const path = require('path');

let utilities = {};

utilities.getId = (url) => {
  const start = url.lastIndexOf('/') + 1;
  return url.substring(start, url.length);
};

utilities.isStaticRequest = (url) => {
  return url.includes('.');
};

utilities.timeToExpire = (id) => {
  let time = 60;
  if (id >= 0 && id <= 100) time = 300;
  const jitter = Math.floor(Math.random() * time);
  return time + jitter;
};

utilities.handleError = (err, res) => {
  console.log(err);
  res.writeHead(500);
  res.write('ERROR 500: Internal Server Error');
  res.end();
  return;
};

utilities.handleGoodResponse = (data, res) => {
  res.writeHead(200);
  res.write(data);
  res.end();
  return;
};
utilities.handleInvalidId = (id, res) => {
  res.writeHead(404);
  res.write('ERROR 404: Invalid Lookup');
  res.end();
  return;
};

utilities.staticFileCache = {};

utilities.serveStatic = (basePath, req, res) => {
  const resolvedBase = path.resolve(basePath);
  const safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
  const fileLoc = path.join(resolvedBase, safeSuffix);

  if (utilities.staticFileCache[fileLoc] !== undefined) {
    return utilities.handleGoodResponse(
      utilities.staticFileCache[fileLoc],
      res
    );
  }

  fs.readFile(fileLoc, (err, data) => {
    if (err) return handleError(err, res);

    utilities.staticFileCache[fileLoc] = data;
    return utilities.handleGoodResponse(data, res);
  });
};

utilities.html = undefined;
//'./client/dist/index.html'

utilities.serveHTML = (location, res) => {
  if (utilities.html !== undefined) {
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.write(utilities.html);
    res.end();
    return;
  } else {
    fs.readFile(location, (err, data) => {
      if (err) return utilities.handleError(err, res);
      utilities.html = data;
      res.writeHead(200, { 'Content-type': 'text/html' });
      res.write(data);
      res.end();
      return;
    });
  }
};

utilities.startServer = (port, requestHandler) => {
  return http.createServer(requestHandler).listen(port, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('listening on port: ' + port);
    }
  });
};

module.exports = utilities;
