# Page / Screen Inventory

| Rank | Route | Type | Goal | SEO | Auth |
|---|---|---|---|---|---|
| 1 | `/` | Landing | Convert search and direct traffic to game exploration | Index | Public |
| 2 | `/games` | Directory | Search and browse published game pages | Index | Public |
| 3 | `/games/[slug]` | SEO detail | Deliver useful answer, FAQ, and save CTA | Index | Public |
| 4 | `/pricing` | Commercial | Convert frequent users to Pro | Index | Public |
| 5 | `/login` | Auth | Trigger magic-link login | Noindex | Public |
| 6 | `/dashboard` | Account | Show saved games | Noindex | Auth |
| 7 | `/account` | Billing | Show plan and portal action | Noindex | Auth |
| 8 | `/auth/callback` | System | Complete session exchange | Noindex | Public |
| 9 | `/api/cron/sync` | System | Sync Rolimons game data | Noindex | Secret |
| 10 | `/api/cron/enrich` | System | Generate AI content and request indexing | Noindex | Secret |
| 11 | `/api/auth/login` | System | Send magic link | Noindex | Public |
| 12 | `/api/auth/logout` | System | End session | Noindex | Auth |
| 13 | `/api/saved-games` | System | Save/remove page for current user | Noindex | Auth |
| 14 | `/api/stripe/checkout` | System | Start subscription checkout | Noindex | Auth |
| 15 | `/api/stripe/portal` | System | Open billing portal | Noindex | Auth |
| 16 | `/api/stripe/webhook` | System | Persist Stripe subscription state | Noindex | Secret |
| 17 | `/sitemap.xml` | SEO | Publish URLs for indexing | Index helper | Public |
| 18 | `/robots.txt` | SEO | Control crawl boundaries | Index helper | Public |
