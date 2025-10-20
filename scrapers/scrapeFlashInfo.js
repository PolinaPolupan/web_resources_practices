const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const { writeHeader, appendRow } = require('../utils/tsv');

module.exports = async function scrapeFlashInfo() {
    const url = 'https://www.flashinfo.fr/';
    const outputFile = 'flashinfo_news.tsv';
    writeHeader(outputFile, ['Title', 'Link', 'Category', 'Image', 'Excerpt']);

    try {
        const response = await got(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.body);
        const newsItems = [];

        $('div.row').each((i, el) => {
            const titleEl = $(el).find('h2.entry-title a');
            const title = titleEl.text().trim() || 'N/A';
            const link = titleEl.attr('href') || 'N/A';
            const category = $(el).find('span.meta-category a').text().trim() || 'N/A';
            const image = $(el).find('div.herald-post-thumbnail img').attr('src') || 'N/A';
            const excerpt = $(el).find('div.entry-content p').text().trim() || 'N/A';

            appendRow(outputFile, [title, link, category, image, excerpt]);
            newsItems.push({ title, link, category, image, excerpt, source: 'flashinfo.fr' });
        });

        if (newsItems.length) await News.bulkCreate(newsItems);
        console.log('flashinfo.fr: Данные сохранены в БД и TSV!');
    } catch (err) {
        console.error('Ошибка flashinfo.fr:', err.message);
    }
};
