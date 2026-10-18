import React from 'react';
import './FilterBar.css';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy
}) {
  return (
    <section className="filter-controls">
      <input
        type="text"
        className="search-input"
        placeholder="Поиск товара по названию..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <select
        className="filter-select"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="Все">Все категории</option>
        <option value="Периферия">Периферия</option>
        <option value="Мониторы">Мониторы</option>
        <option value="Аудио">Аудио</option>
        <option value="Комплектующие">Комплектующие</option>
        <option value="Общее">Общее</option>
      </select>

      <select
        className="filter-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="none">Сортировка: По умолчанию</option>
        <option value="price-asc">Сначала недорогие (цена ↑)</option>
        <option value="price-desc">Сначала дорогие (цена ↓)</option>
        <option value="title">По названию (А-Я)</option>
      </select>
    </section>
  );
}