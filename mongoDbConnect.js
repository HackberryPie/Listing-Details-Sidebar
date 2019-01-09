const mongoose = require('mongoose');
const uriString =
  process.env.MONGODB_URI ||
  'mongodb://localhost/listing-details?keepAlive=true&poolSize=30&autoReconnect=true&socketTimeoutMS=360000&connectTimeoutMS=360000';
mongoose.connect(uriString);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error'));
db.once('open', () => {
  console.log('Connection succeeded');
});

module.exports = db;
