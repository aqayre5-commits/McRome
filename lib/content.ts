import type { FAQItem } from '@/lib/types';

export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .trim();
}

export function clampWords(text: string, maxWords: number): string {
  const words = stripMarkdown(text).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ')}…`;
}

export function parseSummary(summary?: string | null): string[] {
  if (!summary) return [];

  const listItems = summary
    .split(/\n|•/g)
    .map((line) => line.replace(/^[-*•\d.()\s]+/, '').trim())
    .filter(Boolean);

  if (listItems.length >= 2) {
    return listItems.slice(0, 3);
  }

  return summary
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function parseGuide(guide?: string | null): string[] {
  if (!guide) return [];

  return guide
    .split(/\n{2,}/)
    .map((p) => stripMarkdown(p))
    .filter(Boolean);
}

export function parseFaqs(faqData?: FAQItem[] | string | null): FAQItem[] {
  if (!faqData) return [];
  if (typeof faqData === 'string') {
    try {
      const parsed = JSON.parse(faqData) as unknown;
      return Array.isArray(parsed) ? (parsed as FAQItem[]) : [];
    } catch {
      return [];
    }
  }
  return faqData;
}
