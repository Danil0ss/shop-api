require('dotenv').config();
const express = require('express');
const path = require('path');
const { sequelize } = require('./models');

// Подключение роутов
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const webRoutes = require('./routes/webRoutes');

// Подключение кастомных middleware
const requestLogger = require('./middlewares/loggerMiddleware');
const { checkFakeAuth } = require('./middlewares/fakeAuthMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Парсеры тела запроса
app.use(express.json());
// Обязательно для обработки стандартных HTML-форм POST (req.body):
app.use(express.urlencoded({ extended: true }));

// 3. Логирующее middleware (консоль + запись в access.log)
app.use(requestLogger);

// 4. Middleware имитации авторизации (?auth=1)
app.use(checkFakeAuth);

// 5. Маршруты приложения
app.use('/', webRoutes);               // EJS веб-страницы (Каталог, форма, 500-тест)
app.use('/auth', authRoutes);          // REST API auth
app.use('/products', productRoutes);   // REST API products

// 6. Обработка 404 (Не найдено)
app.use((req, res) => {
  // Если клиент запрашивал JSON (REST API)
  if (req.originalUrl.startsWith('/products') || req.originalUrl.startsWith('/auth')) {
    return res.status(404).json({
      success: false,
      error: `Маршрут ${req.originalUrl} не существует`
    });
  }

  // Для веб-страниц отдаем 404.ejs
  res.status(404).render('404', {
    title: '404 - Страница не найдена',
    message: `Страница по адресу ${req.originalUrl} не найдена.`
  });
});

// 7. Обработка 500 (Ошибки сервера)
// Обязательно 4 параметра (err, req, res, next) в самом конце!
app.use((err, req, res, next) => {
  console.error('🔥 [500 ERROR HANDLER]:', err);

  // Если это вызов REST API
  if (req.originalUrl.startsWith('/products') || req.originalUrl.startsWith('/auth')) {
    return res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: err.message
    });
  }

  // Для браузера всегда рендерим красивый шаблон 500.ejs
  res.status(500).render('500', {
    title: '500 - Ошибка сервера',
    error: err,
    cartCount: 0
  });
});

// Запуск сервера
const startServer = async () => {
  try {
    // Подключение к БД (если Postgres не запущен, сервер все равно продолжит работу с in-memory)
    await sequelize.authenticate().catch(e => {
      console.warn('⚠️ PostgreSQL недоступен, продолжаем работу с данными в памяти:', e.message);
    });

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
      console.log(`📝 Логи записываются в ${path.join(__dirname, 'access.log')}`);
    });
  } catch (error) {
    console.error('Ошибка инициализации сервера:', error);
    process.exit(1);
  }
};

startServer();