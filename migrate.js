const sequelize = require('./db');
const News = require('./models/News');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Соединение с БД установлено.');

        await sequelize.sync({ force: true });
        console.log('Таблицы созданы.');
    } catch (err) {
        console.error('Ошибка при миграции:', err);
    } finally {
        await sequelize.close();
    }
})();
