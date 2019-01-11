const nano = require('nano')('http://localhost:5985');
const db = nano.db.use('listing-details');
const { performance } = require('perf_hooks');

const getCouchData = (req, res) => {
  let time = performance.now();
  db.get(req.params.id)
    .then((data) => {
      console.log(
        'it took ' + (performance.now() - time) + ' to get the data from couch'
      );
      res.send([data]);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = getCouchData;
