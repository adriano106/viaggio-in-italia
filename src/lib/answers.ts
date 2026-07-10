/** Strip accents so "perche" matches "perché". */
export function deaccent(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Normalize for comparison: lowercase, trim, collapse spaces, drop punctuation. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export type MatchResult = 'exact' | 'accents' | 'wrong';

/** Accent-tolerant answer check. 'accents' = right word, missing/wrong accents. */
export function matchAnswer(given: string, expected: string): MatchResult {
  const g = normalize(given);
  const e = normalize(expected);
  if (g === e) return 'exact';
  if (deaccent(g) === deaccent(e)) return 'accents';
  return 'wrong';
}

/** Split a sentence into word tiles (keeps apostrophe contractions attached). */
export function tokenize(sentence: string): string[] {
  return sentence
    .replace(/[.,!?;:]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle guaranteed not to return the original order (when possible). */
export function shuffleAvoidIdentity<T>(arr: T[]): T[] {
  if (arr.length < 2) return [...arr];
  for (let tries = 0; tries < 10; tries++) {
    const s = shuffle(arr);
    if (s.some((v, i) => v !== arr[i])) return s;
  }
  return shuffle(arr);
}

/** Pick n random items from an array. */
export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
