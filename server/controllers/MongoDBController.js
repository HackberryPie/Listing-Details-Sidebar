const getConnection = require('../../MongoDB/MongoConnection.js');
const { performance } = require('perf_hooks');

let client;

getConnection
  .then((db) => {
    client = db.db('listing-details');
    console.log('connection to mongo established');
  })
  .catch((err) => {
    console.log(err);
  });

const retrieveOne = (req, res) => {
  const time = performance.now();
  const { id } = req.params;
  client.collection('listings').findOne({ _id: id }, (err, data) => {
    if (err) console.log(err);
    console.log('it took ' + (performance.now() - time) + ' to query mongo');
    console.log([data]);
    res.send([data]);
  });
};

module.exports = retrieveOne;
