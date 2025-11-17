const scrapeSite = require('./scraper');

module.exports = () => scrapeSite({
    url: 'https://www.actualite-fr.com/',
    outputFile: 'actualite_news.tsv',
    source: 'actualite-fr.com',

    listSelector: 'div.td_module_flex',
    titleSelector: 'h3.entry-title a',
    linkSelector: 'h3.entry-title a',
    categorySelector: null,
    imageSelector: 'span.entry-thumb',

    joinUrl: '',

    articleSelectors: {
        text: '.td-post-content',
        image: '.td-post-content img',
        date: '.entry-date'
    }
});
