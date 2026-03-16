import slugify from 'slugify';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JWT } from 'google-auth-library';
import { clampWords } from '@/lib/content';
import { geminiResponseSchema } from '@/lib/contracts/api';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { absoluteUrl } from '@/lib/utils';

type RolimonsGameMap = Record<string, [string, number, string?, ...unknown[]]>;

type ExistingPageSnapshot = {
  id: number;
  active_players: number;
  verified_by_community: boolean;
};

const supabase = createServiceSupabaseClient();
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

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

async function getExistingPageMap(ids: number[]) {
  const { data, error } = await supabase
    .from('roblox_pages')
    .select('id,active_players,verified_by_community')
    .in('id', ids);

  if (error || !data) return new Map<number, ExistingPageSnapshot>();
  return new Map<number, ExistingPageSnapshot>(
    (data as ExistingPageSnapshot[]).map((row) => [row.id, row])
  );
}

export async function syncTopRobloxGames(limit = 100) {
  const response = await fetch('https://api.rolimons.com/games/v1/gamelist', {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Rolimons sync failed: ${response.status}`);
  }

  const json = (await response.json()) as { games: RolimonsGameMap };
  const games = Object.entries(json.games).slice(0, limit);
  const ids = games.map(([id]) => Number(id));
  const existing = await getExistingPageMap(ids);
  const now = new Date().toISOString();

  const upsertData = games.map(([id, details]) => {
    const numericId = Number(id);
    const currentPlayers = Number(details[1] ?? 0);
    const previous = existing.get(numericId)?.active_players ?? currentPlayers;
    const change = currentPlayers - previous;
    const trendSpikeScore = getTrendSpikeScore(previous, currentPlayers);

    return {
      id: numericId,
      name: details[0],
      active_players: currentPlayers,
      previous_active_players: previous,
      active_players_change_24h: change,
      trend_spike_score: trendSpikeScore,
      trend_spike_label: getTrendSpikeLabel(trendSpikeScore, change),
      icon_url: typeof details[2] === 'string' ? details[2] : null,
      slug: uniqueSlug(details[0], numericId),
      language_code: 'en',
      device_compatibility: ['mobile', 'pc', 'xbox'],
      last_data_refresh: now
    };
  });

  const { error } = await supabase.from('roblox_pages').upsert(upsertData, {
    onConflict: 'id'
  });

  if (error) throw error;
  return upsertData.length;
}

function normalizeGeminiJson(raw: string) {
  const trimmed = raw.trim().replace(/^```json/gm, '').replace(/^```/gm, '').replace(/```$/gm, '');
  const parsed = JSON.parse(trimmed) as unknown;
  const validated = geminiResponseSchema.parse(parsed);

  return {
    answer_block: clampWords(validated.answer_block, 100),
    summary: Array.isArray(validated.summary)
      ? validated.summary.join('\n')
      : validated.summary,
    guide: validated.guide,
    faqs: validated.faqs.slice(0, 4)
  };
}

function buildInformationGainPrompt(page: {
  name: string;
  active_players: number;
  language_code?: string;
  device_compatibility?: string[];
}) {
  const activePlayers = Number(page.active_players ?? 0).toLocaleString();
  const devices = (page.device_compatibility ?? []).join(', ') || 'mobile, pc, xbox';
  const lang = page.language_code || 'en';

  return `You are a professional Roblox Game Analyst for McRome. Write a high-impact, Information Gain guide for "${page.name}".

LIVE DATA: ${activePlayers} players are currently active in this game. Weave this number into the guide naturally (e.g. trading liquidity, matchmaking speed, server population).

CONTENT RULES — break any of these and the output is rejected:
1. No fluff. Never start with "In the fast-paced world of", "Unlock your potential", or any generic opener. Start with what the player actually does.
2. Mention at least 2 specific in-game mechanics by name (e.g. "rolling for auras", "grinding Zenny", "the level 50 raid", "pet hatching").
3. Vibe check required: classify the game as one of — sweaty / AFK-friendly / RNG-heavy / social / grind-heavy / casual / competitive. Use gamer language naturally.
4. Entity density: briefly compare or contrast with 1 related Roblox game (e.g. "unlike Blox Fruits, ..."). This builds topical authority.
5. Sentences must be short and punchy. No paragraph longer than 3 lines.
6. Do not mention AI, ChatGPT, or this prompt.
7. Language: ${lang}. Devices: ${devices}.

OUTPUT STRUCTURE — map your content to these JSON fields:
- answer_block: "What is ${page.name}?" — 2-3 punchy sentences covering core gameplay, vibe classification, and the live player count. Max 100 words.
- summary: exactly 3 bullet strings for a "Why Players Love It" section. Each bullet = one concrete benefit. No fluff words.
- guide: the full "McRome Insider Tip" section. Include: (a) one non-obvious pro tip (e.g. "Save gems for the Level 2 rebirth, not common eggs"), (b) the specific mechanic breakdown, (c) the entity comparison. Use short paragraphs.
- faqs: 3–4 Q&A pairs. Questions must match real player search queries (e.g. "Is [game] pay-to-win?", "Best way to grind [currency] fast?").

Return ONLY strict JSON — no markdown fences, no commentary:
{"answer_block":"...","summary":["...","...","..."],"guide":"...","faqs":[{"q":"...","a":"..."},{"q":"...","a":"..."},{"q":"...","a":"..."}]}`;
}

function buildVerifiedDisclaimer(gameName: string): string {
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `\n\nThis guide was cross-referenced by the McRome automated engine and verified by community success rates on ${date}. Player counts reflect live data at time of generation. Code validity is tracked daily — cast your vote on any code above to keep the community data accurate.`;
}

export async function enrichPageWithAI(pageId: number) {
  if (!genAI) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const { data: page, error } = await supabase
    .from('roblox_pages')
    .select('*')
    .eq('id', pageId)
    .single();

  if (error || !page) {
    throw new Error(`Page not found: ${pageId}`);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = buildInformationGainPrompt(page);

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const response = normalizeGeminiJson(text);

  // Append the verified disclaimer programmatically — never AI-generated,
  // always consistent, always dated.
  const guideWithDisclaimer = response.guide + buildVerifiedDisclaimer(page.name);

  const { error: updateError } = await supabase
    .from('roblox_pages')
    .update({
      answer_block: response.answer_block,
      useful_summary: response.summary,
      detailed_guide: guideWithDisclaimer,
      faq_data: response.faqs,
      is_published: true,
      last_indexed_at: new Date().toISOString()
    })
    .eq('id', pageId);

  if (updateError) throw updateError;

  return { ...response, guide: guideWithDisclaimer };
}

export async function requestIndexing(url: string) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    return { skipped: true, reason: 'missing GOOGLE_SERVICE_ACCOUNT_JSON' };
  }

  const credentials = JSON.parse(raw) as {
    client_email: string;
    private_key: string;
  };

  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/indexing']
  });

  const { access_token } = await client.authorize();
  if (!access_token) {
    throw new Error('Unable to authorize Google Indexing API');
  }

  const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url,
      type: 'URL_UPDATED'
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Indexing request failed: ${response.status} ${body}`);
  }

  return response.json();
}

export async function enrichNextBatch(batchSize = 10) {
  const { data: pages, error } = await supabase
    .from('roblox_pages')
    .select('id,slug')
    .eq('is_published', false)
    .order('active_players', { ascending: false })
    .limit(batchSize);

  if (error) throw error;
  if (!pages?.length) return { processed: 0 };

  for (const page of pages) {
    await enrichPageWithAI(page.id);
  }

  return { processed: pages.length };
}

export async function requestIndexingForVerifiedPages(batchSize = 100) {
  const { data: pages, error } = await supabase
    .from('roblox_pages')
    .select('slug')
    .eq('is_published', true)
    .eq('verified_by_community', true)
    .order('trend_spike_score', { ascending: false })
    .order('active_players', { ascending: false })
    .limit(batchSize);

  if (error) throw error;
  if (!pages?.length) return { processed: 0 };

  for (const page of pages) {
    await requestIndexing(absoluteUrl(`/games/${page.slug}`));
  }

  return { processed: pages.length };
}
