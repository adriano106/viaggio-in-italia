export type CityId =
  | 'napoli'
  | 'roma'
  | 'firenze'
  | 'bologna'
  | 'venezia'
  | 'milano'
  | 'torino'
  | 'verona'
  | 'palermo';

export type GameId = 'sentence' | 'verbs' | 'vocab' | 'dettato' | 'prepositions' | 'boss';

export interface CityDef {
  id: CityId;
  name: string;
  emoji: string;
  theme: string;
  themeEn: string;
  grammar: string;
  tagline: string;
  x: number; // SVG map coordinates
  y: number;
  color: string;
  route: 1 | 2; // journey 1 (Napoli→Milano) or the Secondo Viaggio
  games: GameId[]; // the city's three mini-games (boss excluded)
  opponent: { name: string; emoji: string; title: string };
  boss: { name: string; emoji: string; intro: string };
}

/** Sentence-construction item: the player rebuilds `it` from shuffled word tiles. */
export interface SentenceItem {
  id: string;
  it: string; // correct Italian sentence
  en: string; // English prompt
  note?: string; // grammar micro-explanation shown on mistakes
}

/** Conjugation item for the Verb Duel. */
export interface VerbItem {
  id: string;
  before: string; // sentence before the blank
  after: string; // sentence after the blank
  infinitive: string;
  tense: string;
  answer: string;
  en: string;
  note?: string;
}

export interface VocabItem {
  id: string;
  it: string;
  en: string;
  isIdiom?: boolean;
}

/** Preposition gap-fill item: tap the right preposition from the options. */
export interface PrepItem {
  id: string;
  before: string;
  after: string;
  answer: string;
  options: string[]; // includes the answer
  en: string;
  note?: string;
}

export type BossChallenge =
  | { type: 'verb'; before: string; after: string; infinitive: string; tense: string; answer: string; note?: string }
  | { type: 'order'; it: string; en: string; note?: string }
  | { type: 'choice'; question: string; options: string[]; answer: number; note?: string };

export interface BossStep {
  npc: string; // what the character says (Italian)
  npcEn: string;
  challenge: BossChallenge;
}

export interface CityContent {
  sentences: SentenceItem[];
  verbs: VerbItem[];
  vocab: VocabItem[];
  /** Dictation items: the sentence is spoken aloud and rebuilt from tiles. */
  dettato?: SentenceItem[];
  prepositions?: PrepItem[];
  boss: BossStep[];
}

/** A missed item, queued into the Ripasso (review) deck. */
export interface Mistake {
  id: string; // unique per source item
  type: 'verb' | 'sentence' | 'vocab';
  cityId: CityId;
  prompt: string; // what to show the player
  answer: string;
  it?: string; // for sentence items: full sentence for tile rebuilding
  note?: string;
  timesMissed: number;
}

export interface GameResult {
  correct: number;
  total: number;
  stars: number; // 0–3
  xp: number;
}

export type Screen =
  | { type: 'map' }
  | { type: 'city'; cityId: CityId }
  | { type: 'game'; cityId: CityId; game: GameId }
  | { type: 'ripasso' }
  | { type: 'daily' }
  | { type: 'passport' };
