/**
 * verify-health.ts
 * Core connectivity smoke test for rometa-guides.
 * Run: npx tsx scripts/verify-health.ts
 *
 * Each check reports PASS / SKIP / FAIL independently so partial
 * credentials still produce useful output.
 */

// Load .env.local before anything else (Node 22+)
try {
  process.loadEnvFile('.env.local');
} catch {
  // File absent or already in env – not fatal
}

// ─── ANSI colours ─────────────────────────────────────────────────────────────
const G = '\x1b[32m';  // green
const R = '\x1b[31m';  // red
const Y = '\x1b[33m';  // yellow
const B = '\x1b[36m';  // cyan
const D = '\x1b[2m';   // dim
const X = '\x1b[0m';   // reset

type Status = 'PASS' | 'FAIL' | 'SKIP';

interface Result {
  name: string;
  status: Status;
  detail: string;
}

const results: Result[] = [];

function record(name: string, status: Status, detail: string) {
  const icon = status === 'PASS' ? `${G}✓${X}` : status === 'SKIP' ? `${Y}–${X}` : `${R}✗${X}`;
  const label = status === 'PASS' ? `${G}PASS${X}` : status === 'SKIP' ? `${Y}SKIP${X}` : `${R}FAIL${X}`;
  console.log(`  ${icon}  ${label}  ${name}`);
  if (detail) console.log(`         ${D}${detail}${X}`);
  results.push({ name, status, detail });
}

function isPlaceholder(val: string | undefined, fragment: string): boolean {
  return !val || val.includes(fragment) || val.includes('placeholder') || val.includes('replace-me') || val.includes('XXXXXXXXXX');
}

