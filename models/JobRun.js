const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const JobRun = sequelize.define('JobRun', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    source: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('pending','running','success','failed','skipped'), allowNull: false, defaultValue: 'pending' },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    finishedAt: { type: DataTypes.DATE, allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: true },
    pid: { type: DataTypes.INTEGER, allowNull: true }
}, {
    tableName: 'job_runs',
    timestamps: false
});

module.exports = JobRun;
