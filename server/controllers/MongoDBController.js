const getConnection = require('../../MongoDB/MongoConnection.js');

let client;

getConnection
  .then((db) => {
    client = db.db('listing-details');
    console.log('connection to mongo established');
  })
  .catch((err) => {
    console.log(err);
  });

const retrieveOne = (id, cb) => {
  client.collection('listings').findOne({ _id: id }, cb);
};

const getMany = (batch, cb) => {
  client
    .collection('listings')
    .find({ _id: { $in: batch } })
    .toArray(cb);
};

module.exports = retrieveOne;
