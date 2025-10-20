const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const { writeHeader, appendRow } = require('../utils/tsv');

module.exports = async function scrapeLaDepeche() {
    const url = 'https://www.ladepeche.fr/';
    const outputFile = 'ladepeche_news.tsv';
    writeHeader(outputFile, ['Title', 'Link', 'Category', 'Image']);

    try {
        const response = await got(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.body);
        const newsItems = [];

        $('article').each((i, el) => {
            const titleEl = $(el).find('h3 a');
            const title = titleEl.text().trim();
            if (!title) return;

            const link = titleEl.attr('href') || '';
            const fullLink = link.startsWith('http') ? link : 'https://www.ladepeche.fr' + link;
            const category = $(el).find('.ArticleItem-category').text().trim() || 'N/A';
            const image = $(el).find('img').attr('src') || 'N/A';

            appendRow(outputFile, [title, fullLink, category, image]);
            newsItems.push({ title, link: fullLink, category, image, source: 'ladepeche.fr' });
        });

        if (newsItems.length) await News.bulkCreate(newsItems);
        console.log('ladepeche.fr: Данные сохранены в БД и TSV!');
    } catch (err) {
        console.error('Ошибка ladepeche.fr:', err.message);
    }
};
