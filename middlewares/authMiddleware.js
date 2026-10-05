const jwt = require('jsonwebtoken');

// Проверка JWT-токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Ожидается формат "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Доступ запрещен. Токен авторизации не предоставлен'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, userPayload) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Недействительный или просроченный токен'
      });
    }

    // Сохраняем расшифрованные данные пользователя в req.user
    req.user = userPayload;
    next();
  });
};

// Проверка роли Администратора (RBAC)
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Доступ запрещен: действие доступно только администраторам'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin
};