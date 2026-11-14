const mongoose = require('mongoose');

// Схема для вложенного документа — отзыва о товаре
const reviewSchema = new mongoose.Schema({
  author: {
    type: String,
    required: [true, 'Имя автора отзыва обязательно'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Оценка обязательна'],
    min: [1, 'Минимальная оценка — 1'],
    max: [5, 'Максимальная оценка — 5']
  },
  comment: {
    type: String,
    default: '',
    trim: true
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Основная схема товара (аналог таблицы Products в PostgreSQL + вложенные структуры)
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Название товара обязательно'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Цена обязательна'],
      min: [0.01, 'Цена должна быть положительным числом']
    },
    category: {
      type: String,
      default: 'Общее',
      trim: true
    },
    inStock: {
      type: Boolean,
      default: true
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    // Вложенный объект (характеристики товара)
    specs: {
      brand: { type: String, default: 'Не указан', trim: true },
      warrantyMonths: { type: Number, default: 12, min: 0 }
    },
    // Массив примитивов (теги товара)
    tags: {
      type: [String],
      default: []
    },
    // Массив вложенных документов (отзывы пользователей)
    reviews: {
      type: [reviewSchema],
      default: []
    }
  },
  {
    timestamps: true // автоматически создаст createdAt и updatedAt
  }
);

const MongoProduct = mongoose.model('MongoProduct', productSchema);

module.exports = MongoProduct;