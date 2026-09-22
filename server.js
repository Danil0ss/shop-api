require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Маршрут ${req.originalUrl} не существует`
  });
});


app.use((err, req, res, next) => {
  console.error('Необработанная ошибка:', err);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    details: err.message
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Подключение к базе данных PostgreSQL успешно установлено.');

    app.listen(PORT, () => {
      console.log(`Сервер успешно запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
};

startServer();