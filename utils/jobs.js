const sequelize = require('../db');
const JobRun = require('../models/JobRun');

async function claimRun(source) {
    return sequelize.transaction(async (t) => {
        const running = await JobRun.findOne({
            where: { source, status: 'running' },
            lock: t.LOCK.UPDATE,
            transaction: t
        });

        if (running) return null;


        return await JobRun.create({
            source,
            status: 'running',
            startedAt: new Date(),
            pid: process.pid
        }, {transaction: t});
    });
}

async function finishRun(runId, { status = 'success', message = null } = {}) {
    try {
        const values = { status, finishedAt: new Date() };
        if (message) values.message = message;
        await JobRun.update(values, { where: { id: runId } });
    } catch (err) {
        console.error('finishRun error:', err.message);
    }
}

module.exports = { claimRun, finishRun };
