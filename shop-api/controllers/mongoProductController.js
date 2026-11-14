const mongoose = require('mongoose');
const MongoProduct = require('../mongoModels/Product');

// Вспомогательная проверка корректности ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. GET /mongo/products — получить все товары
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await MongoProduct.find();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /mongo/products/:id — получить товар по ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный формат MongoDB ObjectId'
      });
    }

    const product = await MongoProduct.findById(id);
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
  } catch (error) {
    next(error);
  }
};

// 3. POST /mongo/products — создать новый товар
exports.createProduct = async (req, res, next) => {
  try {
    const { title, price, category, inStock, stockQuantity, specs, tags, reviews } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Поля "title" и "price" обязательны для заполнения'
      });
    }

    const newProduct = new MongoProduct({
      title,
      price,
      category,
      inStock,
      stockQuantity,
      specs,
      tags,
      reviews
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Товар успешно добавлен в MongoDB',
      data: savedProduct
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Ошибка валидации данных',
        details: error.message
      });
    }
    next(error);
  }
};

// 4. PUT /mongo/products/:id — обновить товар
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный формат MongoDB ObjectId'
      });
    }

    const updatedProduct = await MongoProduct.findByIdAndUpdate(
      id,
      req.body,
      {
        returnDocument: 'after', // аналог { new: true } в современных версиях Mongoose
        runValidators: true
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: `Товар с ID ${id} не найден`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Товар успешно обновлён',
      data: updatedProduct
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Ошибка валидации данных',
        details: error.message
      });
    }
    next(error);
  }
};

// 5. DELETE /mongo/products/:id — удалить товар
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный формат MongoDB ObjectId'
      });
    }

    const deletedProduct = await MongoProduct.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        error: `Товар с ID ${id} не найден`
      });
    }

    res.status(200).json({
      success: true,
      message: `Товар "${deletedProduct.title}" успешно удалён`,
      data: deletedProduct
    });
  } catch (error) {
    next(error);
  }
};

// --- РАБОТА СО ВЛОЖЕННЫМИ МАССИВАМИ (Часть 6) ---

// 6. POST /mongo/products/:id/reviews — добавить отзыв в массив reviews ($push)
exports.addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { author, rating, comment } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, error: 'Некорректный ID товара' });
    }

    if (!author || rating === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Поля "author" и "rating" обязательны'
      });
    }

    const updatedProduct = await MongoProduct.findByIdAndUpdate(
      id,
      {
        $push: {
          reviews: { author, rating, comment }
        }
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, error: 'Товар не найден' });
    }

    res.status(201).json({
      success: true,
      message: 'Отзыв добавлен',
      data: updatedProduct
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Ошибка валидации отзыва',
        details: error.message
      });
    }
    next(error);
  }
};

// 7. PATCH /mongo/products/:id/reviews/:reviewId — обновить конкретный элемент внутри массива reviews ($set / $inc + оператор $)
exports.updateReview = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    const { rating, comment, incrementLikes } = req.body;

    if (!isValidId(id) || !isValidId(reviewId)) {
      return res.status(400).json({ success: false, error: 'Некорректный ID товара или отзыва' });
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Оценка (rating) должна быть числом от 1 до 5'
      });
    }

    const updateQuery = {};
    const setFields = {};

    if (rating !== undefined) setFields['reviews.$.rating'] = rating;
    if (comment !== undefined) setFields['reviews.$.comment'] = String(comment).trim();

    if (Object.keys(setFields).length > 0) {
      updateQuery.$set = setFields;
    }

    if (incrementLikes === true) {
      updateQuery.$inc = { 'reviews.$.likes': 1 };
    }

    if (Object.keys(updateQuery).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Передайте хотя бы одно поле для обновления: rating, comment или incrementLikes: true'
      });
    }

    const updatedProduct = await MongoProduct.findOneAndUpdate(
      { _id: id, 'reviews._id': reviewId },
      updateQuery,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Товар или отзыв с указанным ID не найден'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Отзыв внутри массива успешно обновлён',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// 8. DELETE /mongo/products/:id/reviews/:reviewId — удалить отзыв из массива ($pull)
exports.deleteReview = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;

    if (!isValidId(id) || !isValidId(reviewId)) {
      return res.status(400).json({ success: false, error: 'Некорректный ID товара или отзыва' });
    }

    const updatedProduct = await MongoProduct.findByIdAndUpdate(
      id,
      { $pull: { reviews: { _id: reviewId } } },
      { returnDocument: 'after' }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, error: 'Товар не найден' });
    }

    res.status(200).json({
      success: true,
      message: 'Отзыв удалён из массива',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// 9. PATCH /mongo/products/:id/tags — добавить уникальный тег в массив tags ($addToSet)
exports.addTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, error: 'Некорректный ID товара' });
    }
    if (!tag || !String(tag).trim()) {
      return res.status(400).json({ success: false, error: 'Укажите непустой tag' });
    }

    const updatedProduct = await MongoProduct.findByIdAndUpdate(
      id,
      { $addToSet: { tags: String(tag).trim() } },
      { returnDocument: 'after' }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, error: 'Товар не найден' });
    }

    res.status(200).json({
      success: true,
      message: 'Тег добавлен (без дубликатов)',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};