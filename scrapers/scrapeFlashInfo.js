const scrapeSite = require('./scraper');

module.exports = () => scrapeSite({
    url: 'https://www.flashinfo.fr/',
    outputFile: 'flashinfo_news.tsv',
    source: 'flashinfo.fr',

    listSelector: 'div.row',
    titleSelector: 'h2.entry-title a',
    linkSelector: 'h2.entry-title a',
    categorySelector: 'span.meta-category a',
    imageSelector: 'div.herald-post-thumbnail img',

    joinUrl: '',

    articleSelectors: {
        text: 'div.col-md-12:nth-child(1)',
        image: '.attachment-herald-lay-a',
        date: 'time.entry-date'
    }
});
