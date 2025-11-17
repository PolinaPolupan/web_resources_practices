const scrapeSite = require('./scraper');

module.exports = () => scrapeSite({
    url: 'https://www.francematin.info/',
    outputFile: 'francematin_news.tsv',
    source: 'francematin.info',

    listSelector: 'div.petit',
    titleSelector: 'div.art-title a div.catTitle',
    linkSelector: 'div.art-title a',
    categorySelector: 'div.art-title a span',
    imageSelector: 'div.art-img img',

    joinUrl: 'https://www.francematin.info',

    articleSelectors: {
        text: 'div.col-lg-9:nth-child(1)',
        image: '.no-lazy',
        date: 'div.blog-single-date:nth-child(4)'
    }
});
