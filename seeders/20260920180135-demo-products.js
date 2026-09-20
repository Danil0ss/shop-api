'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Products', [
      {
        title: 'Ноутбук Lenovo IdeaPad',
        price: 55000,
        category: 'Электроника',
        inStock: true,
        stockQuantity: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Беспроводная мышь Logitech',
        price: 2500,
        category: 'Аксессуары',
        inStock: true,
        stockQuantity: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Клавиатура механическая Redragon',
        price: 4200,
        category: 'Аксессуары',
        inStock: false,
        stockQuantity: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Монитор LG UltraGear 27"',
        price: 24000,
        category: 'Электроника',
        inStock: true,
        stockQuantity: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};