const prometheus = require('prom-client');

const prometheusExporter = {};

prometheusExporter.totalRequests = new prometheus.Counter({
  name: 'total_requests',
  help: 'number of times server recieves a request'
});

prometheusExporter.cacheSuccess = new prometheus.Counter({
  name: 'cache_success',
  help: 'number of times cache is successful'
});

prometheusExporter.dataSuccess = new prometheus.Counter({
  name: 'data_success',
  help: 'number of times data is requested successfully'
});

prometheusExporter.dataFailures = new prometheus.Counter({
  name: 'data_failures',
  help: 'number of times data is requested but errors'
});

prometheusExporter.dataInvalid = new prometheus.Counter({
  name: 'invalid_data_requests',
  help: 'number of times data is requested incorrectly'
});

prometheusExporter.successCount = new prometheus.Counter({
  name: 'status_code_200',
  help: 'number of successes in retrieving and sending data'
});

prometheusExporter.failureCount = new prometheus.Counter({
  name: 'status_code_500',
  help: 'number of failures in retrieving and sending data'
});

prometheusExporter.htmlDurationMicroseconds = new prometheus.Histogram({
  name: 'html_request_duration_ms',
  help: 'Duration of html requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.00025, 0.0005, 0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1]
});

prometheusExporter.dataRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'data_duration_ms',
  help: 'Duration of data requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.001, 0.0025, 0.05, 0.1, 0.25, 0.5, 1, 1.5, 2]
});

prometheusExporter.staticRequestDurationMicroseconds = new prometheus.Histogram(
  {
    name: 'static_file_duration_ms',
    help: 'Duration of static file requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.0001, 0.00025, 0.0005, 0.001, 0.0025, 0.005, 0.01, 0.025, 0.05]
  }
);

prometheusExporter.cacheRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'cache_get_duration_ms',
  help: 'Duration of cache retreival requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [
    0.00001,
    0.00005,
    0.0001,
    0.00025,
    0.0005,
    0.001,
    0.0025,
    0.005,
    0.01
  ]
});

prometheusExporter.histogramLabels = (histogram, req, res) => {
  return histogram.labels(req.method, res.route, res.statusCode);
};

prometheusExporter.serveMetrics = (req, res) => {
  res.writeHead(200, { 'Content-Type': prometheus.register.contentType });
  return res.end(prometheus.register.metrics());
};

module.exports = prometheusExporter;
