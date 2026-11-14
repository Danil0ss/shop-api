const express = require('express');
const router = express.Router();
const mongoProductController = require('../controllers/mongoProductController');

// Базовый CRUD
router.get('/', mongoProductController.getAllProducts);
router.get('/:id', mongoProductController.getProductById);
router.post('/', mongoProductController.createProduct);
router.put('/:id', mongoProductController.updateProduct);
router.delete('/:id', mongoProductController.deleteProduct);

// Эндпоинты для работы со вложенными массивами
router.post('/:id/reviews', mongoProductController.addReview);
router.patch('/:id/reviews/:reviewId', mongoProductController.updateReview);
router.delete('/:id/reviews/:reviewId', mongoProductController.deleteReview);
router.patch('/:id/tags', mongoProductController.addTag);

module.exports = router;