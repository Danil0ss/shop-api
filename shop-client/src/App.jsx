import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header/Header';
import StatsBar from './components/StatsBar/StatsBar';
import ProductForm from './components/ProductForm/ProductForm';
import FilterBar from './components/FilterBar/FilterBar';
import ProductTable from './components/ProductTable/ProductTable';
import {
  fetchProducts,
  addProductApi,
  updateProductApi,
  deleteProductApi,
  loginApi
} from './api';
import './App.css';

export default function App() {
  // 1. Состояния данных и запросов
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // 2. Аутентификация пользователя (для прав администратора на POST/PUT/DELETE)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // 3. Форма добавления/редактирования
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Периферия',
    stockQuantity: '',
    inStock: true
  });
  const [editingId, setEditingId] = useState(null);

  // 4. Поиск, фильтры и сортировка
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [sortBy, setSortBy] = useState('none');

  // Вспомогательная функция для всплывающих уведомлений об ошибках/успехе
  const showNotice = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- ПОЛУЧЕНИЕ ТОВАРОВ С СЕРВЕРА (GET) + ABORT CONTROLLER + RETRY (ДОП. УЛУЧШЕНИЕ) ---
  const loadProducts = useCallback(async (signal, retries = 2) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchProducts(signal);
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        // Запрос был отменен через AbortController при размонтировании
        return;
      }
      if (retries > 0) {
        console.warn(`Ошибка загрузки. Повторная попытка... Осталось попыток: ${retries}`);
        setTimeout(() => loadProducts(signal, retries - 1), 1000);
        return;
      }
      setError(err.response?.data?.error || err.message || 'Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller.signal);

    // Отмена запроса при размонтировании компонента (Часть 5)
    return () => {
      controller.abort();
    };
  }, [loadProducts]);

  useEffect(() => {
    document.title = `Каталог товаров (${products.length}) | Магазин`;
  }, [products]);

  // --- ДОБАВЛЕНИЕ И РЕДАКТИРОВАНИЕ (POST / PUT) С ОПТИМИСТИЧНЫМ ОБНОВЛЕНИЕМ ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price) return;

    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stockQuantity, 10) || 0;
    const inStockStatus = stockNum > 0 ? (formData.inStock ?? true) : false;

    const payload = {
      title: formData.title.trim(),
      price: priceNum,
      category: formData.category,
      stockQuantity: stockNum,
      inStock: inStockStatus
    };

    // --- РЕДАКТИРОВАНИЕ (PUT) ---
    if (editingId !== null) {
      const originalProduct = products.find((p) => p.id === editingId);
      if (!originalProduct) return;

      // 1. Оптимистично обновляем UI
      setProducts((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
      );
      setEditingId(null);
      resetForm();

      try {
        // 2. Отправляем запрос на сервер
        const res = await updateProductApi(originalProduct.id, payload);
        // Заменяем данными ответа сервера (на случай если сервер добавил свои поля)
        setProducts((prev) =>
          prev.map((item) => (item.id === originalProduct.id ? res.data.data : item))
        );
        showNotice('Товар успешно обновлен');
      } catch (err) {
        // 3. Откат к исходному состоянию при ошибке
        setProducts((prev) =>
          prev.map((item) => (item.id === originalProduct.id ? originalProduct : item))
        );
        showNotice(err.response?.data?.error || 'Не удалось обновить товар. Изменения отменены.', true);
      }
    } else {
      // --- ДОБАВЛЕНИЕ (POST) ---
      const tempId = `temp-${Date.now()}`;
      const optimisticProduct = { ...payload, id: tempId };

      // 1. Оптимистично добавляем элемент в список
      setProducts((prev) => [optimisticProduct, ...prev]);
      resetForm();

      try {
        // 2. Отправляем POST запрос
        const res = await addProductApi(payload);
        const serverProduct = res.data.data;
        // 3. Заменяем временный ID на реальный из ответа БД
        setProducts((prev) =>
          prev.map((item) => (item.id === tempId ? serverProduct : item))
        );
        showNotice('Товар успешно добавлен');
      } catch (err) {
        // 4. При ошибке убираем добавленный элемент
        setProducts((prev) => prev.filter((item) => item.id !== tempId));
        showNotice(err.response?.data?.error || 'Ошибка при добавлении товара на сервер', true);
      }
    }
  };

  // --- УДАЛЕНИЕ (DELETE) С ОПТИМИСТИЧНЫМ ОБНОВЛЕНИЕМ ---
  const handleDelete = async (id) => {
    if (!window.confirm('Удалить данный товар?')) return;

    const previousProducts = [...products];
    const deletedProduct = products.find((p) => p.id === id);

    // 1. Оптимистично убираем элемент из UI
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) handleCancelEdit();

    try {
      // 2. Запрос на сервер
      await deleteProductApi(id);
      showNotice(`Товар "${deletedProduct?.title || ''}" успешно удален`);
    } catch (err) {
      // 3. Откат к предыдущему списку при ошибке
      setProducts(previousProducts);
      showNotice(err.response?.data?.error || 'Ошибка при удалении товара. Товар возвращен.', true);
    }
  };

  // --- ОПТИМИСТИЧНОЕ ПЕРЕКЛЮЧЕНИЕ СТАТУСА НАЛИЧИЯ (PUT) ---
  const handleToggleStock = async (id) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const previousProducts = [...products];
    const updatedStatus = !target.inStock;

    // 1. Оптимистично меняем статус
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: updatedStatus } : item))
    );

    try {
      // 2. Запрос на сервер
      await updateProductApi(id, {
        title: target.title,
        price: target.price,
        category: target.category,
        stockQuantity: target.stockQuantity,
        inStock: updatedStatus
      });
    } catch (err) {
      // 3. Откат при ошибке
      setProducts(previousProducts);
      showNotice('Ошибка обновления статуса наличия', true);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      price: '',
      category: 'Периферия',
      stockQuantity: '',
      inStock: true
    });
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      price: product.price,
      category: product.category,
      stockQuantity: product.stockQuantity,
      inStock: product.inStock
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  // Вход для выполнения защищенных CRUD операций
  const handleLogin = async (email, password) => {
    try {
      const res = await loginApi(email, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      showNotice(`Успешный вход: ${res.data.user.email} (${res.data.user.role})`);
    } catch (err) {
      showNotice(err.response?.data?.error || 'Ошибка входа', true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showNotice('Вы вышли из системы');
  };

  // Фильтрация и сортировка товаров
  const filteredProducts = products
    .filter((product) => {
      const matchSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'Все' || product.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  // ЭКРАН ЗАГРУЗКИ (Loading state)
  /*
  if (isLoading && products.length === 0) {
    return (
      <div className="app-loader">
        <div className="loader-spinner"></div>
        <p>Загрузка каталога с сервера...</p>
      </div>
    );
  }

  // ЭКРАН ОШИБКИ С КНОПКОЙ «ПОВТОРИТЬ» (Error state)
  if (error && products.length === 0) {
    return (
      <div className="app-loader">
        <div style={{ color: '#e74c3c', fontSize: '1.2rem', marginBottom: '15px' }}>
          ⚠️ Ошибка загрузки: {error}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => loadProducts()}
          style={{ cursor: 'pointer', padding: '10px 20px' }}
        >
          🔄 Повторить запрос
        </button>
      </div>
    );
  }
*/
  return (
    <div className="app-wrapper">
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Всплывающее уведомление об оптимистичном успехе / ошибке отката */}
      {notification && (
        <div
          style={{
            margin: '10px 0',
            padding: '12px 18px',
            borderRadius: '6px',
            backgroundColor: notification.isError ? '#fde8e8' : '#e6fffa',
            color: notification.isError ? '#c81e1e' : '#047481',
            border: `1px solid ${notification.isError ? '#f8b4b4' : '#a2f5bf'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      <StatsBar products={products} />

      <ProductForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        editingId={editingId}
        onCancel={handleCancelEdit}
      />

      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

 {/* Область списка: отображает либо Загрузку, либо Ошибку, либо Таблицу */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#2563eb', fontWeight: 600 }}>
          <div className="loader-spinner" style={{ margin: '0 auto 12px' }}></div>
          <span>Загрузка каталога с сервера...</span>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#dc2626' }}>
          <p style={{ marginBottom: '12px', fontWeight: 500 }}>Сервер недоступен: {error}</p>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => loadProducts()}
          >
            Повторить
          </button>
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStock={handleToggleStock}
        />
      )}
    </div>
  );
}