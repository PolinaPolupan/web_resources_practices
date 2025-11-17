const scrapeSite = require('./scraper');

module.exports = () => scrapeSite({
    url: 'https://www.ladepeche.fr/',
    outputFile: 'ladepeche_news.tsv',
    source: 'ladepeche.fr',

    listSelector: 'article',
    titleSelector: 'h3 a',
    linkSelector: 'h3 a',
    categorySelector: '.ArticleItem-category',
    imageSelector: 'img',

    joinUrl: 'https://www.ladepeche.fr',

    articleSelectors: {
        text: '.article-full__left-col',
        image: 'img.responsive-img:nth-child(4)',
        date: '.article-full__infos-dates'
    }
});
