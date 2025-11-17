const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const extractArticleData = require('../utils/article');
const sleep = require('../utils/sleep');
const { writeHeader, appendRow } = require('../utils/tsv');

module.exports = async function scrapeActualite() {
    const url = 'https://www.actualite-fr.com/';
    const outputFile = 'actualite_news.tsv';
    writeHeader(outputFile, ['Title', 'Link', 'Image', 'Date', 'Content']);

    try {
        const response = await got(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: { request: 10000 }
        });

        const $ = cheerio.load(response.body);
        const articles = $('div.td_module_flex').toArray();
        const newsItems = [];

        for (const el of articles) {
            const titleEl = $(el).find('h3.entry-title a');
            const title = titleEl.text().trim();
            if (!title) continue;

            const link = titleEl.attr('href') || '';
            const imagePreview = $(el).find('span.entry-thumb').attr('data-img-url') || 'N/A';

            let image = imagePreview;
            let text = null;
            let date = null;

            try {
                await sleep();

                const articleData = await extractArticleData(link, {
                    text: '.td-post-content',
                    image: '.td-post-content img',
                    date: '.entry-date'
                });

                if (articleData) {
                    text = articleData.text || '';
                    image = articleData.image || imagePreview;
                    date = articleData.date || '';
                }
            } catch (err) {
                console.warn(`Ошибка получения статьи (${link}): ${err.message}`);
            }

            appendRow(outputFile, [
                title,
                link,
                image,
                date || '',
                text || ''
            ]);

            newsItems.push({
                title,
                link,
                image,
                date,
                content: text,
                source: 'actualite-fr.com'
            });
        }

        if (newsItems.length) await News.bulkCreate(newsItems);
        console.log('actualite-fr.com: Данные сохранены в БД и TSV!');
    } catch (err) {
        console.error('Ошибка actualite-fr.com:', err.message);
    }
};
