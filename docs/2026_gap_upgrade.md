# 2026 Gap Upgrade

| Area | Change |
|---|---|
| Schema | Added `answer_block`, `language_code`, `device_compatibility`, `last_data_refresh`, `verified_by_community`, `community_verification_count`, `community_verified_at`, `previous_active_players`, `active_players_change_24h`, `trend_spike_score`, `trend_spike_label` |
| Community signal | Added `community_verifications` table and `/api/community-verify` route |
| Lead capture | Added `beta_tester_signups` table and `/api/beta-tester-signups` route |
| AI enrichment | Added sub-100-word `answer_block` generation and hard clamp |
| Sync logic | Added active-player delta storage and trend spike labeling |
| Frontend | Added answer block section, freshness badges, community verification UI, Robux converter, monetization rail |
| Pricing | Added country-aware Stripe price resolution and region-aware pricing copy |
| SEO | Added dynamic year + active player titles and verified-only sitemap drip feed |
| Indexing | Added `/api/cron/index-verified` route for top verified pages |
