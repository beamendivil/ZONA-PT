export interface PainEntry {
  score: number;
  recordedAt: string;
  exerciseId?: string;
}

const key = (userId: string) => `zona-pt-pain-${userId}`;

export function getPainEntries(userId: string): PainEntry[] {
  try {
    return JSON.parse(localStorage.getItem(key(userId)) ?? '[]') as PainEntry[];
  } catch {
    return [];
  }
}

export function savePainEntry(userId: string, entry: PainEntry) {
  const entries = [...getPainEntries(userId), entry].slice(-60);
  localStorage.setItem(key(userId), JSON.stringify(entries));
}

export function hasTwoDaySeverePain(entries: PainEntry[]) {
  const severeDays = new Set(
    entries
      .filter((entry) => entry.score >= 9)
      .map((entry) => entry.recordedAt.slice(0, 10)),
  );
  const ordered = [...severeDays].sort();
  return ordered.some((date, index) => {
    const next = ordered[index + 1];
    if (!next) return false;
    const dayAfter = new Date(`${date}T12:00:00`);
    dayAfter.setDate(dayAfter.getDate() + 1);
    return dayAfter.toISOString().slice(0, 10) === next;
  });
}
