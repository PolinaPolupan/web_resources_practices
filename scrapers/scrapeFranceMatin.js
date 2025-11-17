const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const extractArticleData = require('../utils/article');
const sleep = require('../utils/sleep');
const { writeHeader, appendRow } = require('../utils/tsv');

module.exports = async function scrapeFranceMatin() {
    const url = 'https://www.francematin.info/';
    const outputFile = 'francematin_news.tsv';

    writeHeader(outputFile, ['Title', 'Link', 'Category', 'Image', 'Date', 'Content']);

    try {
        const response = await got(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: { request: 10000 }
        });

        const $ = cheerio.load(response.body);
        const articles = $('div.petit').toArray();
        const newsItems = [];

        for (const el of articles) {
            const linkEl = $(el).find('div.art-title a');
            const link = linkEl.attr('href') || '';
            const fullLink = link.startsWith('http')
                ? link
                : 'https://www.francematin.info' + link;

            const category = linkEl.find('span').text().trim() || 'N/A';
            const title = linkEl.find('div.catTitle').text().trim();
            if (!title) continue;

            const previewImage = $(el).find('div.art-img img').attr('src') || 'N/A';

            let text = null;
            let image = previewImage;
            let date = null;

            try {
                await sleep();

                const articleData = await extractArticleData(fullLink, {
                    text: 'div.col-lg-9:nth-child(1)',
                    image: '.no-lazy',
                    date: 'div.blog-single-date:nth-child(4)'
                });

                if (articleData) {
                    text = articleData.text || '';
                    image = articleData.image || previewImage;
                    date = articleData.date || '';
                }
            } catch (err) {
                console.warn(`Ошибка загрузки статьи (${fullLink}): ${err.message}`);
            }

            appendRow(outputFile, [
                title,
                fullLink,
                category,
                image,
                date || '',
                text || ''
            ]);

            newsItems.push({
                title,
                link: fullLink,
                category,
                image,
                date,
                content: text,
                source: 'francematin.info'
            });
        }

        if (newsItems.length) await News.bulkCreate(newsItems);
        console.log('francematin.info: Данные сохранены в БД и TSV!');
    } catch (err) {
        console.error('Ошибка francematin.info:', err.message);
    }
};
