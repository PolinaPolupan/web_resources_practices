const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('newsdb', 'newsuser', 'newspass', {
    host: 'localhost',
    port: 5433,
    dialect: 'postgres',
    logging: false
});


module.exports = sequelize;
