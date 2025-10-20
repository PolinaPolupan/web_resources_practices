const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const { writeHeader, appendRow } = require('../utils/tsv');

module.exports = async function scrape20Minutes() {
    const url = 'https://www.20minutes.fr/';
    const outputFile = '20minutes_news.tsv';
    writeHeader(outputFile, ['Title', 'Link', 'Category', 'Image']);

    try {
        const response = await got(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.body);
        const newsItems = [];

        $('article.c-card-container').each((i, el) => {
            const titleEl = $(el).find('div.c-card-title a');
            const title = titleEl.text().trim();
            const link = titleEl.attr('href') || '';
            const fullLink = link.startsWith('http') ? link : 'https://www.20minutes.fr' + link;
            const category = $(el).find('span.c-label').text().trim() || 'N/A';
            const image = $(el).find('div.c-card-img__inner img').attr('src') || 'N/A';

            appendRow(outputFile, [title, fullLink, category, image]);
            newsItems.push({ title, link: fullLink, category, image, source: '20minutes.fr' });
        });

        if (newsItems.length) await News.bulkCreate(newsItems);
        console.log('20minutes.fr: Данные сохранены в БД и TSV!');
    } catch (err) {
        console.error('Ошибка 20minutes.fr:', err.message);
    }
};
