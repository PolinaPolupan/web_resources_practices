const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const { writeHeader, appendRow } = require('../utils/tsv');

module.exports = async function scrapeFranceMatin() {
    const url = 'https://www.francematin.info/';
    const outputFile = 'francematin_news.tsv';
    writeHeader(outputFile, ['Title', 'Link', 'Category', 'Image']);

    try {
        const response = await got(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.body);
        const newsItems = [];

        $('div.petit').each((i, el) => {
            const linkEl = $(el).find('div.art-title a');
            const link = linkEl.attr('href') || '';
            const fullLink = link.startsWith('http') ? link : 'https://www.francematin.info' + link;
            const category = linkEl.find('span').text().trim() || 'N/A';
            const title = linkEl.find('div.catTitle').text().trim() || 'N/A';
            const image = $(el).find('div.art-img img').attr('src') || 'N/A';

            if (title !== 'N/A') {
                appendRow(outputFile, [title, fullLink, category, image]);
                newsItems.push({ title, link: fullLink, category, image, source: 'francematin.info' });
            }
        });

        if (newsItems.length) await News.bulkCreate(newsItems);
        console.log('francematin.info: Данные сохранены в БД и TSV!');
    } catch (err) {
        console.error('Ошибка francematin.info:', err.message);
    }
};
