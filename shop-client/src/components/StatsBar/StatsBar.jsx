import React from 'react';
import './StatsBar.css';

export default function StatsBar({ products }) {
  const totalCount = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * (p.stockQuantity || 0), 0);

  return (
    <section className="stats-bar">
      <div className="stat-card">
        <span className="stat-label">Всего товаров</span>
        <span className="stat-value">{totalCount}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">В наличии</span>
        <span className="stat-value">{inStockCount} шт.</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Оценка склада</span>
        <span className="stat-value">{totalValue.toLocaleString('ru-RU')} BYN</span>
      </div>
    </section>
  );
}