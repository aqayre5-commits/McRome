// Set required env vars before any module import so lib/env.ts can parse them
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'placeholder-service-role-key';
process.env.REGIONAL_TIER1_COUNTRIES = 'US,CA,GB,AU,NZ,DE,FR,NL,SE,NO,DK,CH,IE,SG,JP';
process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_monthly_default';
process.env.STRIPE_PRICE_PRO_YEARLY = 'price_yearly_default';
process.env.STRIPE_PRICE_PRO_MONTHLY_TIER1 = 'price_monthly_tier1';
process.env.STRIPE_PRICE_PRO_YEARLY_TIER1 = 'price_yearly_tier1';
process.env.STRIPE_PRICE_PRO_MONTHLY_TIER2 = 'price_monthly_tier2';
process.env.STRIPE_PRICE_PRO_YEARLY_TIER2 = 'price_yearly_tier2';
process.env.CPA_BETA_SIGNUP_URL_TIER1 = 'https://example.com/tier1';
process.env.CPA_BETA_SIGNUP_URL_TIER2 = 'https://example.com/tier2';
