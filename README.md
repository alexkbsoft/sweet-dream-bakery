# 🎂 Сладкая Мечта — Кондитерская

Лендинг кондитерской с конструктором тортов и панелью администратора.

## 🚀 Быстрый старт

```bash
npm install
npm run dev        # Клиент (http://localhost:5173)
```

## 🗄️ Настройка PostgreSQL

```bash
# Установка (macOS)
brew install postgresql
brew services start postgresql

# Создание базы
createdb sweet_dream

# Запуск сервера (создаст таблицы и админа автоматически)
npm run start
```

## 📋 Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер с HMR (порт 5173) |
| `npm run build` | Production-билд в `dist/` |
| `npm run server` | Backend на порту 3000 |
| `npm run start` | Билд + backend (порт 3000) |
| `npm run preview` | Preview production-билда |

## 🔐 Админка

URL: `http://localhost:3000/admin` (или `#admin` на сайте)

Логин по умолчанию: `admin` / `admin123`

Изменить в `.env`:
```
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
```

## 📁 Структура

```
server.mjs          — Express сервер (API + статика)
db.mjs              — Подключение к PostgreSQL
src/
├── components/
│   ├── Admin/      — Панель администратора
│   ├── Build/      — Конструктор торта
│   ├── Gallery/    — Галерея тортов
│   ├── Header/     — Шапка
│   ├── Hero/       — Главный экран
│   └── Footer/     — Подвал
├── data/
│   └── cakes.js    — Данные о тортах
└── App.jsx         — Роутинг
```

## 📡 API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `POST` | `/api/orders` | Создать заказ |
| `POST` | `/api/admin/login` | Вход в админку |
| `POST` | `/api/admin/logout` | Выход |
| `GET` | `/api/admin/auth` | Проверка авторизации |
| `GET` | `/api/admin/orders` | Получить заказы (фильтры: `?status=active|completed&search=...`) |
| `PATCH` | `/api/admin/orders/:id/complete` | Отметить выполненным |
| `DELETE` | `/api/admin/orders/:id` | Удалить заказ |
