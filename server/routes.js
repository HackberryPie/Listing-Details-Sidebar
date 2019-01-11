const express = require('express');
const listingController = require('../server/controllers/listingController');
const getCouchData = require('./controllers/CouchDBController.js');
const router = express.Router();

// router.get('/api/details/:id', listingController.retrieveOne);
router.get('/api/details/:id', getCouchData);

module.exports = router;
