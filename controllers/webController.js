// 1. Хранилище товаров в памяти (in-memory)
let products = [
  {
    id: 1,
    title: 'Беспроводные наушники Sony WH-1000XM5',
    price: 349,
    category: 'Электроника',
    stockQuantity: 8,
    description: 'Флагманские наушники с активным шумоподавлением.',
    createdAt: '16.10.2026, 10:15:30'
  },
  {
    id: 2,
    title: 'Механическая клавиатура Keychron K2',
    price: 949,
    category: 'Периферия',
    stockQuantity: 15,
    description: 'Компактная беспроводная клавиатура на переключателях Gateron G Pro.',
    createdAt: '16.10.2026, 11:40:12'
  },
  {
    id: 3,
    title: 'Игровой монитор LG UltraGear 27"',
    price: 799,
    category: 'Мониторы',
    stockQuantity: 4,
    description: 'IPS матрица, 165 Гц, время отклика 1 мс, G-Sync Compatible.',
    createdAt: '16.10.2026, 12:05:44'
  }
];

// 2. Хранилище корзины в памяти
let cart = [];

// Функция для подсчета общего количества товаров в корзине
const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0);

// =================== МАРШРУТЫ КАТАЛОГА ===================

// Главная страница
exports.getIndex = (req, res) => {
  res.render('index', {
    title: 'Каталог интернет-магазина',
    products,
    cartCount: getCartCount()
  });
};

// Детальная страница товара
exports.getItem = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).render('404', {
      title: 'Товар не найден',
      message: `Товар с артикулом/ID ${req.params.id} не существует в каталоге`
    });
  }

  res.render('item', {
    title: product.title,
    product,
    cartCount: getCartCount()
  });
};

// Форма добавления товара (GET)
exports.getAddForm = (req, res) => {
  res.render('add', {
    title: 'Добавление товара',
    errorMessage: null,
    formData: {},
    cartCount: getCartCount()
  });
};

// Обработка добавления товара (POST)
exports.postAddProduct = (req, res) => {
  const { title, price, category, stockQuantity, description } = req.body;
  const numPrice = Number(price);
  const numStock = Number(stockQuantity);

  // Валидация
  if (!title || !title.trim() || !category || !category.trim()) {
    return res.status(400).render('add', {
      title: 'Добавление товара',
      errorMessage: 'Ошибка: Название и категория обязательны для заполнения!',
      formData: req.body,
      cartCount: getCartCount()
    });
  }

  if (isNaN(numPrice) || numPrice < 0) {
    return res.status(400).render('add', {
      title: 'Добавление товара',
      errorMessage: 'Ошибка: Цена должна быть числом >= 0!',
      formData: req.body,
      cartCount: getCartCount()
    });
  }

  if (isNaN(numStock) || numStock < 0) {
    return res.status(400).render('add', {
      title: 'Добавление товара',
      errorMessage: 'Ошибка: Количество на складе должно быть >= 0!',
      formData: req.body,
      cartCount: getCartCount()
    });
  }

  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    title: title.trim(),
    price: numPrice,
    category: category.trim(),
    stockQuantity: numStock,
    description: description ? description.trim() : 'Описание отсутствует',
    createdAt: new Date().toLocaleString('ru-RU')
  };

  products.push(newProduct);
  res.redirect('/?auth=' + (req.user && req.user.isAuth ? '1' : '0'));
};

// =================== МАРШРУТЫ КОРЗИНЫ ===================

// Просмотр корзины (GET /cart)
exports.getCart = (req, res) => {
  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  res.render('cart', {
    title: 'Корзина заказов',
    cart,
    totalPrice,
    orderSuccess: req.query.ordered === '1',
    cartCount: getCartCount()
  });
};

// Добавление в корзину (POST /cart/add/:id)
exports.addToCart = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);

  if (product) {
    const existingItem = cart.find(item => item.product.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        product,
        quantity: 1,
        addedAt: new Date().toLocaleString('ru-RU')
      });
    }
  }

  res.redirect('/cart?auth=' + (req.user && req.user.isAuth ? '1' : '0'));
};

// Удаление одной позиции из корзины (POST /cart/remove/:id)
exports.removeFromCart = (req, res) => {
  const id = parseInt(req.params.id, 10);
  cart = cart.filter(item => item.product.id !== id);
  res.redirect('/cart?auth=' + (req.user && req.user.isAuth ? '1' : '0'));
};

// Полная очистка корзины (POST /cart/clear)
exports.clearCart = (req, res) => {
  cart = [];
  res.redirect('/cart?auth=' + (req.user && req.user.isAuth ? '1' : '0'));
};

// Оформление заказа (POST /cart/checkout)
exports.checkoutCart = (req, res) => {
  if (cart.length > 0) {
    // Списываем количество со склада
    cart.forEach(item => {
      const prod = products.find(p => p.id === item.product.id);
      if (prod) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
      }
    });
    cart = [];
  }
  res.redirect('/cart?auth=' + (req.user && req.user.isAuth ? '1' : '0') + '&ordered=1');
};

// =================== АВТОРИЗАЦИЯ И ТЕСТЫ ===================

// Страница авторизации
exports.getLoginPage = (req, res) => {
  res.render('login', {
    title: 'Авторизация в магазине',
    cartCount: getCartCount()
  });
};

// Тестовый вызов 500 ошибки
exports.triggerError500 = (req, res, next) => {
  next(new Error('Тестовый сбой: демонстрация красивой страницы 500'));
};