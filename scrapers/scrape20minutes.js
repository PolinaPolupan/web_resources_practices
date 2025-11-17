const scrapeSite = require('./scraper');

module.exports = () => scrapeSite({
    url: 'https://www.20minutes.fr/',
    outputFile: '20minutes_news.tsv',
    source: '20minutes.fr',

    listSelector: 'article.c-card-container',
    titleSelector: 'div.c-card-title a',
    linkSelector: 'div.c-card-title a',
    categorySelector: 'span.c-label',
    imageSelector: 'div.c-card-img__inner img',

    joinUrl: 'https://www.20minutes.fr',

    articleSelectors: {
        text: '.o-paper__content',
        image: 'figure.c-media:nth-child(1) > div:nth-child(1)',
        date: 'p.mt-xxs-2\\@xs > time:nth-child(2)'
    }
});
