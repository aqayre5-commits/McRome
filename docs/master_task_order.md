# Master Task Order

| Task | Work item | Depends on | Deliverable | Acceptance criteria |
|---|---|---|---|---|
| T01 | Initialize repo scaffolding | - | package.json, tsconfig, app router, Tailwind files committed | Project installs and `npm run dev` boots |
| T02 | Add environment contract | T01 | `.env.example` and `lib/env.ts` created | Missing required env throws on boot |
| T03 | Create design tokens and global layout | T01 | `globals.css`, header, footer, container | Landing shell renders responsive header/footer |
| T04 | Write SQL migration | T02 | `001_initial.sql` added | Migration runs without manual edits |
| T05 | Add Supabase server, browser, service clients | T04 | helper clients in `lib/supabase` | Public queries and auth routes can import helpers |
| T06 | Add public data access layer | T05 | `getFeaturedPages`, `getGames`, `getGameBySlug` | Queries return typed results or safe empty arrays |
| T07 | Build landing page | T03,T06 | `/` uses featured data and hero | Home page renders without client JS requirements |
| T08 | Build games directory | T06,T07 | `/games` with search query handling | Search query filters list server-side |
| T09 | Build useful answer article component | T06 | semantic renderer + JSON-LD | Game page content sections hide cleanly when missing |
| T10 | Build game detail page | T08,T09 | `/games/[slug]` and metadata | Published pages 200; missing slug 404 |
| T11 | Add sitemap and robots | T10 | `app/sitemap.ts`, `app/robots.ts` | Only public routes indexable |
| T12 | Add Rolimons sync service | T04,T05 | `syncTopRobloxGames` | Top N pages upsert into `roblox_pages` |
| T13 | Add Gemini enrichment service | T12 | `enrichPageWithAI` + zod validation | Published page gets summary, guide, FAQ |
| T14 | Add Google indexing service | T13 | `requestIndexing` with newline-safe key parsing | Valid service account can submit URL update |
| T15 | Add protected cron sync route | T12 | `/api/cron/sync` | Unauthorized requests return 401 |
| T16 | Add protected cron enrich route | T13,T14 | `/api/cron/enrich` | Processes batch and returns count |
| T17 | Add auth login route | T05 | `/api/auth/login` | Valid email sends magic link |
| T18 | Add callback and session middleware | T17 | `/auth/callback`, `middleware.ts` | Magic link establishes session |
| T19 | Build login page | T17 | `/login` form | Success state visible after submit |
| T20 | Add saved game route | T18 | `/api/saved-games` | Save/remove works for current user only |
| T21 | Add dashboard page | T20 | `/dashboard` with empty/pro/free states | Unauth redirects to login |
| T22 | Add pricing page | T03 | `/pricing` | Free and Pro values visible |
| T23 | Add Stripe checkout route | T18,T22 | `/api/stripe/checkout` | Auth user is redirected to Checkout |
| T24 | Add Stripe webhook route | T23 | `/api/stripe/webhook` | Subscription table updates on events |
| T25 | Add billing portal route | T24 | `/api/stripe/portal` | Subscribed user reaches portal |
| T26 | Add account page | T25 | `/account` | Shows email, status, portal, logout |
| T27 | Add tests for content helpers | T09 | `tests/content.test.ts` | Tests pass locally |
| T28 | Write analytics event plan | T07,T21,T23 | `docs/analytics_events.md` | All critical actions mapped |
| T29 | Write QA and release docs | T11,T21,T26 | QA + walkthrough + checklist docs | Launch pack complete |
| T30 | Create delivery ZIP | T29 | archive generated | Single downloadable bundle available |
