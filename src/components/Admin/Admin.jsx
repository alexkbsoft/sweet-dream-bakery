import { useState, useEffect, useCallback } from 'react';
import './Admin.css';

// ==================== LOGIN PAGE ====================
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        onLogin(username);
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <span className="login-card__logo">🎂</span>
          <h1>Сладкая Мечта</h1>
          <p>Вход в панель администратора</p>
        </div>
        <form className="login-card__form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="login-card__error">{error}</p>}
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==================== ADMIN PANEL ====================
function AdminPanel({ username, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status,
        page: pagination.page,
        limit: 20,
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/orders?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [status, search, pagination.page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleComplete = async (id) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}/complete`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот заказ?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const baseNames = {
    vanilla: '🍦 Ванильный',
    chocolate: '🍫 Шоколадный',
    redvelvet: '❤️ Красный бархат',
    spice: '🍯 Медовик',
  };

  const creamNames = {
    butter: '🧈 Масляный',
    creamcheese: '🧀 Крем-чиз',
    ganache: '🍫 Ганаш',
    whipped: '☁️ Сливки',
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header__left">
          <span className="admin-header__logo">🎂</span>
          <h1>Сладкая Мечта</h1>
        </div>
        <div className="admin-header__right">
          <span className="admin-header__user">👤 {username}</span>
          <button className="btn btn--small btn--outline" onClick={onLogout}>
            Выход
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${status === 'active' ? 'admin-tab--active' : ''}`}
            onClick={() => {
              setStatus('active');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          >
            Текущие <span className="admin-tab__count">{pagination.total}</span>
          </button>
          <button
            className={`admin-tab ${status === 'completed' ? 'admin-tab--active' : ''}`}
            onClick={() => {
              setStatus('completed');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          >
            Выполненные <span className="admin-tab__count">{pagination.total}</span>
          </button>
        </div>

        {/* Search */}
        <div className="admin-search">
          <input
            type="text"
            placeholder="Поиск по имени, телефону или основе..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          />
        </div>

        {/* Orders Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading">Загрузка...</div>
          ) : orders.length === 0 ? (
            <div className="admin-empty">
              <span>📭</span>
              <p>Заказов не найдено</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Телефон</th>
                  <th>Торт</th>
                  <th>Начинка</th>
                  <th>Декор</th>
                  <th>Сумма</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className={order.completed ? 'admin-table--completed' : ''}>
                    <td>{order.id}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>{order.name}</td>
                    <td>{order.phone}</td>
                    <td>
                      {baseNames[order.base] || order.base} +{' '}
                      {creamNames[order.cream] || order.cream}
                    </td>
                    <td>
                      {order.fillings?.length > 0
                        ? order.fillings.map((f) => f.replace(/_/g, ' ')).join(', ')
                        : '—'}
                    </td>
                    <td>
                      {order.decors?.length > 0
                        ? order.decors.map((d) => d.replace(/_/g, ' ')).join(', ')
                        : '—'}
                    </td>
                    <td className="admin-table__price">{order.price} ₽</td>
                    <td className="admin-table__actions">
                      {status === 'active' && (
                        <button
                          className="btn btn--small btn--success"
                          onClick={() => handleComplete(order.id)}
                          disabled={deletingId === order.id}
                        >
                          ✓
                        </button>
                      )}
                      <button
                        className="btn btn--small btn--danger"
                        onClick={() => handleDelete(order.id)}
                        disabled={deletingId === order.id}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="btn btn--small"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((p) => ({ ...p, page: p.page - 1 }))
              }
            >
              ← Назад
            </button>
            <span>
              Страница {pagination.page} из {pagination.totalPages}
            </span>
            <button
              className="btn btn--small"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((p) => ({ ...p, page: p.page + 1 }))
              }
            >
              Вперёд →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already logged in
    fetch('/api/admin/auth', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
          setUsername(data.username);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (user) => {
    setUsername(user);
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setAuthenticated(false);
    setUsername('');
  };

  if (checking) {
    return <div className="admin-loading">Загрузка...</div>;
  }

  return !authenticated ? (
    <LoginPage onLogin={handleLogin} />
  ) : (
    <AdminPanel username={username} onLogout={handleLogout} />
  );
}

export default Admin;
