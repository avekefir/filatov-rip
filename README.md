# Лабораторная работа №3 — Веб-сервис «Расчёт стоимости разработки ПО»

REST API на NestJS + PostgreSQL + MinIO для управления этапами разработки ПО.

## 🛠 Стек технологий
- **Backend:** NestJS (TypeScript)
- **База данных:** PostgreSQL + TypeORM
- **Хранилище файлов:** MinIO (S3)
- **Валидация:** class-validator, class-transformer
- **Загрузка файлов:** multer

---

## 📌 Методы веб-сервиса

Все методы разбиты на два домена. В начале каждого URL добавлен префикс `/api`.

### Домен «Услуга» (`/api/development_stages`)

| № | Метод | URL | Описание | Входные данные | Выходные данные |
|---|-------|-----|----------|----------------|-----------------|
| 1 | `GET` | `/api/development_stages` | Список опубликованных услуг с фильтром | Query: `maxCostPerHour`, `minTeamSize` | Массив `DevelopmentStageResponseDto` |
| 2 | `POST` | `/api/development_stages` | Создание услуги + загрузка файлов | Multipart: `stageName`, `stageDescription`, `costPerHour`, `maxTeamSize`, `image`, `video` | `DevelopmentStageResponseDto` |
| 3 | `GET` | `/api/development_stages/draft` | Получить черновик текущего пользователя | — | `DevelopmentStageResponseDto` |
| 4 | `PUT` | `/api/development_stages/:id/publish` | Публикация услуги (смена статуса) | Param: `id` | `DevelopmentStageResponseDto` |
| 5 | `GET` | `/api/development_stages/feed` | Получить ленту (без ID, первая карточка) | — | `DevelopmentStageResponseDto` |
| 6 | `GET` | `/api/development_stages/feed/:id` | Получить ленту по ID или следующую | Param: `id`, Query: `next=true` | `DevelopmentStageResponseDto` |
| 7 | `POST` | `/api/development_stages/:id/like` | Поставить или отменить лайк | Param: `id`, Body: `{ "value": 0 \| 1 }` | `DevelopmentStageResponseDto` |
| 8 | `DELETE` | `/api/development_stages/:id` | Удаление услуги (только soft delete) | Param: `id` | `{ message: string, id: number }` |

### Домен «Пользователь» (`/api/users`)

| № | Метод | URL | Описание | Входные данные | Выходные данные |
|---|-------|-----|----------|----------------|-----------------|
| 9 | `POST` | `/api/users/register` | Регистрация нового пользователя | Body: `username`, `password`, `fullName` | `{ id, username, fullName, role }` |
| 10 | `POST` | `/api/users/login` | Аутентификация (заглушка для Lab 4) | Body: `username`, `password` | `{ message, user }` |

> **Дополнительные флаги в ответе:**
> - `isMyStage` (0/1) — создатель услуги совпадает с текущим пользователем (ID=1).
> - `isLikedByMe` (0/1) — текущий пользователь лайкнул эту услугу.

---

## 🗄 Структура базы данных

### Таблица `users` (Пользователи)
| Поле | Тип | Ключ | Описание |
|------|-----|------|----------|
| `id` | int | **PK**, auto_increment | Идентификатор |
| `username` | varchar(100) | UNIQUE | Логин |
| `fullName` | varchar(150) | | ФИО |
| `password` | varchar(200) | | Пароль (скрыт в API) |
| `role` | varchar(50) | | Роль (`creator` / `moderator`) |

### Таблица `development_stages` (Услуги / Этапы)
| Поле | Тип | Ключ | Описание |
|------|-----|------|----------|
| `id` | int | **PK**, auto_increment | Идентификатор |
| `stageName` | varchar(150) | | Название этапа |
| `stageDescription` | text | | Краткое описание |
| `status` | varchar(20) | | Статус (`draft`, `published`, `deleted`) |
| `image` | varchar(200) | | Имя файла изображения в MinIO |
| `video` | varchar(200) | | Имя файла видео в MinIO |
| `costPerHour` | int | | **Поле по теме:** стоимость за час (₽/ч) |
| `maxTeamSize` | int | | **Поле по теме:** макс. размер команды (чел) |
| `createdAt` | timestamp | | Дата создания |
| `publishedAt` | timestamp | | Дата публикации |
| `creator_id` | int | **FK** → `users.id` | Создатель услуги |

### Таблица `stage_likes` (Лайки, м-м)
| Поле | Тип | Ключ | Описание |
|------|-----|------|----------|
| `userId` | int | **PK, FK** → `users.id` | ID пользователя |
| `stageId` | int | **PK, FK** → `development_stages.id` | ID услуги |

> ⚠️ **Каскадное удаление запрещено**. Удаление реализовано через soft delete (смена статуса на `deleted`).