const express = require('express');
const router = express. Router();
const News = require('../models/News');

// Главная - список новостей
router.get('/', async (req, res) => {
    try {
        const news = await News.findAll({
            order: [['id', 'DESC']],
            limit: 50,
            raw: true
        });
        res.render('index', { title: 'Новости', news });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Статистика
router.get('/stats', (req, res) => {
    res.render('stats', { title: 'Статистика' });
});

// API: все новости
router. get('/api/news', async (req, res) => {
    try {
        const news = await News.findAll({
            order: [['id', 'DESC']],
            raw: true
        });
        console.log(`Returning ${news.length} news items`);
        res.json(news);
    } catch (err) {
        console.error(err);
        res. status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;