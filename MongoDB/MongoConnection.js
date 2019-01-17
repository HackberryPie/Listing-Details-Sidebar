const MongoClient = require('mongodb').MongoClient;
const url =
  process.env.MONGOURI !== undefined
    ? process.env.MONGOURI
    : 'mongodb://localhost:27017@listing-details';

let getConnection = () => {
  return MongoClient.connect(url)
    .then((db) => db)
    .catch((err) => {
      console.log(err);
    });
};

module.exports = getConnection();