// ─── main ──────────────────────────────────────────────────────────────────────
(async () => {

// ─── 1. Environment variables ─────────────────────────────────────────────────
console.log(`\n${B}[ 1/6 ] Environment variables${X}`);
{
  const required: Array<[string, string]> = [
    ['NEXT_PUBLIC_SITE_URL',        'placeholder'],
    ['NEXT_PUBLIC_SUPABASE_URL',    'placeholder'],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder'],
    ['SUPABASE_SERVICE_ROLE_KEY',   'placeholder'],
    ['STRIPE_SECRET_KEY',           'placeholder'],
    ['STRIPE_WEBHOOK_SECRET',       'whsec_placeholder'],
    ['STRIPE_PRICE_PRO_MONTHLY',    'price_placeholder'],
    ['CRON_SECRET',                 'replace-me'],
    ['GEMINI_API_KEY',              'placeholder'],
  ];

  for (const [key, bad] of required) {
    const val = process.env[key];
    if (!val) {
      record(key, 'FAIL', 'missing');
    } else if (isPlaceholder(val, bad)) {
      record(key, 'SKIP', `placeholder value detected — replace before production`);
    } else {
      record(key, 'PASS', `set (${val.slice(0, 8)}…)`);
    }
  }

  const optional: string[] = ['GEMINI_API_KEY', 'GOOGLE_SERVICE_ACCOUNT_JSON', 'GA_MEASUREMENT_ID'];
  for (const key of optional) {
    const val = process.env[key];
    if (!val || isPlaceholder(val, 'placeholder')) {
      record(key, 'SKIP', 'optional — not required for public pages');
    }
  }
}

// ─── 2. Supabase REST API ─────────────────────────────────────────────────────
console.log(`\n${B}[ 2/6 ] Supabase connectivity${X}`);
{
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (isPlaceholder(url, 'placeholder') || isPlaceholder(key, 'placeholder')) {
    record('Supabase REST ping', 'SKIP', 'placeholder credentials — skipping network call');
    record('roblox_pages table', 'SKIP', 'requires real Supabase connection');
    record('profiles table', 'SKIP', 'requires real Supabase connection');
  } else {
    try {
      const res = await fetch(`${url}/rest/v1/roblox_pages?select=id&limit=1&is_published=eq.true`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      if (res.ok) {
        const rows = await res.json() as unknown[];
        record('Supabase REST ping', 'PASS', `${url}`);
        record('roblox_pages table', rows.length > 0 ? 'PASS' : 'FAIL',
          rows.length > 0 ? `${rows.length} published row(s) found` : 'table reachable but 0 published rows — run cron/sync then cron/enrich first');
      } else {
        const body = await res.text();
        record('Supabase REST ping', 'FAIL', `HTTP ${res.status}: ${body.slice(0, 120)}`);
        record('roblox_pages table', 'SKIP', 'depends on REST ping');
      }
    } catch (err) {
      record('Supabase REST ping', 'FAIL', String(err));
      record('roblox_pages table', 'SKIP', 'depends on REST ping');
    }

    try {
      const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
      const res = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
        headers: { apikey: svcKey, Authorization: `Bearer ${svcKey}` }
      });
      record('profiles table (service role)', res.ok ? 'PASS' : 'FAIL',
        res.ok ? 'service role key accepted' : `HTTP ${res.status}`);
    } catch (err) {
      record('profiles table (service role)', 'FAIL', String(err));
    }
  }
}

// ─── 3. Stripe key format ─────────────────────────────────────────────────────
console.log(`\n${B}[ 3/6 ] Stripe${X}`);
{
  const sk = process.env.STRIPE_SECRET_KEY ?? '';

  if (isPlaceholder(sk, 'placeholder')) {
    record('Stripe secret key format', 'SKIP', 'placeholder — replace with sk_live_… or sk_test_…');
    record('Stripe price IDs', 'SKIP', 'requires real Stripe keys');
  } else if (sk.startsWith('sk_live_') || sk.startsWith('sk_test_')) {
    const mode = sk.startsWith('sk_live_') ? 'LIVE' : 'TEST';
    record('Stripe secret key format', 'PASS', `${mode} key detected (${sk.slice(0, 14)}…)`);

    // Attempt a lightweight Stripe API call (balance retrieve)
    try {
      const res = await fetch('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${sk}` }
      });
      if (res.ok) {
        record('Stripe API connectivity', 'PASS', 'balance endpoint reachable');
      } else {
        const body = await res.json() as { error?: { message?: string } };
        record('Stripe API connectivity', 'FAIL', body.error?.message ?? `HTTP ${res.status}`);
      }
    } catch (err) {
      record('Stripe API connectivity', 'FAIL', String(err));
    }

    // Validate price IDs are set
    const priceVars = [
      'STRIPE_PRICE_PRO_MONTHLY', 'STRIPE_PRICE_PRO_YEARLY',
      'STRIPE_PRICE_PRO_MONTHLY_TIER1', 'STRIPE_PRICE_PRO_YEARLY_TIER1',
      'STRIPE_PRICE_PRO_MONTHLY_TIER2', 'STRIPE_PRICE_PRO_YEARLY_TIER2',
    ];
    const missing = priceVars.filter(v => isPlaceholder(process.env[v], 'placeholder'));
    if (missing.length === 0) {
      record('Stripe price IDs', 'PASS', 'all 6 price vars set');
    } else {
      record('Stripe price IDs', 'FAIL', `missing or placeholder: ${missing.join(', ')}`);
    }
  } else {
    record('Stripe secret key format', 'FAIL', `unexpected format: ${sk.slice(0, 12)}… (expected sk_live_ or sk_test_)`);
    record('Stripe price IDs', 'SKIP', 'depends on valid key');
  }

  const whSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  if (isPlaceholder(whSecret, 'whsec_placeholder')) {
    record('Stripe webhook secret', 'SKIP', 'placeholder — set from Stripe Dashboard → Webhooks');
  } else if (whSecret.startsWith('whsec_')) {
    record('Stripe webhook secret', 'PASS', `${whSecret.slice(0, 12)}…`);
  } else {
    record('Stripe webhook secret', 'FAIL', 'must start with whsec_');
  }
}

