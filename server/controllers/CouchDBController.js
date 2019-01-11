const nano = require('nano')('http://localhost:5985');
const db = nano.db.use('listing-details');
const { performance } = require('perf_hooks');

const getCouchData = (req, res) => {
  db.get(req.params.id)
    .then((data) => {
      res.send([data]);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = getCouchData;
