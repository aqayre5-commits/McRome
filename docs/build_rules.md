# Build Rules

| Rank | Rule | Implementation choice |
|---|---|---|
| 1 | Simple architecture over abstract architecture | Next.js route handlers instead of separate backend service |
| 2 | Low ops overhead | Supabase + Stripe + cron; no queues, no workers |
| 3 | SEO readiness | Public pages only; structured data; clean route map |
| 4 | Maintainability | Typed helpers, modular folders, utility tests |
| 5 | Security | Service-role use only in server routes/services |
| 6 | Performance | Server-rendered public pages, minimal client JS |
| 7 | Analytics readiness | Event taxonomy and GA4-ready wrapper |
| 8 | No subsystem without v1 value | No CMS, no queue, no admin dashboard |
