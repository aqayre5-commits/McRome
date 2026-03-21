import slugify from 'slugify';
import { GoogleGenAI } from '@google/genai';
import { JWT } from 'google-auth-library';
import { clampWords } from '@/lib/content';
import { geminiResponseSchema } from '@/lib/contracts/api';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { absoluteUrl } from '@/lib/utils';
import { computePublishScore } from '@/lib/ranking';

type RolimonsGameMap = Record<string, [string, number, string?, ...unknown[]]>;

type ExistingPageSnapshot = {
  id: number;
  active_players: number;
  verified_by_community: boolean;
  is_published: boolean;
};

const supabase = createServiceSupabaseClient();

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// --- Helper Functions ---

function uniqueSlug(name: string, id: number) {
  return `${slugify(name, { lower: true, strict: true })}-${id}`;
}

function getTrendSpikeScore(previousPlayers: number, currentPlayers: number) {
  if (previousPlayers <= 0) return 0;
  const delta = currentPlayers - previousPlayers;
  if (delta <= 0) return 0;
  return Number((delta / previousPlayers).toFixed(4));
}

function getTrendSpikeLabel(score: number, change: number) {
  if (score >= 0.5 && change >= 5000) return 'Major trend spike';
  if (score >= 0.25 && change >= 2000) return 'Rapidly rising';
  if (score >= 0.1 && change >= 1000) return 'Traffic spike detected';
  return null;
}

function buildVerifiedDisclaimer(): string {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  return `\n\nThis guide was cross-referenced by the McRome engine and verified by community success rates on ${date}. Player counts reflect live data at time of generation.`;
}

function buildInformationGainPrompt(page: any) {
  const activePlayers = Number(page.active_players ?? 0).toLocaleString();
  return `You are a professional Roblox Game Analyst for McRome. Write a high-impact guide for "${page.name}".

LIVE DATA: ${activePlayers} players are currently active.

CONTENT RULES:
1. No generic fluff. Start with core gameplay.
2. Mention at least 2 specific mechanics (e.g. "grinding", "trading", "rebirths").
3. Compare briefly to 1 other related Roblox game.
4. Sentences must be short and punchy.

OUTPUT RULES (CRITICAL — failure to follow will cause a parse error):
- Return ONLY a single valid JSON object. No markdown, no code fences, no extra text.
- Every string value must be on a single line. Do NOT use literal newlines inside string values.
- Use \\n (the two characters backslash-n) if you need a line break inside a string.
- Do NOT include tab characters or any other control characters inside strings.
- Escape all double-quotes inside string values with a backslash.

JSON SCHEMA:
{
  "answer_block": "Single-line string: What is ${page.name}? (2-3 sentences)",
  "summary": ["Single-line reason 1", "Single-line reason 2", "Single-line reason 3"],
  "guide": "Single-line string with \\\\n for paragraph breaks.",
  "faqs": [{"q": "Question?", "a": "Single-line answer."}]
}`;
}

/** Strip bare control characters that make JSON.parse throw "Bad control character" */
function sanitizeForJson(s: string): string {
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // non-printable controls
    .replace(/\r\n/g, '\\n')   // CRLF → escaped newline
    .replace(/\r/g, '\\n')     // CR   → escaped newline
    .replace(/\n/g, '\\n')     // LF   → escaped newline (inside JSON strings only safe when escaped)
    .replace(/\t/g, '\\t');    // TAB  → escaped tab
}

/**
 * JSON.parse that tolerates bare control characters inside string values.
 * Useful for env vars like GOOGLE_SERVICE_ACCOUNT_JSON whose private_key
 * may contain literal newlines when pasted into Vercel/CI dashboards.
 */
function safeJsonParse<T = unknown>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Second attempt: sanitize control chars inside string values then re-parse
    const cleaned = raw.replace(/"((?:[^"\\]|\\.)*)"/gs, (_, inner) => {
      return `"${sanitizeForJson(inner)}"`;
    });
    return JSON.parse(cleaned) as T;
  }
}

