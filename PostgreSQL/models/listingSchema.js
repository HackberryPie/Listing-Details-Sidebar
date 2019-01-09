const Sequelize = require('sequelize');
const sequelize = require('../postgreSqlConnect.js');

const User = sequelize.define('user', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  }
});

module.exports = User;
