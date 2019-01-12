const express = require('express');
const router = require('./routes.js');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');

//this established mongo connection and leaves open
const loadConnection = require('./controllers/MongoDBController.js');

//set _db var

// const db = require('../MongoDB/MongoConnection.js').then((db) => {
//   console.log(db);
// });

//const client = db.db('listing-details');

const app = express();

app.use(compression());
app.use(bodyParser.json());
app.use('/:id', express.static(path.join(__dirname + '/../client/dist')));

app.use('/', router);

let port = 3012;
app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});
