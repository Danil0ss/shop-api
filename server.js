const express = require('express');

const app = express();
const PORT = 3000;

// Middleware для парсинга тела запроса в формате JSON
app.use(express.json());

// Логирование входящих запросов в консоль (удобно при разработке)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Начальные данные (товары интернет-магазина) в памяти сервера
let products = [
  { id: 1, title: 'Ноутбук Lenovo IdeaPad', price: 55000, category: 'Электроника', inStock: true },
  { id: 2, title: 'Беспроводная мышь Logitech', price: 2500, category: 'Аксессуары', inStock: true },
  { id: 3, title: 'Клавиатура механическая Redragon', price: 4200, category: 'Аксессуары', inStock: false },
  { id: 4, title: 'Монитор LG UltraGear 27"', price: 24000, category: 'Электроника', inStock: true }
];

// Переменная для генерации нового ID
let nextId = 5;

// ==========================================
// МАРШРУТЫ (CRUD для товаров)
// ==========================================

// 1. GET /products — Получение всех товаров
app.get('/products', (req, res) => {
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// 2. GET /products/:id — Получение товара по ID
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'ID должен быть числом'
    });
  }

  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: `Товар с ID ${id} не найден`
    });
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// 3. POST /products — Создание нового товара
app.post('/products', (req, res) => {
  const { title, price, category, inStock } = req.body;

  // Валидация входных данных (статус 400 при ошибке)
  if (!title || price === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Поля "title" и "price" обязательны для заполнения'
    });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Цена (price) должна быть положительным числом'
    });
  }

  const newProduct = {
    id: nextId++,
    title: String(title).trim(),
    price,
    category: category ? String(category).trim() : 'Общее',
    inStock: typeof inStock === 'boolean' ? inStock : true
  };

  products.push(newProduct);

  // Возвращаем статус 201 (Created)
  res.status(201).json({
    success: true,
    message: 'Товар успешно добавлен',
    data: newProduct
  });
});

// 4. PUT /products/:id — Полное обновление товара
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'ID должен быть числом'
    });
  }

  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: `Товар с ID ${id} не найден`
    });
  }

  const { title, price, category, inStock } = req.body;

  // Валидация данных для PUT
  if (!title || price === undefined || category === undefined || inStock === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Для полного обновления (PUT) передайте все поля: title, price, category, inStock'
    });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Цена (price) должна быть положительным числом'
    });
  }

  // Обновление объекта
  products[index] = {
    id,
    title: String(title).trim(),
    price,
    category: String(category).trim(),
    inStock: Boolean(inStock)
  };

  res.status(200).json({
    success: true,
    message: `Товар с ID ${id} успешно обновлен`,
    data: products[index]
  });
});

// 5. DELETE /products/:id — Удаление товара
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'ID должен быть числом'
    });
  }

  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: `Товар с ID ${id} не найден`
    });
  }

  const deletedProduct = products.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: `Товар "${deletedProduct.title}" (ID: ${id}) успешно удален`,
    data: deletedProduct
  });
});

// ==========================================
// ОБРАБОТКА НЕИЗВЕСТНЫХ МАРШРУТОВ И ОШИБОК
// ==========================================

// Обработка запросов на несуществующие эндпоинты (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Маршрут ${req.originalUrl} не существует`
  });
});

// Глобальный обработчик внутренних ошибок (500)
app.use((err, req, res, next) => {
  console.error('Необработанная ошибка:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});