// ─── 4. Rolimons API (public, no key) ─────────────────────────────────────────
console.log(`\n${B}[ 4/6 ] Rolimons API${X}`);
{
  try {
    const res = await fetch('https://api.rolimons.com/games/v1/gamelist', {
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      const json = await res.json() as { games?: Record<string, unknown> };
      const count = Object.keys(json.games ?? {}).length;
      record('Rolimons gamelist', 'PASS', `${count} games returned`);
    } else {
      record('Rolimons gamelist', 'FAIL', `HTTP ${res.status} — cron/sync will fail`);
    }
  } catch (err) {
    record('Rolimons gamelist', 'FAIL', `network error: ${String(err)}`);
  }
}

// ─── 5. Gemini API ────────────────────────────────────────────────────────────
console.log(`\n${B}[ 5/6 ] Gemini AI${X}`);
{
  const key = process.env.GEMINI_API_KEY ?? '';
  if (isPlaceholder(key, 'placeholder')) {
    record('Gemini API key', 'SKIP', 'placeholder — cron/enrich will fail without it');
  } else {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) {
        const json = await res.json() as { models?: Array<{ name: string }> };
        const flash = json.models?.find(m => m.name.includes('gemini-2.5-flash'));
        record('Gemini API key', 'PASS', 'key accepted');
        record('gemini-2.5-flash model', flash ? 'PASS' : 'FAIL',
          flash ? flash.name : 'model not found in account — check quota / region');
      } else {
        const body = await res.json() as { error?: { message?: string } };
        record('Gemini API key', 'FAIL', body.error?.message ?? `HTTP ${res.status}`);
        record('gemini-2.5-flash model', 'SKIP', 'depends on API key');
      }
    } catch (err) {
      record('Gemini API key', 'FAIL', String(err));
      record('gemini-2.5-flash model', 'SKIP', 'depends on API key');
    }
  }
}

// ─── 6. Google Service Account JSON ───────────────────────────────────────────
console.log(`\n${B}[ 6/6 ] Google Service Account (Indexing API)${X}`);
{
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? '';
  if (!raw || raw.includes('placeholder')) {
    record('Service account JSON', 'SKIP', 'placeholder — cron/index-verified will skip without it');
  } else {
    try {
      const parsed = JSON.parse(raw) as {
        type?: string;
        client_email?: string;
        private_key?: string;
        project_id?: string;
      };
      const hasFields = parsed.type === 'service_account'
        && typeof parsed.client_email === 'string'
        && typeof parsed.private_key === 'string'
        && typeof parsed.project_id === 'string';

      if (hasFields) {
        const keyPreview = (parsed.private_key ?? '').includes('BEGIN PRIVATE KEY') ? 'PEM key present' : 'key format unexpected';
        record('Service account JSON', 'PASS', `${parsed.client_email} · ${keyPreview}`);
      } else {
        record('Service account JSON', 'FAIL', `missing fields: type=${parsed.type}, client_email=${!!parsed.client_email}, private_key=${!!parsed.private_key}`);
      }
    } catch (err) {
      record('Service account JSON', 'FAIL', `JSON.parse failed: ${String(err)}`);
    }
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────
const pass = results.filter(r => r.status === 'PASS').length;
const skip = results.filter(r => r.status === 'SKIP').length;
const fail = results.filter(r => r.status === 'FAIL').length;

console.log(`\n${'─'.repeat(52)}`);
console.log(`  ${G}${pass} passed${X}   ${Y}${skip} skipped${X}   ${fail > 0 ? R : G}${fail} failed${X}`);

if (fail > 0) {
  console.log(`\n${R}Failed checks:${X}`);
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  ${R}✗${X}  ${r.name}`);
    console.log(`     ${D}${r.detail}${X}`);
  });
}

if (skip > 0) {
  console.log(`\n${Y}Skipped (placeholder credentials):${X}`);
  results.filter(r => r.status === 'SKIP').forEach(r => {
    console.log(`  ${Y}–${X}  ${r.name}`);
  });
}

console.log(`\n${D}Replace placeholder values in .env.local to enable skipped checks.${X}\n`);

process.exit(fail > 0 ? 1 : 0);

})();
