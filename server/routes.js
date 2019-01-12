const express = require('express');
const router = express.Router();

const mongoDBGetOne = require('./controllers/MongoDBController.js');
const couchDataGetOne = require('./controllers/CouchDBController.js');
const postgreSQLGetOne = require('./controllers/PostgreSQLController.js');

//MONGO
// router.get('/api/details/:id', mongoDBGetOne);

//POSTGRESQL
// router.get('/api/details/:id', postgreSQLGetOne);

//COUCHDB
router.get('/api/details/:id', couchDataGetOne);

module.exports = router;
