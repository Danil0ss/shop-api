const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Публичные маршруты
router.post('/register', authController.register);
router.post('/login', authController.login);

// Защищенный маршрут получения профиля
router.get('/profile', authenticateToken, authController.getProfile);

// САМАЯ ВАЖНАЯ СТРОКА:
module.exports = router;