# Walkthrough

## 1. Local Setup

| Step | Action | Expected result |
|---|---|---|
| 1 | copy `.env.example` to `.env.local` | env file present |
| 2 | run SQL migration | tables and policies created |
| 3 | install dependencies | lockfile + modules ready |
| 4 | run `npm run dev` | app reachable on localhost |

## 2. Content Pipeline

| Step | Action | Expected result |
|---|---|---|
| 1 | `POST /api/cron/sync` with cron secret | top pages inserted |
| 2 | inspect `roblox_pages` | unpublished rows visible |
| 3 | `POST /api/cron/enrich` with cron secret | rows gain summary, guide, FAQ, publish state |
| 4 | open `/games` | published rows visible |
| 5 | open `/games/[slug]` | metadata + JSON-LD rendered |

## 3. Account and Billing

| Step | Action | Expected result |
|---|---|---|
| 1 | open `/login` and submit email | magic link email sent |
| 2 | complete callback | session established |
| 3 | open `/pricing` and submit Pro checkout | redirect to Stripe Checkout |
| 4 | complete Stripe purchase | webhook persists subscription |
| 5 | open `/account` | active status visible |
| 6 | open `/dashboard` | saved games list available |