function normalizeGeminiJson(raw: string) {
  // Extract JSON block even if Gemini includes markdown fences
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const extracted = jsonMatch ? jsonMatch[0] : raw;

  // Sanitize control characters inside string values before parsing
  // We only sanitize content inside JSON string values, not the structural characters
  const cleanJson = extracted.replace(/"((?:[^"\\]|\\.)*)"/g, (_, inner) => {
    return `"${sanitizeForJson(inner)}"`;
  });

  try {
    const parsed = JSON.parse(cleanJson);
    const validated = geminiResponseSchema.parse(parsed);

    return {
      answer_block: clampWords(validated.answer_block, 100),
      summary: Array.isArray(validated.summary) ? validated.summary.join('\n') : validated.summary,
      guide: validated.guide,
      faqs: validated.faqs.slice(0, 4)
    };
  } catch (e) {
    console.error("Gemini Output failed to parse as JSON:", raw);
    throw new Error("Invalid AI content format.");
  }
}

async function getExistingPageMap(ids: number[]) {
  const { data, error } = await supabase
    .from('roblox_pages')
    .select('id,active_players,verified_by_community,is_published')
    .in('id', ids);

  if (error || !data) return new Map<number, ExistingPageSnapshot>();
  return new Map<number, ExistingPageSnapshot>(
    (data as ExistingPageSnapshot[]).map((row) => [row.id, row])
  );
}

