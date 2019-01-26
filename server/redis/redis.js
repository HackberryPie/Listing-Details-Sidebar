const redis = require('redis');
const redisOptions = {
  host: process.env.REDISURI,
  port: process.env.REDISPORT
};
const redClient = redis.createClient(redisOptions);

redClient.on_connect(console.log('Cache ready...'));
redClient.on('error', (err) => console.log(err));

module.exports = redClient;
