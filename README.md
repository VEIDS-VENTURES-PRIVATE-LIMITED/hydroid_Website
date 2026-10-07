# Hydroid

Hydroid is split into two applications:

- `frontend/` — React/Vite storefront with static website content and customer account UI.
- `backend/` — Node.js/Express authentication API only.

There is no admin panel, CMS, media-upload API, or runtime website-content database. Products, features, journals, videos, links, and footer content are defined directly in `frontend/src/main.jsx` and `frontend/src/Shop.jsx`.

Supabase Auth stores customer identities and sessions. Email/password signup and login pass through Express. Google sign-in uses Supabase OAuth from the frontend because Supabase must redirect the browser to Google.

## Supabase Auth setup

1. In Supabase **Authentication → URL Configuration**, set the production Site URL.
2. Add `http://127.0.0.1:4174/**` and the production callback pattern to **Redirect URLs**.
3. In **Authentication → Providers → Google**, enable Google and enter the Google client ID and client secret.
4. Add the Supabase callback URL shown in that page to the Google OAuth client's **Authorized redirect URIs**.
5. Add `http://127.0.0.1:4174` and the production frontend origin to **Authorized JavaScript origins**.

No SQL migration, service-role key, database password, or admin credentials are required.

## Environment files

Copy the templates:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

The frontend needs the Supabase project URL and publishable key for session storage and Google OAuth. The backend needs the same public values for email/password Auth and token validation.

For local development leave `VITE_API_URL` blank because Vite proxies `/api` to Express.

Never place a Supabase secret/service-role key, Google client secret, or database password in the frontend. Local `.env` files are ignored by Git.

## Install and run

```bash
npm install
npm run dev:backend
```

In another terminal:

```bash
npm run dev:frontend
```

Open [http://127.0.0.1:4174/](http://127.0.0.1:4174/).

## Checks

```bash
npm run build
npm test
```
