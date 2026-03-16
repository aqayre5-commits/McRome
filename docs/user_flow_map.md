# User Flow Map

## 1. Public Discovery Flow

| Step | Screen | Action | Output |
|---|---|---|---|
| 1 | Landing | Click browse or search | Move to directory |
| 2 | Directory | Search by game name | Filtered game list |
| 3 | Game page | Read takeaways, guide, FAQ | Useful answer consumed |
| 4 | Game page | Click save CTA | Login or save action |

## 2. Auth Flow

| Step | Screen | Action | Output |
|---|---|---|---|
| 1 | Login | Submit email | Magic link requested |
| 2 | Email | Open link | Callback route hit |
| 3 | Callback | Exchange code for session | Auth cookie set |
| 4 | Dashboard | View saved games | Retained account state |

## 3. Billing Flow

| Step | Screen | Action | Output |
|---|---|---|---|
| 1 | Pricing | Submit Pro checkout form | Stripe Checkout session |
| 2 | Stripe | Complete purchase | Webhook updates subscription |
| 3 | Account | Open billing portal | Stripe portal session |
| 4 | Dashboard | Revisit | Pro state reflected |

## 4. Content Pipeline Flow

| Step | System | Action | Output |
|---|---|---|---|
| 1 | Cron sync | Pull Rolimons top games | `roblox_pages` upserted |
| 2 | Cron enrich | Select unpublished pages | Batch selected |
| 3 | Gemini | Generate summary, guide, FAQ | Validated JSON |
| 4 | Supabase | Update page record | Publish ready |
| 5 | Google Indexing | Submit URL update | Index request sent |
