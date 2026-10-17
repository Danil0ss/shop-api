const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', 'access.log');

const requestLogger = (req, res, next) => {
  const now = new Date().toISOString();
  const logMessage = `[${now}] ${req.method} ${req.originalUrl}\n`;

  // 1. Вывод в консоль
  console.log(`[LOG] ${now} | ${req.method} ${req.originalUrl}`);

  // 2. Добавление в файл (если нет — создастся автоматически; при сбое отлавливается ошибка)
  fs.appendFile(logFilePath, logMessage, { encoding: 'utf8' }, (err) => {
    if (err) {
      console.error('❌ Критическая ошибка при записи в файл логов (access.log):', err.message);
    }
  });

  next();
};

module.exports = requestLogger;