const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const extractArticleData = require('../utils/article');
const sleep = require('../utils/sleep');
const { writeHeader, appendRow } = require('../utils/tsv');

module.exports = async function scrape20Minutes() {
    const url = 'https://www.20minutes.fr/';
    const outputFile = '20minutes_news.tsv';
    writeHeader(outputFile, ['Title', 'Link', 'Category', 'Image', 'Date', 'Content']);

    try {
        const response = await got(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: { request: 10000 } });
        const $ = cheerio.load(response.body);

        const articles = $('article.c-card-container').toArray();
        const newsItems = [];

        for (const el of articles) {
            const titleEl = $(el).find('div.c-card-title a');
            const title = titleEl.text().trim();
            if (!title) continue;

            const link = titleEl.attr('href') || '';
            const fullLink = link.startsWith('http') ? link : 'https://www.20minutes.fr' + link;
            const category = $(el).find('span.c-label').text().trim() || 'N/A';
            const previewImage = $(el).find('div.c-card-img__inner img').attr('src') || 'N/A';

            let text = null, image = previewImage, date = null;

            try {
                await sleep();
                const articleData = await extractArticleData(fullLink, {
                    text: '.o-paper__content',
                    image: 'figure.c-media:nth-child(1) > div:nth-child(1)',
                    date: 'p.mt-xxs-2\\@xs > time:nth-child(2)'
                });
                if (articleData) {
                    text = articleData.text;
                    image = articleData.image || image;
                    date = articleData.date;
                }
            } catch (err) {
                console.warn(`Не удалось получить содержимое статьи (${fullLink}), пропускаем текст. Ошибка: ${err.message}`);
            }

            appendRow(outputFile, [title, fullLink, category, image, date || '', text || '']);

            newsItems.push({
                title,
                link: fullLink,
                category,
                image,
                source: '20minutes.fr',
                date,
                content: text
            });
        }

        if (newsItems.length) await News.bulkCreate(newsItems);
        console.log('20minutes.fr: Данные сохранены в БД и TSV!');
    } catch (err) {
        console.error('Ошибка 20minutes.fr:', err.message);
    }
};
