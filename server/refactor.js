const util = require('./utilities/serverUtility.js');
const dbGetOne = require('./controllers/MongoDBController.js');
const prom = require('./prometheus/prometheus.js');
const redClient = require('./redis/redis.js');

const htmlHist = prom.htmlDurationMicroseconds;
const dataHist = prom.dataRequestDurationMicroseconds;
const cacheHist = prom.cacheRequestDurationMicroseconds;
const statHist = prom.staticRequestDurationMicroseconds;

let batch = [];
let req = {
  id: null
};

const requestHandler = (req, res) => {
  const id = util.getId(req.url);

  prom.totalRequests.inc();
  const htmlTimer = htmlHist.startTimer();
  const statTimer = statHist.startTimer();
  const dataTimer = dataHist.startTimer();
  const cacheTimer = cacheHist.startTimer();

  if (req.url.includes('metrics')) {
    // ==========================
    // ===    SERVE METRICS   ===
    // ==========================
    prom.serveMetrics(req, res);
    return;
  } else if (req.url.includes('loaderio-9a0cfa999a746a16178738e7dfcf3aaf')) {
    // ==========================
    // ===    LOADERIO INFO   ===
    // ==========================
    return util.handleGoodResponse(
      'loaderio-9a0cfa999a746a16178738e7dfcf3aaf',
      res
    );
  } else if (req.url.includes('/api/details/')) {
    // ==========================
    // ===     SERVE DATA     ===
    // ==========================
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

      const request = {};
      request.id = id;
      request.res = res;

      if (batch.length < 15) {
        batch.push(request);
      }

      if (batch.length >= 15) {
        let dbFormat = batch.map((request) => {
          return request.id;
        });

        dbGetMany(dbFormat, (err, data) => {
          if (err) {
            for (let i = 0; i < batch.length; i++) {
              util.handleError(err, batch[i].res);
            }
          }

          for (let i = 0; i < data.length; i++) {
            if (batch[i][data[i][_id]] !== undefined)
              util.handleGoodResponse(data[i][_id], batch[i][data[i][_id]]);
          }
        });
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
    // ==========================
    // === SERVE STATIC FILES ===
    // ==========================
    util.serveStatic('./client/dist', req, res);
    prom.histogramLabels(statHist, req, res);
    statTimer();
    return;
  } else {
    // ==========================
    // ===     SERVE HTML     ===
    // ==========================
    util.serveHTML('./client/dist/index.html', res);
    prom.histogramLabels(htmlHist, req, res);
    htmlTimer();
    return;
  }
};

let port = 3012;
util.startServer(port, requestHandler);
