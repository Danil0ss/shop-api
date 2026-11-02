import React, { useState } from 'react';
import './Header.css';

export default function Header({ user, onLogin, onLogout }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleFormLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email, password);
    setShowLoginModal(false);
  };

  return (
    <header className="shop-header">
      <h1 className="shop-title">Каталог товаров</h1>

      <div className="header-auth-section">
        {user ? (
          <>
            <span className="user-badge">
              👤 <strong>{user.email}</strong> ({user.role})
            </span>
            <button
              type="button"
              className="auth-btn auth-btn-secondary"
              onClick={onLogout}
            >
              Выйти
            </button>
          </>
        ) : (
          <button
            type="button"
            className="auth-btn auth-btn-primary"
            onClick={() => setShowLoginModal(!showLoginModal)}
          >
            Войти (JWT)
          </button>
        )}
      </div>

      {showLoginModal && !user && (
        <form className="login-dropdown" onSubmit={handleFormLogin}>
          <h4 className="login-dropdown-title">Вход в систему</h4>
          <input
            type="email"
            className="login-input"
            placeholder="Email (admin)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-input"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-submit-btn">
            Войти
          </button>
        </form>
      )}
    </header>
  );
}