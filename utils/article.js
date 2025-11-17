const got = require('got').default;
const cheerio = require('cheerio');

module.exports = async function extractArticleData(url, selectors = {}) {
    try {
        const response = await got(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: {
                request: 100
            },
            retry: {
                limit: 0
            }
        });

        const $ = cheerio.load(response.body);

        const text = selectors.text ? $(selectors.text).text().trim() : '';
        const image = selectors.image ? $(selectors.image).attr('src') : '';
        const date = selectors.date ? $(selectors.date).text().trim() : '';

        return { text, image, date };
    } catch (err) {
        console.error('Ошибка загрузки статьи:', url, err.message);
        return { text: '', image: '', date: '' };
    }
};
