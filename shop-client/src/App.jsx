import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import StatsBar from './components/StatsBar/StatsBar';
import ProductForm from './components/ProductForm/ProductForm';
import FilterBar from './components/FilterBar/FilterBar';
import ProductTable from './components/ProductTable/ProductTable';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import './App.css';

export default function App() {
  // 1. Хранение массива товаров
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Хранение полей формы ввода
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Периферия',
    stockQuantity: '',
    inStock: true
  });
  const [editingId, setEditingId] = useState(null);

  // 3. Состояния поиска, фильтра и сортировки
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [sortBy, setSortBy] = useState('none');

  // 4. Статус сохранения
  const [saveStatus, setSaveStatus] = useState('Сохранено');

  // ЭФФЕКТ 1: Загрузка из localStorage с имитацией задержки сервера
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('shop_products');
      if (saved) {
        try {
          setProducts(JSON.parse(saved));
        } catch {
          setProducts(INITIAL_PRODUCTS);
        }
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // ЭФФЕКТ 2: Debounce автосохранение в localStorage (500 мс)
  useEffect(() => {
    if (isLoading) return;

    setSaveStatus('Сохранение...');
    const timer = setTimeout(() => {
      localStorage.setItem('shop_products', JSON.stringify(products));
      setSaveStatus('Все изменения сохранены');
    }, 500);

    return () => clearTimeout(timer);
  }, [products, isLoading]);

  // ЭФФЕКТ 3: Изменение заголовка страницы в зависимости от количества товаров
  useEffect(() => {
    document.title = `Каталог товаров (${products.length}) | Магазин`;
  }, [products]);

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price) return;

    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stockQuantity, 10) || 0;
    // Если остаток > 0, статус автоматически "В наличии"
    const inStockStatus = stockNum > 0 ? (formData.inStock ?? true) : false;

    if (editingId !== null) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formData.title.trim(),
                price: priceNum,
                category: formData.category,
                stockQuantity: stockNum,
                inStock: inStockStatus
              }
            : item
        )
      );
      setEditingId(null);
    } else {
      const newProduct = {
        id: Date.now(),
        title: formData.title.trim(),
        price: priceNum,
        category: formData.category,
        stockQuantity: stockNum,
        inStock: inStockStatus
      };
      setProducts((prev) => [newProduct, ...prev]);
    }

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
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      price: '',
      category: 'Периферия',
      stockQuantity: '',
      inStock: true
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить данный товар?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) handleCancelEdit();
    }
  };

  const handleToggleStock = (id) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inStock: !item.inStock } : item
      )
    );
  };

  // Фильтрация и сортировка списка
  const filteredProducts = products
    .filter((product) => {
      const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'Все' || product.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  if (isLoading) {
    return (
      <div className="app-loader">
        <div className="loader-spinner"></div>
        <p>Загрузка каталога товаров...</p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Header saveStatus={saveStatus} />
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
      <ProductTable
        products={filteredProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStock={handleToggleStock}
      />
    </div>
  );
}