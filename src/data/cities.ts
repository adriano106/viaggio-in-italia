import type { CityDef, CityId, CityContent } from '../types';
import { napoli } from './napoli';
import { roma } from './roma';
import { firenze } from './firenze';
import { bologna } from './bologna';
import { venezia } from './venezia';
import { milano } from './milano';

/** Journey order: south → north. */
export const CITIES: CityDef[] = [
  {
    id: 'napoli',
    name: 'Napoli',
    emoji: '🍕',
    theme: 'Cibo & Cucina',
    themeEn: 'Food & Dining',
    grammar: 'Present tense, reflexives, direct pronouns',
    tagline: 'Vedi Napoli e poi... mangia!',
    x: 272,
    y: 328,
    color: '#e15b4e',
    opponent: { name: 'Don Gennaro', emoji: '👨‍🍳', title: 'il Pizzaiolo' },
    boss: {
      name: 'Nonna Concetta',
      emoji: '👵',
      intro: "Dinner at grandma's house: survive her hospitality!",
    },
  },
  {
    id: 'roma',
    name: 'Roma',
    emoji: '🏛️',
    theme: 'Storia & Città',
    themeEn: 'History & City Life',
    grammar: 'Passato prossimo vs imperfetto',
    tagline: 'Tutte le strade portano qui.',
    x: 230,
    y: 268,
    color: '#c98a2e',
    opponent: { name: 'Marco', emoji: '🛡️', title: 'il Centurione' },
    boss: {
      name: 'Sor Augusto',
      emoji: '🚕',
      intro: 'A taxi ride through the capital: small talk and past tenses!',
    },
  },
  {
    id: 'firenze',
    name: 'Firenze',
    emoji: '🎨',
    theme: 'Arte & Descrizioni',
    themeEn: 'Art & Descriptions',
    grammar: 'Comparatives, piacere, stare + gerund',
    tagline: 'La culla del Rinascimento.',
    x: 195,
    y: 205,
    color: '#8e5aa8',
    opponent: { name: 'Lucrezia', emoji: '👩‍🎨', title: 'la Pittrice' },
    boss: {
      name: 'Maestro Vasari',
      emoji: '🧐',
      intro: 'The art critic grills you at the Uffizi. Impress him!',
    },
  },
  {
    id: 'bologna',
    name: 'Bologna',
    emoji: '🎓',
    theme: 'Vita da Studenti',
    themeEn: 'Student & Daily Life',
    grammar: 'Imperative, combined pronouns',
    tagline: 'La Dotta, la Grassa, la Rossa.',
    x: 200,
    y: 160,
    color: '#b03a48',
    opponent: { name: 'Balanzone', emoji: '📚', title: 'il Professorone' },
    boss: {
      name: 'Prof.ssa Morandi',
      emoji: '👩‍🏫',
      intro: "The oral exam at Europe's oldest university!",
    },
  },
  {
    id: 'venezia',
    name: 'Venezia',
    emoji: '🛶',
    theme: 'Viaggi & Direzioni',
    themeEn: 'Travel & Directions',
    grammar: 'Future & conditional',
    tagline: 'La Serenissima ti aspetta.',
    x: 240,
    y: 112,
    color: '#2e86ab',
    opponent: { name: 'Giacomo', emoji: '🚣', title: 'il Gondoliere' },
    boss: {
      name: 'Capitan Alvise',
      emoji: '⛵',
      intro: 'Sail the lagoon: future tense and politeness win the captain over!',
    },
  },
  {
    id: 'milano',
    name: 'Milano',
    emoji: '👠',
    theme: 'Moda & Lavoro',
    themeEn: 'Fashion & Business',
    grammar: 'Present subjunctive',
    tagline: 'Eleganza, affari e... congiuntivi.',
    x: 165,
    y: 102,
    color: '#d6336c',
    opponent: { name: 'Donatella', emoji: '💃', title: 'la Stilista' },
    boss: {
      name: 'Direttrice Visconti',
      emoji: '🕶️',
      intro: 'The final job interview: the subjunctive decides everything!',
    },
  },
];

export const CONTENT: Record<CityId, CityContent> = {
  napoli,
  roma,
  firenze,
  bologna,
  venezia,
  milano,
};

export function cityById(id: CityId): CityDef {
  return CITIES.find((c) => c.id === id)!;
}
