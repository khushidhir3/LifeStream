# LifeStream Backend

Express + Prisma API for the LifeStream blood donor network. Full endpoint list: [API.md](API.md).

## Run locally

```bash
cd backend
npm install
cp .env.example .env        # then edit values
npx prisma db push          # create / update the database
SEED_DEMO=true npm run seed # admin account (+ optional demo data)
npm run dev                 # http://localhost:4000
```

Frontend: `cd client && npm install && npm run dev` (set `VITE_API_URL` if the API isn't on `http://localhost:4000`).

Dev logins after seeding: admin `admin@lifestream.local` / `Admin@12345`; demo donors use `Donor@12345`.

## What's included

- Accounts with strong-password rules, password reset by email, change password, delete account, sign-out of all devices on reset.
- Donor profiles with eligibility tracking (90 days men / 120 days women between donations), availability toggle, donation history.
- Donor search by blood group, compatible groups, city, availability and distance (OpenStreetMap geocoding). Contact details are masked until a signed-in user requests them, and the donor is notified.
- Blood requests that automatically alert compatible, eligible donors within 50 km; donors respond and get the requester's contact.
- In-app notifications (+ email when SMTP is configured).
- Admin: stats, verify/reject/edit donors, record donations, assign donors to requests, blood stock, users and roles, contact inbox, partner API keys.
- Partner API (`/api/v1`) with per-key daily limits and optional contact access — for selling API access.
- Blood bank lookup: data.gov.in (with a free key) or OpenStreetMap.
- Security: bcrypt, JWT with revocation, helmet, rate limits, input validation, CORS allow-list.

## Going to production

1. Use Postgres: set `provider = "postgresql"` in `prisma/schema.prisma` and `DATABASE_URL` to your database. (SQLite on Render's free plan is wiped on every deploy.)
2. Set `NODE_ENV=production`, a long random `JWT_SECRET`, `CLIENT_URL` (your site URL), and `SEED_ADMIN_PASS`.
3. Configure SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`) so password reset emails are delivered.
4. Optional: `DATA_GOV_IN_API_KEY` + `DATA_GOV_IN_BLOOD_BANK_RESOURCE_ID` for the government blood bank directory, `ADMIN_ACCESS_CODE` for an extra admin login code.

`render.yaml` in the repo root deploys both services on Render.
