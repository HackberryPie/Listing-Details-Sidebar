const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGOURI;

let getConnection = () => {
  return MongoClient.connect(url)
    .then((db) => db)
    .catch((err) => {
      console.log(err);
    });
};

module.exports = getConnection();
