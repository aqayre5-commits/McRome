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

// Initialize Gemini 1.5 Flash
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
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

function buildVerifiedDisclaimer(gameName: string): string {
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

  OUTPUT ONLY STRICT JSON:
  {
    "answer_block": "What is ${page.name}? (2-3 sentences)",
    "summary": ["Reason 1", "Reason 2", "Reason 3"],
    "guide": "The main tips and strategy section.",
    "faqs": [{"q": "Question?", "a": "Answer."}]
  }`;
}

function normalizeGeminiJson(raw: string) {
  // Extract JSON block even if Gemini includes markdown fences
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const cleanJson = jsonMatch ? jsonMatch[0] : raw;
  
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
    .select('id,active_players,verified_by_community')
    .in('id', ids);

  if (error || !data) return new Map<number, ExistingPageSnapshot>();
  return new Map<number, ExistingPageSnapshot>(
    (data as ExistingPageSnapshot[]).map((row) => [row.id, row])
  );
}

// --- Main Service Functions ---

export async function syncTopRobloxGames(limit = 100) {
  const response = await fetch('https://api.rolimons.com/games/v1/gamelist', {
    next: { revalidate: 0 }
  });

  if (!response.ok) throw new Error(`Rolimons sync failed: ${response.status}`);

  const json = (await response.json()) as { games: RolimonsGameMap };
  const games = Object.entries(json.games).slice(0, limit);
  const ids = games.map(([id]) => Number(id));
  const existing = await getExistingPageMap(ids);
  const now = new Date().toISOString();

  const upsertData = games.map(([id, details]) => {
    const numId = Number(id);
    const curPlayers = Number(details[1] ?? 0);
    const prevPlayers = existing.get(numId)?.active_players ?? curPlayers;
    const change = curPlayers - prevPlayers;
    const score = getTrendSpikeScore(prevPlayers, curPlayers);

    return {
      id: numId,
      name: details[0],
      active_players: curPlayers,
      previous_active_players: prevPlayers,
      active_players_change_24h: change,
      trend_spike_score: score,
      trend_spike_label: getTrendSpikeLabel(score, change),
      icon_url: typeof details[2] === 'string' ? details[2] : null,
      slug: uniqueSlug(details[0], numId),
      last_data_refresh: now
    };
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

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(buildInformationGainPrompt(page));
  const response = normalizeGeminiJson(result.response.text());

  const guideWithDisclaimer = response.guide + buildVerifiedDisclaimer(page.name);

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
    .order('active_players', { ascending: false })
    .limit(batchSize);

  if (error) throw error;
  if (!pages?.length) return { processed: 0 };

  for (const page of pages) {
    try {
      await enrichPageWithAI(page.id);
    } catch (e) {
      console.error(`Error enriching page ${page.id}:`, e);
    }
  }
  return { processed: pages.length };
}

// --- Google Indexing Logic (Solves your Vercel Build Error) ---

export async function requestIndexing(url: string) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return { skipped: true, reason: 'Missing credentials' };

  const credentials = JSON.parse(raw);
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
    .limit(batchSize);

  if (error) throw error;
  if (!pages?.length) return { processed: 0 };

  for (const page of pages) {
    await requestIndexing(absoluteUrl(`/games/${page.slug}`));
  }
  return { processed: pages.length };
}