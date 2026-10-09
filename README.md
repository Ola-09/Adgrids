# ADGRID Cloud

A Pan-African OOH intelligence and operations platform with a React frontend and a Node.js/Express backend scaffold.

## Quick start

1. Copy [.env.example](.env.example) to `.env` and fill in the required values.
2. Install dependencies:
   `npm install`
3. Run the dev server:
   `npm run dev`
4. Open http://localhost:3000

## Backend bootstrap

The app now boots an Express API on the legacy `/api` routes while preserving the Vite dev middleware used by the frontend. The auth flows are implemented in the server bootstrap and support the frontend’s existing contract.

## Scripts

- `npm run dev` — start the Express + Vite dev server
- `npm run build` — build frontend and backend bundle
- `npm run start` — start the production bundle
- `npm run lint` — TypeScript check
- `npm run db:migrate` — Prisma migration workflow
- `npm run db:seed` — seed users and metro data
- `npm run smoke:auth` — simple auth smoke checks

## Auth endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/mfa/verify`
- `POST /api/auth/mfa/enable`
- `POST /api/auth/mfa/confirm`
- `POST /api/auth/mfa/disable`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/validate-access`
- `GET /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Vercel Deployment

The project is fully configured for seamless one-click deployment on [Vercel](https://vercel.com):

1. **Import Repository**: Connect your GitHub repository to Vercel.
2. **Framework Preset**: Vercel automatically detects `Vite` (with output directory `dist`).
3. **Build Settings**:
   - Build Command: `npm run vercel-build` (or `npm run build`)
   - Output Directory: `dist`
   - Install Command: `npm install` (runs `postinstall: prisma generate` automatically)
4. **Environment Variables**:
   - `JWT_ACCESS_SECRET` (required): random 32+ character string
   - `JWT_REFRESH_SECRET` (required): random 32+ character string
   - `DATABASE_URL` (optional for Postgres persistence)
   - `APP_URL` (optional: defaults automatically to `https://${VERCEL_URL}`)
   - `RESEND_API_KEY` (optional for production email verification & password resets)
5. **Serverless Architecture**:
   - Static client assets are hosted on Vercel's Edge Network with immutable cache headers.
   - All `/api/*` endpoints are automatically handled by Vercel Serverless Functions via `/api/index.ts` and `/api/[...path].ts`.
   - Client-side SPA routes (e.g. `/admin`, `/marketplace`, `/admin/agency`) rewrite seamlessly to `index.html` via `vercel.json`.

## Notes

- The application intentionally keeps the old frontend route structure and central auth contract intact.
- Prisma schema files are present for the production backend path, while the current runtime remains in-memory for the Phase 1 boot verification required by the repo.
