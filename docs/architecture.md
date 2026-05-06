# Architecture Notes

## Monorepo shape

- `apps/web` is the public site plus admin UI.
- `apps/api` is the system of record and workflow engine.
- `packages/types` holds shared contracts for event content, forms, approvals, and dashboard data.

## Backend architecture

- NestJS modules:
  - `auth`: login, refresh, logout, profile
  - `public`: site payloads, event detail delivery, dynamic forms, registration intake
  - `events`: admin event management plus approval submission
  - `approvals`: review queue and publishing decisions
  - `dashboard`: metrics and registration analytics
  - `exports`: CSV generation with export-job tracking
  - `notifications`: in-app notification center
  - `audit`: action logging
- Prisma is the data access layer for PostgreSQL.
- Redis caches high-traffic public responses and is optional at runtime.

## Approval workflow

1. Team admin edits event content from the admin composer.
2. The API stores a diff in `ApprovalRequest` instead of publishing directly.
3. Super admin reviews the diff from the approval center.
4. On approval, `EventsService` applies the nested content update, writes a `ContentVersion`, and invalidates public cache keys.

## Data modeling choices

- Event detail content is relational where possible:
  - `EventSection`
  - `EventRule`
  - `EventRound`
  - `EventFaq`
  - `EventCoordinator`
  - `EventPrize`
  - `EventSchedule`
  - `EventJudgingCriterion`
  - `EventDownload`
- Generic JSON is used selectively for:
  - site settings
  - dynamic field options
  - approval snapshots/diffs
  - export filters

## Frontend architecture

- Public pages are server-rendered with runtime API fetches.
- High-motion surfaces are isolated in client components.
- The 3D hero uses React Three Fiber and Drei.
- Admin auth state is handled with Zustand and stored in local storage.
- Admin tables and charts are desktop-first, while public routes prioritize mobile ergonomics and bottom navigation.

## Operational baseline

- Docker Compose runs Postgres, Redis, API, and web together.
- The API container performs `prisma db push` on boot for quick local bring-up.
- Seed data creates:
  - 11 events
  - 4 colleges
  - demo registrations and payments
  - super admin and team admin accounts
