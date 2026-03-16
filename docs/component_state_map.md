# Component-State Map

| Component | Inputs | States | Outputs | Failure handling |
|---|---|---|---|---|
| `Header` | current user | guest, auth | nav links | fallback to guest |
| `Hero` | none | default | browse/search CTA | none |
| `SearchForm` | default query | idle, submit | query string | native GET fallback |
| `GameCard` | `RobloxPage` | image, no-image | route link | no-image placeholder |
| `GameGrid` | `RobloxPage[]` | list, empty | card layout | empty-state block |
| `UsefulAnswerArticle` | `RobloxPage` | summary, no-summary, faq, no-faq | JSON-LD + content | hides missing sections |
| `SaveGameForm` | page id, redirect path | save, remove | post form | login redirect |
| `PricingTable` | none | free, pro | checkout post | missing price id errors server-side |
| `PaywallCta` | none | default | pricing/login CTA | none |
| `DashboardPage` | user, saved games, subscription | auth, no-auth, free, pro, empty | saved list | redirect or upsell |
| `AccountPage` | user, subscription | auth, no-auth | portal/logout forms | redirect to login |
