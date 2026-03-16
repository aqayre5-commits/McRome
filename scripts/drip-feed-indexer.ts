/**
 * drip-feed-indexer.ts
 * Submits published Roblox game pages to Google's Indexing API in a
 * rate-limited drip feed.  Targets pages that have never been indexed or
 * haven't been re-indexed in the last N days.
 *
 * Run: npm run index-pages
 *  or: npx tsx scripts/drip-feed-indexer.ts
 *
 * Required env vars (load from .env.local automatically):
 *   NEXT_PUBLIC_SITE_URL          – canonical domain, e.g. https://rometa.gg
 *   NEXT_PUBLIC_SUPABASE_URL      – Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY     – bypasses RLS; never expose client-side
 *   GOOGLE_SERVICE_ACCOUNT_JSON   – full JSON string of GCP service account
 *
 * Quota notes:
 *   Google Indexing API free tier: 200 requests/day.
 *   Default batch size is 180 to stay safely under the limit.
 *   Adjust BATCH_SIZE and DELAY_MS to suit your quota.
 */

// Load .env.local before anything else (Node 22+)
try {
  process.loadEnvFile('.env.local');
} catch {
  // File absent or already in env – not fatal
}

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// ─── Config ───────────────────────────────────────────────────────────────────

const BATCH_SIZE   = 180;           // max URLs per run (stay under 200/day quota)
const DELAY_MS     = 500;           // ms between each API call to avoid bursting
const REINDEX_DAYS = 7;             // re-submit pages older than this many days

// ─── ANSI colours ─────────────────────────────────────────────────────────────
const G = '\x1b[32m';
const R = '\x1b[31m';
const Y = '\x1b[33m';
const B = '\x1b[36m';
const D = '\x1b[2m';
const X = '\x1b[0m';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(icon: string, msg: string, detail = '') {
  console.log(`  ${icon}  ${msg}`);
  if (detail) console.log(`     ${D}${detail}${X}`);
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ─── Preflight checks ─────────────────────────────────────────────────────────

function preflight(): {
  siteUrl: string;
  supabaseUrl: string;
  serviceRoleKey: string;
  serviceAccount: object;
} {
  const errors: string[] = [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  if (!siteUrl || siteUrl.includes('placeholder') || siteUrl.includes('localhost')) {
    errors.push('NEXT_PUBLIC_SITE_URL must be a real production URL (not localhost or placeholder)');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is missing or a placeholder');
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!serviceRoleKey || serviceRoleKey.includes('placeholder')) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is missing or a placeholder');
  }

  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? '';
  if (!rawJson || rawJson.includes('placeholder')) {
    errors.push('GOOGLE_SERVICE_ACCOUNT_JSON is missing or a placeholder');
  }

  let serviceAccount: object = {};
  if (rawJson && !rawJson.includes('placeholder')) {
    try {
      const parsed = JSON.parse(rawJson) as {
        type?: string;
        client_email?: string;
        private_key?: string;
        project_id?: string;
      };
      if (
        parsed.type !== 'service_account' ||
        !parsed.client_email ||
        !parsed.private_key ||
        !parsed.project_id
      ) {
        errors.push(
          `GOOGLE_SERVICE_ACCOUNT_JSON is missing required fields ` +
          `(type=${parsed.type}, client_email=${!!parsed.client_email}, ` +
          `private_key=${!!parsed.private_key}, project_id=${!!parsed.project_id})`
        );
      } else if (!parsed.private_key.includes('BEGIN PRIVATE KEY')) {
        errors.push('GOOGLE_SERVICE_ACCOUNT_JSON private_key does not look like a valid PEM key');
      } else {
        serviceAccount = parsed;
      }
    } catch (err) {
      errors.push(`GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON: ${String(err)}`);
    }
  }

  if (errors.length > 0) {
    console.error(`\n${R}Preflight failed — fix these issues before running:${X}\n`);
    for (const e of errors) console.error(`  ${R}✗${X}  ${e}`);
    console.error('');
    process.exit(1);
  }

  return { siteUrl, supabaseUrl, serviceRoleKey, serviceAccount };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log(`\n${B}McRome — drip-feed indexer${X}\n`);

  // 1. Validate all env vars and parse service account JSON up-front so we
  //    never crash mid-loop on a bad credential.
  const { siteUrl, supabaseUrl, serviceRoleKey, serviceAccount } = preflight();
  log(`${G}✓${X}`, 'Preflight passed', `domain: ${siteUrl}`);

  // 2. Build Google Indexing API client from service account credentials.
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const indexing = google.indexing({ version: 'v3', auth });
  log(`${G}✓${X}`, 'Google auth client ready');

  // 3. Connect to Supabase with service role key (bypasses RLS).
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 4. Fetch pages that need indexing:
  //    – never indexed  (last_indexed_at IS NULL)
  //    – or stale       (last_indexed_at older than REINDEX_DAYS)
  const cutoff = new Date(Date.now() - REINDEX_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: pages, error: fetchError } = await supabase
    .from('roblox_pages')
    .select('id, slug, last_indexed_at')
    .eq('is_published', true)
    .or(`last_indexed_at.is.null,last_indexed_at.lt.${cutoff}`)
    .order('last_indexed_at', { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error(`\n${R}Supabase query failed:${X}`, fetchError.message);
    process.exit(1);
  }

  const total = pages?.length ?? 0;
  if (total === 0) {
    log(`${Y}–${X}`, 'Nothing to index', `all published pages indexed within the last ${REINDEX_DAYS} days`);
    console.log('');
    process.exit(0);
  }

  log(`${B}→${X}`, `Submitting ${total} URL(s)`, `batch limit: ${BATCH_SIZE}, delay: ${DELAY_MS}ms`);
  console.log('');

  // 5. Drip-feed each URL to the Indexing API.
  let submitted = 0;
  let failed    = 0;

  for (const page of pages ?? []) {
    const url = `${siteUrl}/games/${page.slug}`;

    try {
      await indexing.urlNotifications.publish({
        requestBody: {
          url,
          type: 'URL_UPDATED',
        },
      });

      // Mark indexed in Supabase.
      const { error: updateError } = await supabase
        .from('roblox_pages')
        .update({ last_indexed_at: new Date().toISOString() })
        .eq('id', page.id);

      if (updateError) {
        log(`${Y}⚠${X}`, `Indexed but DB update failed: ${page.slug}`, updateError.message);
      } else {
        log(`${G}✓${X}`, url);
      }

      submitted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`${R}✗${X}`, `Failed: ${url}`, msg);
      failed++;
    }

    // Respect rate limit between calls.
    if (submitted + failed < total) {
      await sleep(DELAY_MS);
    }
  }

  // 6. Summary.
  console.log(`\n${'─'.repeat(52)}`);
  console.log(`  ${G}${submitted} submitted${X}   ${failed > 0 ? R : G}${failed} failed${X}`);
  if (failed > 0) {
    console.log(`\n${Y}Tip: failed URLs will be retried on the next run.${X}`);
  }
  console.log('');

  process.exit(failed > 0 ? 1 : 0);
})();
