import { motion } from 'framer-motion';
import { cityById } from '../data/cities';
import { isBossUnlocked, starKey, useGame } from '../state/gameStore';
import type { CityId, GameId } from '../types';
import { HUD } from './HUD';

const GAME_META: { id: GameId; title: string; emoji: string; desc: string }[] = [
  { id: 'sentence', title: 'Sentence Builder', emoji: '🧱', desc: 'Put the words back in order' },
  { id: 'verbs', title: 'Verb Duel', emoji: '⚔️', desc: 'Conjugate to strike!' },
  { id: 'vocab', title: 'Word Market', emoji: '🛍️', desc: 'Match words to their meanings' },
];

export function CityScreen({ cityId }: { cityId: CityId }) {
  const city = cityById(cityId);
  const stars = useGame((s) => s.stars);
  const stamps = useGame((s) => s.stamps);
  const navigate = useGame((s) => s.navigate);
  const bossOpen = isBossUnlocked(cityId, stars);
  const stamped = stamps.includes(cityId);

  const starRow = (n: number) => (
    <span className="stars">
      {'★'.repeat(n)}
      <span style={{ opacity: 0.25 }}>{'★'.repeat(3 - n)}</span>
    </span>
  );

  return (
    <div>
      <HUD onBack={() => navigate({ type: 'map' })} />
      <div className="center-col">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 52 }}>{city.emoji}</div>
          <h1 className="serif" style={{ fontSize: 32, fontStyle: 'italic' }}>
            {city.name} {stamped && '✅'}
          </h1>
          <div className="subtle" style={{ marginTop: 2 }}>
            {city.themeEn} · <em>{city.tagline}</em>
          </div>
          <div
            className="hud-pill"
            style={{ marginTop: 10, background: city.color, color: '#fff' }}
          >
            📖 {city.grammar}
          </div>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 14,
            width: '100%',
            maxWidth: 760,
          }}
        >
          {GAME_META.map((g, i) => {
            const s = stars[starKey(cityId, g.id)] ?? 0;
            return (
              <motion.div
                key={g.id}
                className="card center-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
                style={{ gap: 8, textAlign: 'center' }}
              >
                <div style={{ fontSize: 38 }}>{g.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>{g.title}</div>
                <div className="subtle">{g.desc}</div>
                {starRow(s)}
                <button
                  className="btn"
                  style={{ background: city.color, boxShadow: `0 4px 0 rgba(0,0,0,0.25)` }}
                  onClick={() => navigate({ type: 'game', cityId, game: g.id })}
                >
                  Play
                </button>
              </motion.div>
            );
          })}

          <motion.div
            className="card center-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            style={{
              gap: 8,
              textAlign: 'center',
              background: bossOpen ? '#fff8ea' : undefined,
              border: bossOpen ? '2px solid var(--gold)' : undefined,
            }}
          >
            <div style={{ fontSize: 38 }}>{bossOpen ? city.boss.emoji : '🔒'}</div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>
              Boss: {city.boss.name}
            </div>
            <div className="subtle">
              {bossOpen
                ? city.boss.intro
                : 'Earn at least 1 star in each game to unlock the boss challenge!'}
            </div>
            {starRow(stars[starKey(cityId, 'boss')] ?? 0)}
            <button
              className="btn red"
              disabled={!bossOpen}
              onClick={() => navigate({ type: 'game', cityId, game: 'boss' })}
            >
              {stamped ? 'Replay 👑' : 'Challenge! 👑'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
