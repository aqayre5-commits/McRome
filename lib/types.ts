export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type FAQItem = {
  q: string;
  a: string;
};

export type DeviceCompatibility = 'mobile' | 'xbox' | 'pc';
export type RegionalTier = 'tier1' | 'tier2';

export type RobloxPage = {
  id: number;
  name: string;
  slug: string;
  active_players: number;
  previous_active_players: number;
  active_players_change_24h: number;
  trend_spike_score: number;
  trend_spike_label: string | null;
  genre: string | null;
  icon_url: string | null;
  answer_block: string | null;
  useful_summary: string | null;
  detailed_guide: string | null;
  faq_data: FAQItem[] | null;
  language_code: string;
  device_compatibility: DeviceCompatibility[];
  verified_by_community: boolean;
  community_verification_count: number;
  community_verified_at: string | null;
  last_data_refresh: string | null;
  last_indexed_at: string | null;
  is_published: boolean;
  created_at: string;
};

export type ProfilePlan = 'free' | 'pro';

export type Profile = {
  id: string;
  email: string | null;
  plan: ProfilePlan;
  created_at: string;
  updated_at: string;
};

export type SubscriptionStatus =
  | 'inactive'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

export type Subscription = {
  id: string;
  user_id: string;
  customer_id: string | null;
  price_id: string | null;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type SavedGame = {
  user_id: string;
  page_id: number;
  created_at: string;
  roblox_pages?: RobloxPage;
};

export type BetaTesterSignup = {
  id: string;
  page_id: number;
  email: string;
  country_code: string | null;
  created_at: string;
};

export type CodeVoteStatus = 'verified_active' | 'mixed' | 'likely_expired' | 'unverified';

export type GameCode = {
  id: number;
  page_id: number;
  code_text: string;
  description: string | null;
  is_active: boolean;
  added_at: string;
};

/** `GameCode` enriched with 24-hour vote aggregates — computed server-side. */
export type GameCodeWithVotes = GameCode & {
  total_votes_24h: number;
  working_votes_24h: number;
  /** null when no votes have been cast in the last 24 hours. */
  success_rate_24h: number | null;
};

export type RegionalOffer = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  url: string;
  tier: RegionalTier;
};
