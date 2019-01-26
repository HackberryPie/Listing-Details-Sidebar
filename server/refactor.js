const util = require('./utilities/serverUtility.js');
const dbGetOne = require('./controllers/MongoDBController.js');
const prom = require('./prometheus/prometheus.js');
const redClient = require('./redis/redis.js');

const htmlHist = prom.htmlDurationMicroseconds;
const dataHist = prom.dataRequestDurationMicroseconds;
const cacheHist = prom.cacheRequestDurationMicroseconds;
const statHist = prom.staticRequestDurationMicroseconds;

const requestHandler = (req, res) => {
  const id = util.getId(req.url);

  prom.totalRequests.inc();
  const htmlTimer = htmlHist.startTimer();
  const statTimer = statHist.startTimer();
  const dataTimer = dataHist.startTimer();
  const cacheTimer = cacheHist.startTimer();

  if (req.url.includes('metrics')) {
    prom.serveMetrics(req, res);
    return;
  } else if (req.url.includes('loaderio-9a0cfa999a746a16178738e7dfcf3aaf')) {
    return util.handleGoodResponse(
      'loaderio-9a0cfa999a746a16178738e7dfcf3aaf',
      res
    );
  } else if (req.url.includes('/api/details/')) {
    redClient.get(id, (err, cachedData) => {
      if (err) {
        util.handleError(err, res);
        prom.dataFailures.inc();
        return;
      }
      if (cachedData !== null) {
        util.handleGoodResponse(cachedData, res);
        prom.cacheSuccess.inc();
        prom.dataSuccess.inc();
        cacheTimer();
        return;
      }

      dbGetOne(id, (err, data) => {
        if (err) {
          util.handleError(err, res);
          prom.dataFailures.inc();
          return;
        }
        if (data === null) {
          util.handleInvalidId(id, res);
          prom.dataInvalid.inc();
          return;
        }
        util.handleGoodResponse(JSON.stringify([data]), res);

        redClient.setex(id, util.timeToExpire(id), JSON.stringify([data]));

        prom.dataSuccess.inc();
        prom.histogramLabels(dataHist, req, res);
        dataTimer();
        return;
      });
    });
  } else if (util.isStaticRequest(req.url)) {
    util.serveStatic('./client/dist', req, res);
    prom.histogramLabels(statHist, req, res);
    statTimer();
    return;
  } else {
    util.serveHTML('./client/dist/index.html', res);
    prom.histogramLabels(htmlHist, req, res);
    htmlTimer();
    return;
  }
};

let port = 3012;
util.startServer(port, requestHandler);