/** Fetch positiveRatingPercentage and likeCount from Roblox for up to 100 universe IDs at once */
async function fetchRobloxRatings(ids: string[]): Promise<Map<number, { rating: number; likeCount: number }>> {
  const map = new Map<number, { rating: number; likeCount: number }>();
  try {
    const url = `https://games.roblox.com/v1/games?universeIds=${ids.join(',')}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return map;
    const json = (await res.json()) as { data: { id: number; positiveRatingPercentage: number; likeCount: number }[] };
    for (const game of json.data ?? []) {
      map.set(game.id, {
        rating: game.positiveRatingPercentage ?? 0,
        likeCount: game.likeCount ?? 0,
      });
    }
  } catch {
    // Non-fatal — sync continues without rating data
  }
  return map;
}

// --- Main Service Functions ---

export async function syncTopRobloxGames(limit = 100) {
  const response = await fetch('https://api.rolimons.com/games/v1/gamelist', {
    next: { revalidate: 0 }
  });

  if (!response.ok) throw new Error(`Rolimons sync failed: ${response.status}`);

  const MIN_ACTIVE_PLAYERS = 5000;

  const json = (await response.json()) as { games: RolimonsGameMap };
  const games = Object.entries(json.games)
    .filter(([, details]) => Number(details[1] ?? 0) >= MIN_ACTIVE_PLAYERS)
    .sort(([, a], [, b]) => Number(b[1] ?? 0) - Number(a[1] ?? 0))
    .slice(0, limit);

  // Batch-fetch Roblox rating percentages (up to 100 IDs per request)
  const ratingMap = await fetchRobloxRatings(games.map(([id]) => id));
  const ids = games.map(([id]) => Number(id));
  const existing = await getExistingPageMap(ids);
  const now = new Date().toISOString();

  const upsertData = games.map(([id, details]) => {
    const numId = Number(id);
    const curPlayers = Number(details[1] ?? 0);
    const prevPlayers = existing.get(numId)?.active_players ?? curPlayers;
    const change = curPlayers - prevPlayers;
    const score = getTrendSpikeScore(prevPlayers, curPlayers);

    const ratingEntry = ratingMap.get(numId) ?? null;
    const ratingPct = ratingEntry?.rating ?? null;
    const likeCount = ratingEntry?.likeCount ?? null;
    const featuredScore = ratingPct !== null
      ? Math.round(curPlayers * (ratingPct / 100))
      : null;

    const publishScore = computePublishScore({
      active_players: curPlayers,
      active_players_change_24h: change,
      rating_percentage: ratingPct,
      verified_by_community: existing.get(numId)?.verified_by_community ?? false,
      last_data_refresh: now,
    });
    const trendingOverride = curPlayers < 5000 && change >= 1000;

    const row: Record<string, unknown> = {
      id: numId,
      name: details[0],
      active_players: curPlayers,
      previous_active_players: prevPlayers,
      active_players_change_24h: change,
      trend_spike_score: score,
      trend_spike_label: getTrendSpikeLabel(score, change),
      icon_url: typeof details[2] === 'string' ? details[2] : null,
      slug: uniqueSlug(details[0], numId),
      last_data_refresh: now,
      rating_percentage: ratingPct,
      featured_score: featuredScore,
      thumbs_up_count: likeCount,
      publish_score: publishScore,
      is_trending_override: trendingOverride,
    };

    // Preserve is_published for existing rows; default false for new ones
    const existingRow = existing.get(numId);
    row.is_published = existingRow ? existingRow.is_published : false;

    return row;
  });

  const { error } = await supabase.from('roblox_pages').upsert(upsertData, { onConflict: 'id' });
  if (error) throw error;
  return upsertData.length;
}

export async function enrichPageWithAI(pageId: number) {
  if (!genAI) throw new Error('Missing GEMINI_API_KEY');

  const { data: page, error } = await supabase
    .from('roblox_pages')
    .select('*')
    .eq('id', pageId)
    .single();

  if (error || !page) throw new Error(`Page not found: ${pageId}`);

  const result = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: buildInformationGainPrompt(page),
  });
  const response = normalizeGeminiJson(result.text ?? '');

  const guideWithDisclaimer = response.guide + buildVerifiedDisclaimer();

  const { error: updateError } = await supabase
    .from('roblox_pages')
    .update({
      answer_block: response.answer_block,
      useful_summary: response.summary,
      detailed_guide: guideWithDisclaimer,
      faq_data: response.faqs,
      is_published: true,
      last_data_refresh: new Date().toISOString()
    })
    .eq('id', pageId);

  if (updateError) throw updateError;
  return { ...response, guide: guideWithDisclaimer };
}

export async function enrichNextBatch(batchSize = 10) {
  const { data: pages, error } = await supabase
    .from('roblox_pages')
    .select('id')
    .eq('is_published', false)
    .gte('active_players', 5000)
    .order('active_players', { ascending: false })
    .limit(batchSize);

  if (error) throw error;
  if (!pages?.length) return { processed: 0 };

  // Run all enrichments in parallel so 10 games finish in ~3-4 s instead of ~30 s
  const results = await Promise.allSettled(pages.map((page) => enrichPageWithAI(page.id)));

  let succeeded = 0;
  const failures: { id: number; error: string }[] = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      succeeded++;
    } else {
      const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.error(`Error enriching page ${pages[i]!.id}:`, msg);
      failures.push({ id: pages[i]!.id, error: msg });
    }
  });

  // Surface failures even when some succeeded so they show up in Vercel logs
  if (failures.length > 0) {
    console.error(`[enrichNextBatch] ${failures.length} failures:`, JSON.stringify(failures));
  }

  if (failures.length > 0 && succeeded === 0) {
    throw new Error(`All ${failures.length} enrichments failed. First: ${failures[0]?.error ?? 'unknown'}`);
  }

  return { processed: succeeded, failed: failures.length, failures };
}

// --- Google Indexing Logic (Solves your Vercel Build Error) ---

export async function requestIndexing(url: string) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return { skipped: true, reason: 'Missing credentials' };

  const credentials = safeJsonParse<{ client_email: string; private_key: string }>(raw);
  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/indexing']
  });

  const { access_token } = await client.authorize();
  if (!access_token) throw new Error('Authorization failed');

  return fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type: 'URL_UPDATED' })
  });
}

export async function requestIndexingForVerifiedPages(batchSize = 100) {
  const { data: pages, error } = await supabase
    .from('roblox_pages')
    .select('slug')
    .eq('is_published', true)
    .is('last_indexed_at', null)
    .limit(batchSize);

  if (error) throw error;
  if (!pages?.length) return { processed: 0, skipped: 0 };

  let indexed = 0;
  let skipped = 0;

  for (const page of pages) {
    const result = await requestIndexing(absoluteUrl(`/games/${page.slug}`));

    // If GOOGLE_SERVICE_ACCOUNT_JSON is missing, result is { skipped: true }
    if (result && 'skipped' in result && result.skipped) {
      skipped++;
      continue;
    }

    // Mark as indexed in DB
    await supabase
      .from('roblox_pages')
      .update({ last_indexed_at: new Date().toISOString() })
      .eq('slug', page.slug);

    indexed++;
  }

  return { processed: indexed, skipped };
}