const MongoClient = require('mongodb').MongoClient;
const url =
  'mongodb://localhost/listing-details?keepAlive=true&poolSize=30&autoReconnect=true&socketTimeoutMS=360000&connectTimeoutMS=360000';

let _db;
const helpers = {
  connect: (cb) => {
    MongoClient.connect(
      url,
      (err, db) => {
        if (err) console.log(err);

        const client = db.db('listing-details');
        _db = client;

        return cb(err, client);
      }
    );
  },

  getDb: () => {
    if (_db === undefined) helpers.connect();
    return _db;
  }
};

module.exports = helpers;
