const ProductModel = require('../models/productModel');

// 1. Получение всех товаров
exports.getAllProducts = (req, res) => {
  const products = ProductModel.getAll();
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
};

// 2. Получение одного товара по ID
exports.getProductById = (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'ID должен быть числом'
    });
  }

  const product = ProductModel.getById(id);

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
};

// 3. Создание нового товара
exports.createProduct = (req, res) => {
  const { title, price, category, inStock } = req.body;

  if (!title || price === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Поля "title" и "price" обязательны для заполнения'
    });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Цена (price) должна быть положительным числом'
    });
  }

  const newProduct = ProductModel.create({ title, price, category, inStock });

  res.status(201).json({
    success: true,
    message: 'Товар успешно добавлен',
    data: newProduct
  });
};

// 4. Полное обновление товара (PUT)
exports.updateProduct = (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'ID должен быть числом'
    });
  }

  const { title, price, category, inStock } = req.body;


  if (!title || price === undefined || category === undefined || inStock === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Для полного обновления (PUT) передайте все поля: title, price, category, inStock'
    });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Цена (price) должна быть положительным числом'
    });
  }

  const updatedProduct = ProductModel.update(id, { title, price, category, inStock });

  if (!updatedProduct) {
    return res.status(404).json({
      success: false,
      error: `Товар с ID ${id} не найден`
    });
  }

  res.status(200).json({
    success: true,
    message: `Товар с ID ${id} успешно обновлен`,
    data: updatedProduct
  });
};

// 5. Удаление товара
exports.deleteProduct = (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'ID должен быть числом'
    });
  }

  const deletedProduct = ProductModel.delete(id);

  if (!deletedProduct) {
    return res.status(404).json({
      success: false,
      error: `Товар с ID ${id} не найден`
    });
  }

  res.status(200).json({
    success: true,
    message: `Товар "${deletedProduct.title}" (ID: ${id}) успешно удален`,
    data: deletedProduct
  });
};