let products = [
  { id: 1, title: 'Ноутбук Lenovo IdeaPad', price: 55000, category: 'Электроника', inStock: true },
  { id: 2, title: 'Беспроводная мышь Logitech', price: 2500, category: 'Аксессуары', inStock: true },
  { id: 3, title: 'Клавиатура механическая Redragon', price: 4200, category: 'Аксессуары', inStock: false },
  { id: 4, title: 'Монитор LG UltraGear 27"', price: 24000, category: 'Электроника', inStock: true }
];

let nextId = 5;

const ProductModel = {
  getAll: () => products,

  getById: (id) => products.find(p => p.id === id),

  create: (data) => {
    const newProduct = {
      id: nextId++,
      title: String(data.title).trim(),
      price: data.price,
      category: data.category ? String(data.category).trim() : 'Общее',
      inStock: typeof data.inStock === 'boolean' ? data.inStock : true
    };
    products.push(newProduct);
    return newProduct;
  },

  update: (id, data) => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = {
      id,
      title: String(data.title).trim(),
      price: data.price,
      category: String(data.category).trim(),
      inStock: Boolean(data.inStock)
    };
    return products[index];
  },

  delete: (id) => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const [deleted] = products.splice(index, 1);
    return deleted;
  }
};

module.exports = ProductModel;