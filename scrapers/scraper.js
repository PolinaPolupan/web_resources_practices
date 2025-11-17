const got = require('got').default;
const cheerio = require('cheerio');
const News = require('../models/News');
const extractArticleData = require('../utils/article');
const sleep = require('../utils/sleep');
const { writeHeader, appendRow } = require('../utils/tsv');

async function scrapeSite(config) {
    const {
        url,
        outputFile,
        listSelector,
        titleSelector,
        linkSelector,
        categorySelector,
        imageSelector,
        joinUrl,
        articleSelectors,
        source
    } = config;

    writeHeader(outputFile, ['Title', 'Link', 'Category', 'Image', 'Date', 'Content']);

    try {
        const response = await got(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: { request: 10000 }
        });

        const $ = cheerio.load(response.body);
        const articles = $(listSelector).toArray();
        const newsItems = [];

        for (const el of articles) {
            const title = $(el).find(titleSelector).text().trim();
            if (!title) continue;

            const rawLink = $(el).find(linkSelector).attr('href') || '';
            const fullLink = rawLink.startsWith('http') ? rawLink : joinUrl + rawLink;
            const category = categorySelector ? $(el).find(categorySelector).text().trim() : 'N/A';
            const previewImage = imageSelector ? $(el).find(imageSelector).attr('src') || 'N/A' : 'N/A';

            let text = null, image = previewImage, date = null;

            try {
                await sleep();

                const article = await extractArticleData(fullLink, articleSelectors);

                if (article) {
                    text = article.text || '';
                    date = article.date || '';
                    if (article.image) image = article.image;
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
                source
            });
        }

        if (newsItems.length) await News.bulkCreate(newsItems, { ignoreDuplicates: true });
        console.log(`${source}: данные сохранены!`);

    } catch (err) {
        console.error(`Ошибка ${source}:`, err.message);
    }
}

module.exports = scrapeSite;
