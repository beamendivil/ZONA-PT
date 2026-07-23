import { describe, expect, it } from 'vitest';
import { hasTwoDaySeverePain, type PainEntry } from './PatientProgress';

function pain(score: number, date: string): PainEntry {
  return { score, recordedAt: `${date}T18:00:00.000Z` };
}

describe('hasTwoDaySeverePain', () => {
  it('detects severe pain recorded on consecutive days', () => {
    expect(hasTwoDaySeverePain([pain(9, '2026-07-20'), pain(10, '2026-07-21')])).toBe(true);
  });

  it('ignores non-severe scores and gaps between days', () => {
    expect(
      hasTwoDaySeverePain([
        pain(9, '2026-07-20'),
        pain(8, '2026-07-21'),
        pain(10, '2026-07-22'),
      ]),
    ).toBe(false);
  });

  it('handles duplicate entries from the same day', () => {
    expect(
      hasTwoDaySeverePain([
        pain(9, '2026-07-20'),
        pain(10, '2026-07-20'),
        pain(9, '2026-07-21'),
      ]),
    ).toBe(true);
  });
});
