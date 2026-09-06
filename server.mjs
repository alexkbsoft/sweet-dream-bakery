import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import pool, { initDB } from './db.mjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: 'Не авторизован' });
}

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, 'dist')));

// ==================== PUBLIC API ====================

// Create order
app.post('/api/orders', async (req, res) => {
  const { name, phone, base, cream, fillings, decors, price } = req.body;

  if (!name || !phone || !base || !cream) {
    return res.status(400).json({
      success: false,
      error: 'Заполните все обязательные поля',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO orders (name, phone, base, cream, fillings, decors, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, phone, base, cream, fillings || [], decors || [], price]
    );

    const order = result.rows[0];
    console.log(`\n📦 Новый заказ #${order.id}:`);
    console.log(`   Клиент: ${name}`);
    console.log(`   Телефон: ${phone}`);
    console.log(`   Торт: ${base} + ${cream}`);
    if (fillings?.length) console.log(`   Начинка: ${fillings.join(', ')}`);
    if (decors?.length) console.log(`   Декор: ${decors.join(', ')}`);
    console.log(`   Сумма: ${price} ₽\n`);

    res.status(201).json({ success: true, message: 'Заказ успешно создан!', order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ==================== ADMIN API ====================

// Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const bcrypt = await import('bcryptjs');
    const valid = await bcrypt.default.compare(password, result.rows[0].password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    req.session.authenticated = true;
    req.session.username = username;
    res.json({ success: true, message: 'Вход выполнен' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Ошибка выхода' });
    res.json({ success: true });
  });
});

// Check auth
app.get('/api/admin/auth', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

// Get orders (with filtering, search, pagination)
app.get('/api/admin/orders', requireAuth, async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = '';
  let params = [];
  let paramIndex = 1;

  if (status === 'completed') {
    whereClause = 'WHERE completed = TRUE';
  } else if (status === 'active') {
    whereClause = 'WHERE completed = FALSE';
  }

  if (search) {
    if (whereClause) {
      whereClause += ' AND (';
    } else {
      whereClause = 'WHERE (';
    }
    whereClause += `name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR base ILIKE $${paramIndex}`;
    params.push(`%${search}%`);
    paramIndex++;
    whereClause += ')';
  }

  try {
    // Count total
    const countResult = await pool.query(`SELECT COUNT(*) FROM orders ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get orders
    const ordersParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      ordersParams
    );

    res.json({
      success: true,
      orders: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Complete order
app.patch('/api/admin/orders/:id/complete', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE orders SET completed = TRUE, completed_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    console.log(`✅ Заказ #${id} отмечен как выполненный`);
    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Delete order
app.delete('/api/admin/orders/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    console.log(`🗑 Заказ #${id} удалён`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Catch-all: serve index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
      console.log(`📋 API: http://localhost:${PORT}/api/orders`);
      console.log(`🔐 Админка: http://localhost:${PORT}/admin`);
    });
  } catch (error) {
    console.error('Не удалось запустить сервер:', error);
    process.exit(1);
  }
}

start();
