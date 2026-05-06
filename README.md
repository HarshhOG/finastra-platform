# FINASTRA / ARTHYUG Platform

Premium, mobile-first event management platform for an inter-college commerce and finance fest, built as a workspace with:

- `apps/web`: Next.js 16, TypeScript, Tailwind 4, Framer Motion, GSAP, React Three Fiber, Zustand
- `apps/api`: NestJS 11, PostgreSQL, Prisma 7, Redis-ready caching, JWT auth, RBAC, approvals, exports
- `packages/types`: shared contracts between frontend and backend

## What is included

- Cinematic public website with animated hero, 3D scene, dynamic events grid, and database-driven event detail pages
- Dynamic forms for college registration, CR registration, and team pre-registration
- Separate admin and super-admin surfaces
- JWT auth with refresh-cookie flow
- Role-based content workflow where team admin changes create approval requests
- Prisma schema for users, permissions, colleges, CRs, teams, participants, events, registrations, payments, notifications, approvals, audit logs, exports, and content versions
- Redis-backed public caching with graceful fallback
- CSV export endpoints for registrations, colleges, payments, teams, and attendance
- Dockerized local stack with Postgres and Redis

## Seeded credentials

- Super admin: `superadmin@finastrafest.in` / `SuperAdmin@2026`
- Team admin: `teamadmin@finastrafest.in` / `TeamAdmin@2026`

## Workspace structure

```text
apps/
  api/
  web/
packages/
  types/
docs/
```

## Local development

1. Copy env files from:
   - [`.env.example`](/F:/FINASTRA%20REGISTRATION/.env.example)
   - [`apps/api/.env.example`](/F:/FINASTRA%20REGISTRATION/apps/api/.env.example)
   - [`apps/web/.env.example`](/F:/FINASTRA%20REGISTRATION/apps/web/.env.example)
2. Start PostgreSQL and Redis locally.
3. Generate Prisma client:
   - `cd "F:\FINASTRA REGISTRATION"`
   - `$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finastra?schema=public"`
   - `npm run prisma:generate`
4. Push schema and seed:
   - `cd "F:\FINASTRA REGISTRATION\apps\api"`
   - `$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finastra?schema=public"`
   - `npx prisma db push`
   - `npm run prisma:seed`
5. Start the full workspace:
   - `cd "F:\FINASTRA REGISTRATION"`
   - `npm run dev`

## Docker

Run the full stack with:

```powershell
cd "F:\FINASTRA REGISTRATION"
docker compose up --build
```

The compose stack seeds demo content on boot for local evaluation.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`

## Important routes

- Public:
  - `/`
  - `/events`
  - `/events/[slug]`
  - `/college-register`
  - `/cr-register`
  - `/team-pre-registration`
  - `/organising-team`
  - `/contact`
- Admin:
  - `/admin/login`
  - `/admin/dashboard`
  - `/admin/events`
  - `/admin/approvals`
  - `/super-admin/overview`

## API highlights

- Public content:
  - `GET /api/v1/public/site`
  - `GET /api/v1/public/events`
  - `GET /api/v1/public/events/:slug`
  - `GET /api/v1/public/forms/:slug`
- Registrations:
  - `POST /api/v1/public/register/college`
  - `POST /api/v1/public/register/cr`
  - `POST /api/v1/public/register/team`
- Admin:
  - `POST /api/v1/auth/login`
  - `GET /api/v1/admin/dashboard`
  - `GET /api/v1/admin/events`
  - `PATCH /api/v1/admin/events/:id`
  - `GET /api/v1/admin/approvals`
  - `POST /api/v1/admin/approvals/:id/approve`
  - `GET /api/v1/admin/exports/:type.csv`

## Notes

- Prisma 7 uses [`apps/api/prisma.config.ts`](/F:/FINASTRA%20REGISTRATION/apps/api/prisma.config.ts) for datasource configuration.
- The admin event editor currently mixes structured fields with JSON-powered nested sections to keep the content model fully dynamic without hardcoding event layouts.
- Public pages render against the API at request time by default, so builds do not require the backend to be running.
