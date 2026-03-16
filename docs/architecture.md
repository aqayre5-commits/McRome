# Architecture

## 1. System Modules

| Rank | Module | Responsibility | Why included |
|---|---|---|---|
| 1 | Next.js app | UI routes, metadata, API handlers | Single deploy target |
| 2 | Supabase Postgres + Auth | content store, users, sessions | Direct v1 value |
| 3 | Gemini service | summary, guide, FAQ generation | Core content utility |
| 4 | Rolimons sync service | source game ingestion | Core data source |
| 5 | Stripe integration | paid plan and billing portal | Required premium flow |
| 6 | Google Indexing service | URL update submission | Faster page discovery |

## 2. Route Map

| Route group | Routes |
|---|---|
| Public | `/`, `/games`, `/games/[slug]`, `/pricing`, `/sitemap.xml`, `/robots.txt` |
| Auth | `/login`, `/auth/callback` |
| Account | `/dashboard`, `/account` |
| System APIs | `/api/auth/*`, `/api/saved-games`, `/api/stripe/*`, `/api/cron/*` |

## 3. Integration Map

| Source | Target | Protocol | Trigger |
|---|---|---|---|
| Rolimons API | Next.js cron route | HTTPS GET | sync cron |
| Next.js cron route | Supabase | server SDK | sync / enrich |
| Next.js enrich route | Gemini | SDK call | enrich cron |
| Next.js enrich route | Google Indexing API | HTTPS POST with JWT | post-publish |
| Browser forms | Next.js route handlers | POST | login, save, checkout |
| Stripe | Webhook route | HTTPS POST | subscription lifecycle |
| Next.js | Stripe Checkout / Portal | SDK call | checkout, billing portal |

## 4. Production Constraints

| Constraint | Decision |
|---|---|
| Deployment target | One Next.js app |
| State storage | Supabase only |
| Async work | Cron-triggered batches only |
| Search | SQL `ilike`; no search cluster |
| Caching | Default Next server rendering; no Redis |
| Asset pipeline | Static SVG placeholders only |
| Admin tooling | SQL editor + protected routes; no custom admin UI |

## 5. Security Decisions

| Rank | Control | Scope |
|---|---|---|
| 1 | Service role server-only | cron, enrichment, webhook |
| 2 | RLS enabled | public pages, profiles, subscriptions, saved games |
| 3 | Secret header required | cron routes |
| 4 | Stripe signature validation | webhook |
| 5 | Noindex on private routes | auth/account surfaces |
| 6 | Magic-link auth | passwordless, lower auth surface |

## 6. Performance Decisions

| Rank | Control | Outcome |
|---|---|---|
| 1 | Server-rendered public pages | low client JS |
| 2 | Minimal client components | faster hydration |
| 3 | Batch enrichment | predictable API cost |
| 4 | Simple DB queries | low latency |
| 5 | Static metadata helpers | consistent SEO surfaces |

## 7. SEO Decisions

| Rank | Decision | Detail |
|---|---|---|
| 1 | Public detail pages indexable | `/games/[slug]` only |
| 2 | Structured data | Article + FAQPage JSON-LD |
| 3 | Private surfaces blocked | dashboard, account, login |
| 4 | Canonical routes | every public page has canonical |
| 5 | Sitemap includes published slugs only | clean indexing |
