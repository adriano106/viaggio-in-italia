import type { CityId, GameId } from '../types';
import { CITIES } from '../data/cities';
import { levelFromXp } from './scoring';

/** The slice of store state achievements are computed from. */
export interface AchievementState {
  xp: number;
  stars: Record<string, number>;
  stamps: CityId[];
  streakCount: number;
  totalCorrect: number;
  totalAnswered: number;
  counters: Record<string, number>;
  dailyTotalCompleted: number;
}

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  test: (s: AchievementState) => boolean;
}

const GAME_IDS: GameId[] = ['sentence', 'verbs', 'vocab', 'dettato', 'prepositions', 'boss'];

function cityStars(s: AchievementState, cityId: CityId): number {
  return GAME_IDS.reduce((sum, g) => sum + (s.stars[`${cityId}:${g}`] ?? 0), 0);
}

const route1 = CITIES.filter((c) => c.route === 1).map((c) => c.id);

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-stamp',
    emoji: '🛂',
    title: 'Benvenuto!',
    desc: 'Earn your first passport stamp',
    test: (s) => s.stamps.length >= 1,
  },
  {
    id: 'route-1',
    emoji: '🇮🇹',
    title: 'Da Napoli a Milano',
    desc: 'Stamp all 6 cities of the first journey',
    test: (s) => route1.every((c) => s.stamps.includes(c)),
  },
  {
    id: 'all-stamps',
    emoji: '🏆',
    title: 'Giro Completo',
    desc: 'Stamp all 9 cities',
    test: (s) => s.stamps.length >= CITIES.length,
  },
  {
    id: 'level-5',
    emoji: '⭐',
    title: 'In Cammino',
    desc: 'Reach level 5',
    test: (s) => levelFromXp(s.xp).level >= 5,
  },
  {
    id: 'level-10',
    emoji: '🌟',
    title: 'Quasi Madrelingua',
    desc: 'Reach level 10',
    test: (s) => levelFromXp(s.xp).level >= 10,
  },
  {
    id: 'streak-7',
    emoji: '🔥',
    title: 'Una Settimana',
    desc: 'Play 7 days in a row',
    test: (s) => s.streakCount >= 7,
  },
  {
    id: 'streak-30',
    emoji: '☄️',
    title: 'Un Mese Intero',
    desc: 'Play 30 days in a row',
    test: (s) => s.streakCount >= 30,
  },
  {
    id: 'perfect-duel',
    emoji: '⚔️',
    title: 'Duello Perfetto',
    desc: 'Win a Verb Duel without losing a heart',
    test: (s) => (s.counters.perfectDuel ?? 0) >= 1,
  },
  {
    id: 'three-stars',
    emoji: '✨',
    title: 'Tre Stelle',
    desc: 'Earn 3 stars in any game',
    test: (s) => Object.values(s.stars).some((v) => v >= 3),
  },
  {
    id: 'golden-city',
    emoji: '👑',
    title: 'Città Dorata',
    desc: 'Earn all 12 stars in one city',
    test: (s) => CITIES.some((c) => cityStars(s, c.id) >= 12),
  },
  {
    id: 'review-10',
    emoji: '📝',
    title: 'Imparo dagli Errori',
    desc: 'Fix 10 mistakes in the review deck',
    test: (s) => (s.counters.ripassoFixed ?? 0) >= 10,
  },
  {
    id: 'daily-5',
    emoji: '🗓️',
    title: 'Appuntamento Fisso',
    desc: 'Complete 5 Daily Challenges',
    test: (s) => s.dailyTotalCompleted >= 5,
  },
  {
    id: 'daily-20',
    emoji: '📅',
    title: 'Habitué',
    desc: 'Complete 20 Daily Challenges',
    test: (s) => s.dailyTotalCompleted >= 20,
  },
  {
    id: 'sharp-ear',
    emoji: '🎧',
    title: 'Orecchio Fino',
    desc: 'Earn a star in Il Dettato',
    test: (s) => CITIES.some((c) => (s.stars[`${c.id}:dettato`] ?? 0) >= 1),
  },
  {
    id: 'accuracy-90',
    emoji: '🎯',
    title: 'Precisione Svizzera',
    desc: '90% lifetime accuracy (100+ answers)',
    test: (s) => s.totalAnswered >= 100 && s.totalCorrect / s.totalAnswered >= 0.9,
  },
];
