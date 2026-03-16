import { describe, expect, it } from 'vitest';
import { clampWords, parseSummary, parseFaqs } from '@/lib/content';

describe('content helpers', () => {
  it('returns at most 3 summary bullets', () => {
    const result = parseSummary('One\nTwo\nThree\nFour');
    expect(result).toEqual(['One', 'Two', 'Three']);
  });

  it('parses faq json strings', () => {
    const result = parseFaqs('[{"q":"Q1","a":"A1"}]');
    expect(result[0]?.q).toBe('Q1');
  });

  it('clamps answer blocks to the target word count', () => {
    const text = Array.from({ length: 120 }, (_, index) => `word${index}`).join(' ');
    const clamped = clampWords(text, 100);
    expect(clamped.split(/\s+/).length).toBeLessThanOrEqual(100);
  });
});
