const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const News = sequelize.define('News', {
    title: { type: DataTypes.TEXT, allowNull: true },
    link: { type: DataTypes.TEXT, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: true },
    image: { type: DataTypes.TEXT, allowNull: true },
    excerpt: { type: DataTypes.TEXT, allowNull: true },
    date: { type: DataTypes.TEXT, allowNull: true },
    source: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'news',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['link', 'source']
        }
    ]
});


module.exports = News;
