# Implementation Plan

## 1. Build Order

| Rank | Phase | Scope | Output |
|---|---|---|---|
| 1 | Foundation | repo, env, styles, layout, type system | running shell app |
| 2 | Data | migration, Supabase helpers, public queries | persisted content model |
| 3 | Public UX | landing, directory, game detail, metadata | indexable site |
| 4 | Content engine | Rolimons sync, Gemini enrich, indexing | publishing pipeline |
| 5 | Account | login, callback, dashboard, save flow | retained user loop |
| 6 | Billing | pricing, checkout, webhook, portal | monetization |
| 7 | QA and release | docs, acceptance, launch checklist | ship pack |

## 2. Fast Iteration Rules

| Rank | Rule | Tactic |
|---|---|---|
| 1 | Keep first deploy useful | public pages before billing |
| 2 | Minimize unknowns | native forms over complex client state |
| 3 | Avoid partial systems | no admin UI until public + billing flows work |
| 4 | Ship narrow | top 100 sync first; scale after quality checks |

## 3. Acceptance Gates

| Gate | Required evidence |
|---|---|
| Foundation gate | app boots, env validates, layout renders |
| Public SEO gate | game pages render metadata, FAQ JSON-LD, sitemap includes slugs |
| Pipeline gate | sync inserts pages, enrich publishes pages |
| Account gate | magic link sets session, save/remove works |
| Billing gate | checkout starts, webhook updates subscription, portal opens |
| Release gate | checklist complete, QA report reviewed |
