const MongoClient = require('mongodb').MongoClient;
const url = 'hello';

let getConnection = () => {
  return MongoClient.connect(url)
    .then((db) => db)
    .catch((err) => {
      console.log(err);
    });
};

module.exports = getConnection();
