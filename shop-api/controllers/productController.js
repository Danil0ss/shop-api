const { Product } = require('../models');

// 1. Получение всех товаров
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// 2. Получение товара по ID
exports.getProductById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID должен быть числом'
      });
    }

    const product = await Product.findByPk(id);

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

// 3. Создание нового товара
exports.createProduct = async (req, res, next) => {
  try {
    const { title, price, category, inStock, stockQuantity } = req.body;

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

    const newProduct = await Product.create({
      title: String(title).trim(),
      price,
      category: category ? String(category).trim() : 'Общее',
      inStock: typeof inStock === 'boolean' ? inStock : true,
      stockQuantity: Number.isInteger(stockQuantity) ? stockQuantity : 0
    });

    res.status(201).json({
      success: true,
      message: 'Товар успешно добавлен',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

// 4. Обновление товара (PUT)
exports.updateProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID должен быть числом'
      });
    }

    const { title, price, category, inStock, stockQuantity } = req.body;

    if (!title || price === undefined || category === undefined || inStock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Для полного обновления передайте: title, price, category, inStock'
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Товар с ID ${id} не найден`
      });
    }

    await product.update({
      title: String(title).trim(),
      price,
      category: String(category).trim(),
      inStock: Boolean(inStock),
      stockQuantity: stockQuantity !== undefined ? stockQuantity : product.stockQuantity
    });

    res.status(200).json({
      success: true,
      message: `Товар с ID ${id} успешно обновлен`,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// 5. Удаление товара (DELETE)
exports.deleteProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID должен быть числом'
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Товар с ID ${id} не найден`
      });
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: `Товар "${product.title}" (ID: ${id}) успешно удален`,
      data: product
    });
  } catch (error) {
    next(error);
  }
};