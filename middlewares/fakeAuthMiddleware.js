// Проверка авторизации и установка пользователя
const checkFakeAuth = (req, res, next) => {
  if (req.query.auth === '1') {
    req.user = { name: 'Администратор магазина', isAuth: true };
  } else {
    req.user = { name: 'Гость', isAuth: false };
  }
  // Передаем переменную user во все шаблоны ejs автоматически
  res.locals.user = req.user;
  next();
};

// Защита маршрутов, требующих авторизации
const requireFakeAuth = (req, res, next) => {
  if (!req.user || !req.user.isAuth) {
    return res.redirect('/login');
  }
  next();
};

module.exports = {
  checkFakeAuth,
  requireFakeAuth
};