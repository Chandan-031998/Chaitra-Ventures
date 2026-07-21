# Chaitra Real Estate (Vite + React) + MySQL (Express API)

This project has been updated to **remove Supabase** and use a **MySQL backend** with an Admin panel.

## What you get
- Public website pages: Home, Buy, Rent, Projects, Contact, Property Details
- Admin panel at **/admin**
  - Login: **admin / chaitraventures**
  - Manage **Buy properties**, **Rent properties**, and **Projects**
  - Changes reflect immediately on the website

## 1) Database setup (MySQL)
Import the schema file:

- File: `server/schema.sql`

In phpMyAdmin:
- Select your database (or create it)
- Import `schema.sql`

## 2) Backend (API) setup
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
API runs on: `http://localhost:5001`

> Update DB credentials inside `server/.env` if needed.

## 3) Frontend setup
```bash
# from project root
cp .env.example .env
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

## Environment variables
- Frontend: `.env`
  - `VITE_API_BASE_URL=http://localhost:5001`
- Backend: `server/.env`
  - `DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME`
  - `ADMIN_USERNAME, ADMIN_PASSWORD`
  - `JWT_SECRET`

## Notes
- Images are stored as **URLs** in the database.
- `featured=1` shows a property on the Home page.
