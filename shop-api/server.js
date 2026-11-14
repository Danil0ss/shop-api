require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { sequelize } = require('./models');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const mongoProductRoutes = require('./routes/mongoProductRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Маршруты PostgreSQL (Sequelize) — всё старое продолжает работать
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// Новые маршруты MongoDB (Mongoose)
app.use('/mongo/products', mongoProductRoutes);

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

    if (!process.env.MONGO_URI) {
      throw new Error('Не задана переменная MONGO_URI в файле .env');
    }

await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Подключение к базе данных MongoDB успешно установлено.');

    app.listen(PORT, () => {
      console.log(`Сервер успешно запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
};

startServer();