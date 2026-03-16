# Metadata and SEO Brief

| Surface | Title pattern | Description pattern | Index rule |
|---|---|---|---|
| Home | `RoMeta Guides` | site value proposition | index |
| Games directory | `Published Roblox guides` | browse/search pitch | index |
| Game detail | `{Game Name} guide, tips, FAQ` | summary-derived description | index |
| Pricing | `Pricing` | commercial copy | index |
| Login | `Sign in` | auth description | noindex |
| Dashboard | `Dashboard` | account description | noindex |
| Account | `Account` | billing description | noindex |

## Structured Data

| Type | Route | Purpose |
|---|---|---|
| `Article` | `/games/[slug]` | define main content entity |
| `FAQPage` | `/games/[slug]` | eligible FAQ understanding |
| `WebSite` | optional v1.1 | site search enhancement |

## Indexing Rules

| Rank | Rule |
|---|---|
| 1 | Only publish pages with visible summary or guide content |
| 2 | Do not index auth, account, API, or callback routes |
| 3 | Sitemap includes published pages only |
| 4 | Canonical self-reference each public page |
| 5 | Keep page slug stable once published |
