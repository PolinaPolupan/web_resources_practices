const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const sequelize = require('./db');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
app. set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use(express.json());

app.use('/', routes);

sequelize.authenticate()
    .then(() => {
        console.log('DB connected');
        app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
    })
    .catch(err => console.error('DB error:', err));