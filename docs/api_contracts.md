# API Contracts

## 1. Public / Auth Routes

| Route | Method | Auth | Request | Success | Failure |
|---|---|---|---|---|---|
| `/api/auth/login` | POST | Public | `email`, `next` | redirect to `/login?sent=1` | redirect fallback |
| `/auth/callback` | GET | Public | `code`, `next` | redirect to `next` | redirect fallback |
| `/api/auth/logout` | POST | Auth | none | redirect `/` | redirect `/` |

## 2. User Action Routes

| Route | Method | Auth | Request | Success | Failure |
|---|---|---|---|---|---|
| `/api/saved-games` | POST | Auth | `pageId`, `redirectTo`, `intent` | redirect `redirectTo` | login redirect or fallback |
| `/api/stripe/checkout` | POST | Auth | `interval`, `returnPath` | Stripe Checkout redirect | pricing/login redirect |
| `/api/stripe/portal` | POST | Auth | none | Stripe portal redirect | login/pricing redirect |

## 3. System Routes

| Route | Method | Auth | Request | Success | Failure |
|---|---|---|---|---|---|
| `/api/cron/sync` | POST | Secret | header bearer / cron secret | `{ synced }` | `401` |
| `/api/cron/enrich` | POST | Secret | header bearer / cron secret | `{ processed }` | `401` |
| `/api/stripe/webhook` | POST | Stripe signature | raw body | `{ received: true }` | `400` |

## 4. Service Contracts

| Service | Input | Output | Validation |
|---|---|---|---|
| `syncTopRobloxGames(limit)` | number | synced count | HTTP status check |
| `enrichPageWithAI(pageId)` | page id | summary, guide, faq | zod + JSON parse |
| `requestIndexing(url)` | absolute URL | API response | JWT auth + status check |

## 5. Error Contract

| Case | HTTP / App response | User-visible outcome |
|---|---|---|
| Login validation fail | redirect | login screen remains |
| Save without session | redirect login | user signs in |
| Checkout without price id | server error | operator fix |
| Webhook signature invalid | 400 | no DB mutation |
| Gemini invalid JSON | thrown error | page remains unpublished |
| Rolimons fetch failure | thrown error | sync rerun |
