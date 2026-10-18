import React from 'react';
import './ProductTable.css';

export default function ProductTable({ products, onEdit, onDelete, onToggleStock }) {
  if (products.length === 0) {
    return <div className="empty-message">Товары не найдены</div>;
  }

  return (
    <div className="table-responsive">
      <table className="products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Категория</th>
            <th>Цена</th>
            <th>Остаток</th>
            <th>Статус</th>
            <th style={{ textAlign: 'center' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="col-id">{p.id}</td>
              <td className="col-title">{p.title}</td>
              <td>{p.category}</td>
              <td className="col-price">{p.price.toLocaleString('ru-RU')} BYN</td>
              <td>{p.stockQuantity} шт.</td>
              <td>
                <button
                  type="button"
                  onClick={() => onToggleStock(p.id)}
                  className={`badge ${p.inStock ? 'badge-in-stock' : 'badge-out-stock'}`}
                  title="Нажмите, чтобы изменить статус"
                >
                  {p.inStock ? 'В наличии' : 'Нет на складе'}
                </button>
              </td>
              <td style={{ textAlign: 'center' }}>
                <div className="action-buttons">
                  <button className="action-btn edit-btn" title="Редактировать" onClick={() => onEdit(p)}>
                    ✏️
                  </button>
                  <button className="action-btn delete-btn" title="Удалить" onClick={() => onDelete(p.id)}>
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}