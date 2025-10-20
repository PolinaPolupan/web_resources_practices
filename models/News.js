const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const News = sequelize.define('News', {
    title: { type: DataTypes.TEXT, allowNull: true },
    link: { type: DataTypes.TEXT, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: true },
    image: { type: DataTypes.TEXT, allowNull: true },
    excerpt: { type: DataTypes.TEXT, allowNull: true },
    date: { type: DataTypes.DATE, allowNull: true },
    source: { type: DataTypes.STRING, allowNull: false }
}, {
    tableName: 'news',
    timestamps: false
});

module.exports = News;
