const prometheus = require('prom-client');

const prometheusExporter = {};

prometheusExporter.totalRequests = new prometheus.Counter({
  name: 'total_requests',
  help: 'number of times server recieves a request'
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

prometheusExporter.histogramLabels = (histogram, req, res) => {
  return histogram.labels(req.method, res.route, res.statusCode);
};

prometheusExporter.serveMetrics = (req, res) => {
  res.writeHead(200, { 'Content-Type': prometheus.register.contentType });
  return res.end(prometheus.register.metrics());
};

module.exports = prometheusExporter;
