const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const { writeHeader, appendRow } = require('../utils/tsv');

module.exports = async function scrapeActualite() {
    const url = 'https://www.actualite-fr.com/';
    const outputFile = 'actualite_news.tsv';
    writeHeader(outputFile, ['Title', 'Link', 'Image', 'Date']);

    try {
        const response = await got(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.body);
        const newsItems = [];

        $('div.td_module_flex').each((i, el) => {
            const titleEl = $(el).find('h3.entry-title a');
            const title = titleEl.text().trim() || 'N/A';
            const link = titleEl.attr('href') || 'N/A';
            const image = $(el).find('span.entry-thumb').attr('data-img-url') || 'N/A';
            const dateStr = $(el).find('time.entry-date').attr('datetime');
            const date = dateStr ? new Date(dateStr) : null;

            appendRow(outputFile, [title, link, image, date || 'N/A']);
            newsItems.push({ title, link, image, date, source: 'actualite-fr.com' });
        });

        if (newsItems.length) await News.bulkCreate(newsItems);
        console.log('actualite-fr.com: Данные сохранены в БД и TSV!');
    } catch (err) {
        console.error('Ошибка actualite-fr.com:', err.message);
    }
};
