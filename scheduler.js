const cron = require('node-cron');
const sequelize = require('./db');
const { claimRun, finishRun } = require('./utils/jobs');

const scrape20Minutes = require('./scrapers/scrape20minutes');
const scrapeLaDepeche = require('./scrapers/scrapeLaDepeche');
const scrapeFranceMatin = require('./scrapers/scrapeFranceMatin');
const scrapeFlashInfo = require('./scrapers/scrapeFlashInfo');
const scrapeActualite = require('./scrapers/scrapeActualite');

const tasks = [
    { name: '20minutes', cron: '0 */1 * * * *', fn: scrape20Minutes, source: '20minutes. fr' },
    { name: 'ladepeche', cron: '30 */1 * * * *', fn: scrapeLaDepeche, source: 'ladepeche.fr' },
    { name: 'francematin', cron: '1 */1 * * * *', fn: scrapeFranceMatin, source: 'francematin.info' },
    { name: 'flashinfo', cron: '2 */1 * * * *', fn: scrapeFlashInfo, source: 'flashinfo.fr' },
    { name: 'actualite', cron: '3 */1 * * * *', fn: scrapeActualite, source: 'actualite-fr. com' }
];

function runTaskWithClaim(task) {
    setImmediate(async () => {
        console.log(`[${new Date().toISOString()}] Trying to claim ${task.source}`);
        const run = await claimRun(task.source);
        if (! run) {
            console.log(`Skip ${task.source} — already running. `);
            return;
        }

        const runId = run.id;

        try {
            await task.fn();
            await finishRun(runId, { status: 'success' });
            console. log(`${task.source} finished successfully`);
        } catch (err) {
            console.error(`${task.source} failed:`, err.message);
            await finishRun(runId, { status: 'failed', message: String(err. message) });
        }
    });
}

async function startScheduler() {
    try {
        await sequelize.authenticate();
        console. log('DB connected (scheduler).');

        await new Promise(resolve => setTimeout(resolve, 2000));

        tasks.forEach(t => {
            cron.schedule(t.cron, () => {
                runTaskWithClaim(t);
            }, {
                scheduled: true,
                timezone: 'Europe/Paris'
            });
            console.log(`Scheduled ${t.name} -> ${t. cron}`);
        });

        console.log('Scheduler started.  Waiting for next scheduled time...');

    } catch (err) {
        console. error('Scheduler init error:', err.message);
        process.exit(1);
    }
}

startScheduler();