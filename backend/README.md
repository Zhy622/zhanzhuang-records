# Zhan Zhuang Backend

NestJS + Prisma + PostgreSQL backend for phase 1.

## Run

```bash
cp .env.example .env
docker compose up -d
npm install
npm run prisma:migrate -- --name init
npm run dev
```

API starts at `http://localhost:3000`.

## Deploy

Use a real `JWT_SECRET` and production `DATABASE_URL`, then run migrations with Prisma's deploy command:

```bash
npm ci
npm run build
npx prisma migrate deploy
npm start
```

Do not use `prisma migrate dev` in production.

## Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `GET /records`
- `POST /records`
- `PUT /records/:id`
- `DELETE /records/:id`
