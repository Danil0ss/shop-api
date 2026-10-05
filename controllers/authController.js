const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 1. Регистрация (POST /auth/register)
exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Поля email и password обязательны для заполнения'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Пароль должен содержать не менее 6 символов'
      });
    }

    // Проверка уникальности email
    const existingUser = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Пользователь с таким email уже зарегистрирован'
      });
    }

    // Хеширование пароля (соль 10 раундов)
    const passwordHash = await bcrypt.hash(password, 10);

    // Разрешаем передать 'admin', иначе по умолчанию 'user'
    const userRole = role === 'admin' ? 'admin' : 'user';

    const newUser = await User.create({
      email: email.trim().toLowerCase(),
      passwordHash,
      role: userRole
    });

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Вход в систему (POST /auth/login)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Пожалуйста, введите email и пароль'
      });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Неверный email или пароль'
      });
    }

    // Сравнение пароля с хешем
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Неверный email или пароль'
      });
    }

    // Генерация JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Успешный вход в систему',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Получение профиля текущего пользователя (GET /auth/profile)
exports.getProfile = async (req, res, next) => {
  try {
    // req.user берется из middleware authenticateToken
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] } // не отдаем хеш пароля клиенту
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};