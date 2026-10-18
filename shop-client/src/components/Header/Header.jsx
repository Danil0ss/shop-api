import React from 'react';
import './Header.css';

export default function Header({ saveStatus }) {
  return (
    <header className="shop-header">
      <h1 className="shop-title">Каталог товаров</h1>
      <span className="save-status">{saveStatus}</span>
    </header>
  );
}