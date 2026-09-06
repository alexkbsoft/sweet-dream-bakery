# 🎂 Сладкая Мечта — Кондитерская

Лендинг кондитерской с конструктором тортов и панелью администратора.

## 🚀 Локальная разработка

```bash
npm install
npm run dev        # Клиент (http://localhost:5173)
npm start          # Бэкенд (порт 3000)
```

## 🗄️ Локальный PostgreSQL (macOS)

```bash
brew install postgresql
brew services start postgresql
createdb sweet_dream
npm start          # создаст таблицы и админа автоматически
```

## 🌐 Деплой на Beget

### 1. Подготовка

1. Убедись, что проект на GitHub:
```bash
git add .
git commit -m "Deploy to Beget"
git push origin main
```

### 2. Настройка на Beget

1. Зарегистрируйся на [beget.com](https://beget.com)
2. Выбери тариф с Node.js (от 150₽/мес)
3. В панели → **Node.js приложения** → **Создать**
4. Укажи путь к проекту

### 3. Переменные окружения

В панели Beget → **Переменные окружения** добавь:

| Ключ | Значение |
|------|----------|
| `DATABASE_URL` | `postgresql://user:pass@beget-host:5432/dbname` (из панели БД) |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `strong_password` |
| `SESSION_SECRET` | `random_secret_string` |

### 4. Настройки приложения

| Поле | Значение |
|------|----------|
| Путь к проекту | `/home/u123456/sweet-dream` |
| Путь к корню | `/home/u123456/sweet-dream/dist` |
| Команда запуска | `npm start` |
| Команда сборки | `npm run build` |
| Версия Node.js | `18+` |

### 5. PostgreSQL

1. В панели Beget → **Базы данных** → **Создать**
2. Скопируй `DATABASE_URL` из настроек БД
3. Вставь в переменные окружения (шаг 3)

### 6. Деплой

1. Загрузи файлы через Git или FTP
2. Нажми **Перезапустить** в панели Node.js
3. Сайт будет доступен по адресу домена

## 📋 Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер с HMR (порт 5173) |
| `npm run build` | Production-билд в `dist/` |
| `npm start` | Backend (порт из env) |

## 🔐 Админка

URL: `http://your-domain.com/admin` (или `#admin` на сайте)

Логин по умолчанию: `admin` / `admin123`

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
