const MongoClient = require('mongodb').MongoClient;
const url =
  'mongodb://localhost/listing-details?keepAlive=true&poolSize=30&autoReconnect=true&socketTimeoutMS=360000&connectTimeoutMS=360000';

let getConnection = () => {
  return MongoClient.connect(url)
    .then((db) => db)
    .catch((err) => {
      console.log(err);
    });
};

module.exports = getConnection();
