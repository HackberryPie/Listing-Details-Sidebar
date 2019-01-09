const Sequelize = require('sequelize');
const sequelize = new Sequelize('listing-details', 'postgres', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection established...');
  })
  .catch((err) => {
    console.log('uh oh: ', err);
  });

module.exports = sequelize;
