# Лабораторная работа №3 — Веб-сервис «Расчёт стоимости разработки ПО»

REST API на NestJS + PostgreSQL + MinIO для управления этапами разработки ПО.

## Стек технологий

- **Backend:** NestJS 12, TypeScript
- **БД:** PostgreSQL 18 (через TypeORM)
- **Хранилище файлов:** MinIO (S3-совместимое)
- **Валидация:** class-validator, class-transformer
- **Загрузка файлов:** multer

## Методы веб-сервиса

### Домен «Услуга» (`/api/development_stages`)

| № | Метод | URL | Описание | Входные данные | Выходные данные |
|---|-------|-----|----------|---------------|-----------------|
| 1 | GET | `/api/development_stages` | Список опубликованных с фильтром | Query: `search`, `maxCostPerHour`, `minTeamSize` | Массив `DevelopmentStageResponseDto` |
| 2 | GET | `/api/development_stages/draft` | Черновик текущего пользователя | — | `DevelopmentStageResponseDto` |
| 3 | GET | `/api/development_stages/feed` | Лента — первый опубликованный | — | `DevelopmentStageResponseDto` |
| 4 | GET | `/api/development_stages/feed/:id` | Лента по id или `?next=true` | Param: `id`; Query: `next` | `DevelopmentStageResponseDto` |
| 5 | GET | `/api/development_stages/:id` | Одна услуга по id | Param: `id` | `DevelopmentStageResponseDto` |
| 6 | POST | `/api/development_stages` | Создание услуги + загрузка файлов | multipart: `stageName`, `stageDescription`, `costPerHour`, `maxTeamSize`, `image`, `video` | `DevelopmentStageResponseDto` |
| 7 | PUT | `/api/development_stages/:id/publish` | Публикация услуги | Param: `id` | `DevelopmentStageResponseDto` |
| 8 | DELETE | `/api/development_stages/:id` | Логическое удаление | Param: `id` | `{ message, id }` |
| 9 | POST | `/api/development_stages/:id/like` | Поставить/убрать лайк | Body: `{ value: 0 \| 1 }` | `DevelopmentStageResponseDto` |

### Домен «Пользователь» (`/api/users`)

| № | Метод | URL | Описание | Входные данные | Выходные данные |
|---|-------|-----|----------|---------------|-----------------|
| 10 | POST | `/api/users/register` | Регистрация | Body: `username`, `password`, `fullName` | `{ id, username, fullName, role }` |
| 11 | POST | `/api/users/login` | Аутентификация (заглушка Lab 4) | Body: `username`, `password` | `{ message, user }` |
| 12 | POST | `/api/users/logout` | Деавторизация (заглушка Lab 4) | — | `{ message }` |

### Флаги в ответе `DevelopmentStageResponseDto`

- **`isMyStage`** — 0/1: создатель услуги совпадает с текущим пользователем
- **`isLikedByMe`** — 0/1: текущий пользователь лайкнул эту услугу
- **`likesCount`** — количество лайков услуги

## Структура базы данных

### Таблица `users`

| Поле | Тип | Ключ | Описание |
|------|-----|------|----------|
| `id` | int | PK, auto | Идентификатор |
| `username` | varchar(100) | UNIQUE | Логин |
| `fullName` | varchar(150) | | ФИО |
| `password` | varchar(200) | | Пароль (скрыт в API) |
| `role` | varchar(50) | | `creator` / `moderator` |

### Таблица `development_stages`

| Поле | Тип | Ключ | Описание |
|------|-----|------|----------|
| `id` | int | PK, auto | Идентификатор |
| `stageName` | varchar(150) | | Название этапа |
| `stageDescription` | text | | Описание |
| `status` | varchar(20) | | `draft` / `published` / `deleted` |
| `image` | varchar(200) | | Имя файла в MinIO |
| `video` | varchar(200) | | Имя файла в MinIO |
| `costPerHour` | int | | Стоимость за час (₽/ч) |
| `maxTeamSize` | int | | Максимальный размер команды (чел) |
| `createdAt` | timestamp | | Дата создания |
| `publishedAt` | timestamp | | Дата публикации |
| `creator_id` | int | FK → `users.id` | Создатель |

### Таблица `stage_likes` (м-м)

| Поле | Тип | Ключ | Описание |
|------|-----|------|----------|
| `userId` | int | PK, FK → `users.id` | Пользователь |
| `stageId` | int | PK, FK → `development_stages.id` | Услуга |

> Составной первичный ключ `(userId, stageId)`. Каскадное удаление запрещено (`onDelete: 'NO ACTION'`).

## Запуск проекта

```bash
# 1. Запустить инфраструктуру (PostgreSQL, Adminer, MinIO)
docker-compose up -d

# 2. Установить зависимости
npm install

# 3. Применить миграции
npm run migrate

# 4. Запустить сервер
npm run start:dev
```

Сервер запустится на http://localhost:3000

## Ограничения Lab 3

- Пользователь-создатель **зафиксирован** через singleton `getCurrentUserId()` (id=1)
- Авторизация через сессии/JWT будет в **Лабораторной №4**
- Файлы картинок и видео загружаются в MinIO, в БД хранятся только **имена файлов**