import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database tables
export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        base VARCHAR(100) NOT NULL,
        cream VARCHAR(100) NOT NULL,
        fillings TEXT[] DEFAULT '{}',
        decors TEXT[] DEFAULT '{}',
        price INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      );
    `);

    // Check if admin exists
    const existing = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [process.env.ADMIN_USERNAME]
    );

    if (existing.rows.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.default.hash(process.env.ADMIN_PASSWORD, 10);
      await client.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
        [process.env.ADMIN_USERNAME, hash]
      );
      console.log('✅ Администратор создан');
    }

    await client.query('COMMIT');
    console.log('✅ База данных инициализирована');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка инициализации БД:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
