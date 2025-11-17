const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const extractArticleData = require('../utils/article');
const sleep = require('../utils/sleep');
const { writeHeader, appendRow } = require('../utils/tsv');

module.exports = async function scrapeFlashInfo() {
    const url = 'https://www.flashinfo.fr/';
    const outputFile = 'flashinfo_news.tsv';

    writeHeader(outputFile, ['Title', 'Link', 'Category', 'Image', 'Date', 'Content']);

    try {
        const response = await got(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: { request: 10000 }
        });

        const $ = cheerio.load(response.body);
        const articles = $('div.row').toArray();
        const newsItems = [];

        for (const el of articles) {
            const titleEl = $(el).find('h2.entry-title a');
            const title = titleEl.text().trim();
            if (!title) continue;

            const link = titleEl.attr('href') || '';
            const category = $(el).find('span.meta-category a').text().trim() || 'N/A';
            const previewImage = $(el).find('div.herald-post-thumbnail img').attr('src') || 'N/A';

            let text = null;
            let image = previewImage;
            let date = null;

            try {
                await sleep();

                const articleData = await extractArticleData(link, {
                    text: 'div.col-md-12:nth-child(1)',
                    image: '.attachment-herald-lay-a',
                    date: 'time.entry-date'
                });

                if (articleData) {
                    text = articleData.text || '';
                    image = articleData.image || previewImage;
                    date = articleData.date || '';
                }
            } catch (err) {
                console.warn(`Ошибка загрузки статьи (${link}): ${err.message}`);
            }

            appendRow(outputFile, [
                title,
                link,
                category,
                image,
                date || '',
                text || ''
            ]);

            newsItems.push({
                title,
                link,
                category,
                image,
                date,
                content: text,
                source: 'flashinfo.fr'
            });
        }

        if (newsItems.length) await News.bulkCreate(newsItems);
        console.log('flashinfo.fr: Данные сохранены в БД и TSV!');
    } catch (err) {
        console.error('Ошибка flashinfo.fr:', err.message);
    }
};
