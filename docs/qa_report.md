# QA Report

## 1. Verification Matrix

| Area | Scenario | Status | Evidence type | Notes |
|---|---|---|---|---|
| Core flow | landing to game page | Specified in code | manual test required | public routes implemented |
| Core flow | game page to save action | Specified in code | manual test required | login redirect path present |
| Core flow | login magic link | Specified in code | provider test required | Supabase callback route present |
| Core flow | pricing to checkout | Specified in code | provider test required | Stripe route present |
| Core flow | webhook to account state | Specified in code | provider test required | webhook writes subscription row |
| Edge state | empty directory search | Covered | code-path present | empty state block |
| Edge state | unpublished slug | Covered | code-path present | `notFound()` |
| Edge state | missing image | Covered | code-path present | placeholder UI |
| Failure mode | Rolimons fetch fail | Covered | code-path present | thrown error |
| Failure mode | invalid Gemini JSON | Covered | code-path present | zod + parse throw |
| Failure mode | bad webhook signature | Covered | code-path present | `400` |
| Responsive | landing, directory, detail | Specified in CSS/classes | manual test required | responsive rules included |
| SEO | metadata, canonical, JSON-LD, sitemap, robots | Covered | code-path present | private routes noindex |
| Auth | private route redirect | Covered | code-path present | dashboard/account redirect |
| Billing | missing customer id on portal | Covered | code-path present | redirect pricing |
| Analytics | event taxonomy | Planned | manual instrumentation required | wrapper + docs present |
| Forms | search, login, save, checkout | Covered | manual test required | native forms |

## 2. Highest-Risk Gaps

| Rank | Risk | Reason | Mitigation |
|---|---|---|---|
| 1 | Stripe user_id propagation | subscription events may miss metadata | store user id on checkout and on subscription metadata if extended |
| 2 | Rolimons field shape drift | external payload can change | add schema validation before upsert |
| 3 | Gemini formatting drift | model may return non-JSON | keep zod parse + retry wrapper in v1.1 |
| 4 | Save flow for free users | current route allows save insert | gate persistence in route if strict Pro-only behavior required |
| 5 | Sitemap scale | 10k pages manageable; >50k requires splitting | add sitemap index in v1.1 |
