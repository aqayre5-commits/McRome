# Analytics Events

| Rank | Event | Trigger | Properties | KPI use |
|---|---|---|---|---|
| 1 | `page_view` | every page load | `route`, `slug`, `plan_state` | traffic split |
| 2 | `search_submitted` | directory or hero search | `query`, `source_route` | search intent rate |
| 3 | `game_saved` | save/remove submit | `page_id`, `intent`, `plan_state` | retention proxy |
| 4 | `pricing_viewed` | pricing page load | `source_route` | paywall view rate |
| 5 | `checkout_started` | checkout submit | `interval`, `source_route` | purchase funnel |
| 6 | `checkout_completed` | webhook success | `price_id`, `user_id` | conversion |
| 7 | `login_requested` | login submit | `next_route` | auth funnel |
| 8 | `billing_portal_opened` | portal submit | `plan_state` | self-serve billing usage |

## Event Rules

| Rule | Detail |
|---|---|
| Event source | send from route handlers or server-rendered page wrappers where possible |
| PII handling | never send raw email |
| Billing truth | derive conversion from Stripe webhook, not client callback |
| SEO split | separate public page traffic from account traffic |
