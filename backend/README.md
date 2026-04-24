# LifeStream Backend

Quick backend scaffold for the LifeStream app.

Setup

1. cd backend
2. npm install
3. copy `.env.example` to `.env` and edit values
4. npx prisma generate
5. npx prisma migrate dev --name init
6. npm run dev

APIs
- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login, returns JWT
- `GET /api/donors` — list donors (query by `bloodType`, `city`, `name`)
- `POST /api/donors` — create donor (requires `Authorization: Bearer <token>`)

Notes
- Uses SQLite for local dev (`DATABASE_URL=file:./dev.db`). Swap to Postgres in production by updating `DATABASE_URL` in `.env` and running migrations.
