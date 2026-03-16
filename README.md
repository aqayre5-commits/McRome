# RoMeta Guides 2026 Pack

## 1. Project Summary

| Item | Value |
|---|---|
| Product | Public Roblox strategy pages with AI-enriched useful answers, freshness signals, utility widgets, and monetization rails |
| Public value | Indexable game guides, answer blocks, FAQ schema, social-proof freshness signals, Robux converter |
| Premium value | Saved games, billing-managed account, regionalized pricing, monetization-ready offer routing |
| Stack | Next.js App Router, TypeScript, Supabase, Gemini, Stripe |
| Background jobs | Protected route handlers for sync, enrichment, and indexing |
| Delivery | Codebase + planning pack + QA pack + copy pack + 2026 gap upgrade |

## 2. Run Order

1. Copy `.env.example` to `.env.local`.
2. Run `supabase/migrations/001_initial.sql`.
3. Run `supabase/migrations/002_2026_pseo_upgrade.sql`.
4. Install dependencies.
5. Run `npm run dev`.
6. Trigger `POST /api/cron/sync` with `Authorization: Bearer $CRON_SECRET`.
7. Trigger `POST /api/cron/enrich` with `Authorization: Bearer $CRON_SECRET`.
8. Verify `/games`, `/games/[slug]`, `/pricing`, `/login`, `/sitemap.xml`.
9. Optionally trigger `POST /api/cron/index-verified` after community verification starts accumulating.

## 3. Included Packs

| Folder | Contents |
|---|---|
| `app/` | Next.js routes and APIs |
| `components/` | UI primitives, SEO blocks, utility widgets, monetization rails |
| `lib/` | services, data access, contracts, analytics, auth, geo, monetization |
| `supabase/` | SQL migrations |
| `tests/` | utility test coverage |
| `docs/` | design, engineering, QA, copy, SEO, roadmap |

## 4. 2026 Upgrade Coverage

| Gap | Included |
|---|---|
| Globalized schema fields | `language_code`, `device_compatibility` |
| Verification + freshness | `last_data_refresh`, `verified_by_community`, `community_verification_count` |
| Answer block control | `answer_block` with enforced sub-100-word clamp |
| Trend spike data | delta-based trend spike score and label |
| Utility widget | interactive Robux-to-USD converter |
| Sitemap drip-feed | top verified pages only, capped by `SITEMAP_INDEX_LIMIT` |
| Monetization wiring | display ad slot wrapper, beta tester lead form, regional offer routing |
| Country-based pricing | tier-aware Stripe price resolution |

## 5. V1 Constraints

| Constraint | Choice |
|---|---|
| Ops | No queues, no workers, no custom backend |
| SEO | Public pages only; account and billing noindex |
| Auth | Supabase email OTP |
| Billing | Stripe Checkout + Billing Portal |
| Analytics | GA4-ready event wrapper |
| Background tasks | Cron hitting protected API routes |
| Verification | Lightweight community confirmation via anonymous vote endpoint |
