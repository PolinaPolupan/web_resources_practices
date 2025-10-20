const sequelize = require('../db');
const scrape20Minutes = require('./scrape20minutes');
const scrapeLaDepeche = require('./scrapeLaDepeche');
const scrapeFranceMatin = require('./scrapeFranceMatin');
const scrapeFlashInfo = require('./scrapeFlashInfo');
const scrapeActualite = require('./scrapeActualite');
const { analyzeTSV } = require('../utils/tsv');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('База данных подключена!');

        await Promise.all([
            scrape20Minutes(),
            scrapeLaDepeche(),
            scrapeFranceMatin(),
            scrapeFlashInfo(),
            scrapeActualite()
        ]);

        console.log('Скрапинг завершен!');

        const datasets = [
            { file: '20minutes_news.tsv', hasDate: false },
            { file: 'ladepeche_news.tsv', hasDate: false },
            { file: 'francematin_news.tsv', hasDate: false },
            { file: 'flashinfo_news.tsv', hasDate: false },
            { file: 'actualite_news.tsv', hasDate: true }
        ];

        datasets.forEach(ds => {
            const stats = analyzeTSV(ds.file, ds.hasDate);
            console.log(`\nАнализ ${ds.file}:`);
            console.log(stats);
        });

    } catch (err) {
        console.error('Ошибка:', err);
    } finally {
        await sequelize.close();
    }
})();
