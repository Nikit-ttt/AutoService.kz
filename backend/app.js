const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const apiRouter = require('./routes/api');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRouter);
app.listen(PORT, () => {
    console.log(`Сервер автосервиса успешно запущен!`);
    console.log(`ОТКРЫВАЙТЕ САЙТ ПО АДРЕСУ: http://localhost:${PORT}`);
});