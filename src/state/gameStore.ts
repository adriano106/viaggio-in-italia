import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CityId, GameId, Mistake, Screen } from '../types';
import { CITIES } from '../data/cities';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

interface GameState {
  screen: Screen;
  xp: number;
  stars: Record<string, number>; // `${cityId}:${game}` -> 0–3
  stamps: CityId[];
  streakCount: number;
  streakDay: string;
  mistakes: Mistake[];
  totalCorrect: number;
  totalAnswered: number;

  navigate: (screen: Screen) => void;
  addXp: (amount: number) => void;
  recordStars: (cityId: CityId, game: GameId, stars: number) => void;
  awardStamp: (cityId: CityId) => void;
  touchStreak: () => void;
  addMistake: (m: Omit<Mistake, 'timesMissed'>) => void;
  resolveMistake: (id: string) => void;
  recordAnswer: (correct: boolean) => void;
  resetProgress: () => void;
}

export function starKey(cityId: CityId, game: GameId): string {
  return `${cityId}:${game}`;
}

export const useGame = create<GameState>()(
  persist(
    (set) => ({
      screen: { type: 'map' },
      xp: 0,
      stars: {},
      stamps: [],
      streakCount: 0,
      streakDay: '',
      mistakes: [],
      totalCorrect: 0,
      totalAnswered: 0,

      navigate: (screen) => set({ screen }),

      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),

      recordStars: (cityId, game, stars) =>
        set((s) => {
          const key = starKey(cityId, game);
          if ((s.stars[key] ?? 0) >= stars) return s;
          return { stars: { ...s.stars, [key]: stars } };
        }),

      awardStamp: (cityId) =>
        set((s) => (s.stamps.includes(cityId) ? s : { stamps: [...s.stamps, cityId] })),

      touchStreak: () =>
        set((s) => {
          const today = todayKey();
          if (s.streakDay === today) return s;
          const continued = s.streakDay === yesterdayKey();
          return { streakDay: today, streakCount: continued ? s.streakCount + 1 : 1 };
        }),

      addMistake: (m) =>
        set((s) => {
          const existing = s.mistakes.find((x) => x.id === m.id);
          if (existing) {
            return {
              mistakes: s.mistakes.map((x) =>
                x.id === m.id ? { ...x, timesMissed: x.timesMissed + 1 } : x,
              ),
            };
          }
          return { mistakes: [...s.mistakes, { ...m, timesMissed: 1 }] };
        }),

      resolveMistake: (id) =>
        set((s) => ({ mistakes: s.mistakes.filter((x) => x.id !== id) })),

      recordAnswer: (correct) =>
        set((s) => ({
          totalAnswered: s.totalAnswered + 1,
          totalCorrect: s.totalCorrect + (correct ? 1 : 0),
        })),

      resetProgress: () =>
        set({
          xp: 0,
          stars: {},
          stamps: [],
          streakCount: 0,
          streakDay: '',
          mistakes: [],
          totalCorrect: 0,
          totalAnswered: 0,
          screen: { type: 'map' },
        }),
    }),
    {
      name: 'viaggio-in-italia',
      partialize: (s) => ({
        xp: s.xp,
        stars: s.stars,
        stamps: s.stamps,
        streakCount: s.streakCount,
        streakDay: s.streakDay,
        mistakes: s.mistakes,
        totalCorrect: s.totalCorrect,
        totalAnswered: s.totalAnswered,
      }),
    },
  ),
);

/** A city is unlocked if it's the first, or the previous city has a stamp. */
export function isCityUnlocked(cityId: CityId, stamps: CityId[]): boolean {
  const idx = CITIES.findIndex((c) => c.id === cityId);
  if (idx <= 0) return true;
  return stamps.includes(CITIES[idx - 1].id);
}

/** The boss unlocks once all three mini-games have at least one star. */
export function isBossUnlocked(cityId: CityId, stars: Record<string, number>): boolean {
  return (['sentence', 'verbs', 'vocab'] as GameId[]).every(
    (g) => (stars[starKey(cityId, g)] ?? 0) >= 1,
  );
}
