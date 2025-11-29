# Lush Task

A small invoicing/marketing admin panel (backend + frontend) used for managing invoices, campaigns, incomes, and expenses.

**Status:** Development

**Stack:** Node.js, Express, MongoDB, React + Vite

**Repository layout**
- `backend/`: Express API, Mongoose models, seed scripts
- `frontend/`: React app (Vite + Tailwind)

**Prerequisites**
- Node.js (16+ recommended)
- npm (or yarn)
- A MongoDB database (Atlas or local)

**Environment variables (backend)**
- `MONGODB_URL`: MongoDB connection string (overrides default in `backend/config.js`)
- `PORT`: Backend port (default `5000`)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: values used by `seed/createAdmin.js` when creating an admin user
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`: optional SMTP settings used for sending emails

If you use a `.env` file, place it in `backend/` and ensure `dotenv` is available (the project already imports `dotenv/config`).

Quick start (development)

1. Backend

```powershell
cd backend
npm install
# start in dev mode (requires nodemon)
npm run dev
``` 

The backend defaults to port `5000` (see `backend/config.js`). Set `PORT` if you need a different port.

2. Frontend

```powershell
cd frontend
npm install
# start vite dev server
npm run dev
``` 

The frontend uses Vite (default port 5173). Open two terminals to run backend and frontend concurrently.

Seeding the database

1. Seed roles/permissions

```powershell
cd backend
node seed/seedRoles.js
```

Notes & security

- `backend/config.js` contains a default `mongoDBURL` fallback. For production, always set `MONGODB_URL` and do not commit credentials.
- SMTP and admin credentials should be provided via environment variables in production.
