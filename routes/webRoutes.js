const express = require('express');
const router = express.Router();
const webController = require('../controllers/webController');
const { requireFakeAuth } = require('../middlewares/fakeAuthMiddleware');

// Главная и товары
router.get('/', webController.getIndex);
router.get('/item/:id', webController.getItem);

// Добавление товаров (требует auth)
router.get('/add', requireFakeAuth, webController.getAddForm);
router.post('/add', requireFakeAuth, webController.postAddProduct);

// Корзина
router.get('/cart', webController.getCart);
router.post('/cart/add/:id', webController.addToCart);
router.post('/cart/remove/:id', webController.removeFromCart);
router.post('/cart/clear', webController.clearCart);
router.post('/cart/checkout', webController.checkoutCart);

// Авторизация и тест ошибки
router.get('/login', webController.getLoginPage);
router.get('/trigger-500', webController.triggerError500);

module.exports = router;