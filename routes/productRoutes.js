const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// 1. Импортируем middleware проверки токена и роли администратора
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Публичные маршруты (доступны всем)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Защищенные маршруты (только авторизованные администраторы)
router.post('/', authenticateToken, isAdmin, productController.createProduct);
router.put('/:id', authenticateToken, isAdmin, productController.updateProduct);
router.delete('/:id', authenticateToken, isAdmin, productController.deleteProduct);

module.exports = router;