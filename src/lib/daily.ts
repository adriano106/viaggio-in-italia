import type { CityId, PrepItem, SentenceItem, VerbItem, VocabItem } from '../types';
import { CONTENT } from '../data/cities';

export const DAILY_ROUNDS = 10;

/** One round of the Daily Challenge, tagged with its input style. */
export type DailyRound =
  | { kind: 'tiles'; cityId: CityId; item: SentenceItem }
  | { kind: 'verb'; cityId: CityId; item: VerbItem }
  | { kind: 'prep'; cityId: CityId; item: PrepItem }
  | { kind: 'vocab'; cityId: CityId; item: VocabItem; options: string[]; answer: number };

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Deterministic PRNG (mulberry32) seeded from a string. */
function seededRng(seed: string): () => number {
  let h = 1779033703;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededPick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Build today's challenge from the content of the unlocked cities.
 * Same date + same unlocked cities = identical rounds all day.
 */
export function buildDailyChallenge(unlocked: CityId[], date = todayKey()): DailyRound[] {
  const rng = seededRng(`viaggio-${date}-${unlocked.length}`);
  const rounds: DailyRound[] = [];
  const usedIds = new Set<string>();

  const allVocab = unlocked.flatMap((c) => CONTENT[c].vocab);

  for (let i = 0; i < DAILY_ROUNDS; i++) {
    const cityId = seededPick(unlocked, rng);
    const content = CONTENT[cityId];
    const kinds: DailyRound['kind'][] = ['tiles', 'verb', 'vocab'];
    if (content.prepositions?.length) kinds.push('prep');
    const kind = kinds[i % kinds.length];

    let round: DailyRound | null = null;
    for (let tries = 0; tries < 8 && !round; tries++) {
      if (kind === 'tiles') {
        const pool = [...content.sentences, ...(content.dettato ?? [])];
        const item = seededPick(pool, rng);
        if (!usedIds.has(item.id)) round = { kind, cityId, item };
      } else if (kind === 'verb') {
        const item = seededPick(content.verbs, rng);
        if (!usedIds.has(item.id)) round = { kind, cityId, item };
      } else if (kind === 'prep') {
        const item = seededPick(content.prepositions!, rng);
        if (!usedIds.has(item.id)) round = { kind, cityId, item };
      } else {
        const item = seededPick(content.vocab, rng);
        if (usedIds.has(item.id)) continue;
        const distractors: string[] = [];
        for (let d = 0; d < 30 && distractors.length < 3; d++) {
          const other = seededPick(allVocab, rng);
          if (other.id !== item.id && !distractors.includes(other.en)) {
            distractors.push(other.en);
          }
        }
        const options = [...distractors];
        const answer = Math.floor(rng() * (options.length + 1));
        options.splice(answer, 0, item.en);
        round = { kind: 'vocab', cityId, item, options, answer };
      }
    }
    if (round) {
      usedIds.add(round.item.id);
      rounds.push(round);
    }
  }
  return rounds;
}
