# Data Model

## 1. Entity Table

| Entity | Key | Purpose | Notes |
|---|---|---|---|
| `roblox_pages` | `id bigint` | public SEO page content | source + AI-enriched fields |
| `profiles` | `id uuid` | user account profile | mirrors `auth.users` |
| `subscriptions` | `id text` | Stripe subscription state | one active row per subscription id |
| `saved_games` | `(user_id, page_id)` | user-page relation | supports dashboard |

## 2. Field Model

### `roblox_pages`

| Field | Type | Required | Source |
|---|---|---|---|
| `id` | bigint | yes | Rolimons / Roblox place id |
| `name` | text | yes | Rolimons |
| `slug` | text | yes | generated |
| `active_players` | integer | yes | Rolimons |
| `genre` | text | no | optional enrichment |
| `icon_url` | text | no | Rolimons |
| `useful_summary` | text | no | Gemini |
| `detailed_guide` | text | no | Gemini |
| `faq_data` | jsonb | yes | Gemini |
| `last_indexed_at` | timestamptz | no | publish pipeline |
| `is_published` | boolean | yes | publish gate |

### `profiles`

| Field | Type | Required | Source |
|---|---|---|---|
| `id` | uuid | yes | Supabase Auth |
| `email` | text | no | Supabase Auth |
| `plan` | text | yes | app/webhook |

### `subscriptions`

| Field | Type | Required | Source |
|---|---|---|---|
| `id` | text | yes | Stripe subscription id |
| `user_id` | uuid | yes | checkout metadata |
| `customer_id` | text | no | Stripe |
| `price_id` | text | no | Stripe |
| `status` | text | yes | Stripe |

### `saved_games`

| Field | Type | Required | Source |
|---|---|---|---|
| `user_id` | uuid | yes | current user |
| `page_id` | bigint | yes | selected page |

## 3. Relation Map

| From | To | Type | Use |
|---|---|---|---|
| `profiles.id` | `subscriptions.user_id` | 1:N | plan status lookup |
| `profiles.id` | `saved_games.user_id` | 1:N | dashboard list |
| `roblox_pages.id` | `saved_games.page_id` | 1:N | saved page relation |

## 4. Indexing Rules

| Rank | Rule | Why |
|---|---|---|
| 1 | `slug` unique index | public route lookup |
| 2 | `active_players` index | sort top pages |
| 3 | `(is_published, name)` index | directory filtering |
| 4 | `saved_games(user_id)` index | dashboard speed |
