const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const extractArticleData = require('../utils/article');
const { writeHeader, appendRow } = require('../utils/tsv');

module.exports = async function scrapeLaDepeche() {
    const url = 'https://www.ladepeche.fr/';
    const outputFile = 'ladepeche_news.tsv';

    writeHeader(outputFile, ['Title', 'Link', 'Category', 'Image', 'Date', 'Content']);

    try {
        const response = await got(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.body);

        const articles = $('article').toArray();
        const newsItems = [];

        for (const el of articles) {
            const titleEl = $(el).find('h3 a');
            const title = titleEl.text().trim();
            if (!title) continue;

            const link = titleEl.attr('href') || '';
            const fullLink = link.startsWith('http') ? link : 'https://www.ladepeche.fr' + link;

            const category = $(el).find('.ArticleItem-category').text().trim() || 'N/A';
            const previewImage = $(el).find('img').attr('src') || 'N/A';

            const { text, image, date } = await extractArticleData(fullLink, {
                text: '.article-full__left-col',
                image: 'img.responsive-img:nth-child(4)',
                date: '.article-full__infos-dates'
            });

            appendRow(outputFile, [
                title,
                fullLink,
                category,
                image || previewImage,
                date || '',
                text || ''
            ]);

            newsItems.push({
                title,
                link: fullLink,
                category,
                image: image || previewImage,
                source: 'ladepeche.fr',
                date,
                content: text
            });
        }

        if (newsItems.length) await News.bulkCreate(newsItems);
        console.log('ladepeche.fr: Данные сохранены в БД и TSV!');
    } catch (err) {
        console.error('Ошибка ladepeche.fr:', err.message);
    }
};
