import React from 'react';
import './ProductForm.css';

export default function ProductForm({ formData, setFormData, onSubmit, editingId, onCancel }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'stockQuantity') {
      const qty = parseInt(value, 10) || 0;
      setFormData((prev) => ({
        ...prev,
        stockQuantity: value,
        inStock: qty > 0 ? true : false
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  return (
    <form className="product-form" onSubmit={onSubmit}>
      <h3 className="form-title">{editingId ? 'Редактировать товар' : 'Добавить новый товар'}</h3>
      <div className="form-grid">
        <div className="input-group">
          <label>Название</label>
          <input
            type="text"
            name="title"
            placeholder="Например, Монитор"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Цена (BYN)</label>
          <input
            type="number"
            name="price"
            placeholder="Цена в BYN"
            value={formData.price}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="input-group">
          <label>Категория</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="Периферия">Периферия</option>
            <option value="Мониторы">Мониторы</option>
            <option value="Аудио">Аудио</option>
            <option value="Комплектующие">Комплектующие</option>
            <option value="Общее">Общее</option>
          </select>
        </div>

        <div className="input-group">
          <label>Остаток на складе</label>
          <input
            type="number"
            name="stockQuantity"
            placeholder="0"
            value={formData.stockQuantity}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      <div className="form-actions">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="inStock"
            checked={formData.inStock}
            onChange={handleChange}
          />
          <span>В наличии</span>
        </label>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Сохранить изменения' : 'Добавить товар'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Отмена
            </button>
          )}
        </div>
      </div>
    </form>
  );
}