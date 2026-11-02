import React from 'react';
import './StatsBar.css';

export default function StatsBar({ products }) {
  const totalCount = products.length;

  const totalPieces = products.reduce((sum, p) => sum + (Number(p.stockQuantity) || 0), 0);
  
  const totalValue = products.reduce((sum, p) => sum + p.price * (Number(p.stockQuantity) || 0), 0);

  return (
    <section className="stats-bar">
      <div className="stat-card">
        <span className="stat-label">Всего товаров</span>
        <span className="stat-value">{totalCount} поз.</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Единиц на складе</span>
        <span className="stat-value">{totalPieces} шт.</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Оценка склада</span>
        <span className="stat-value">{totalValue.toLocaleString('ru-RU')} BYN</span>
      </div>
    </section>
  );
}