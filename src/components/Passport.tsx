import { motion } from 'framer-motion';
import { CITIES } from '../data/cities';
import { useGame } from '../state/gameStore';
import { levelFromXp } from '../lib/scoring';
import { HUD } from './HUD';

export function Passport() {
  const navigate = useGame((s) => s.navigate);
  const stamps = useGame((s) => s.stamps);
  const xp = useGame((s) => s.xp);
  const streak = useGame((s) => s.streakCount);
  const totalCorrect = useGame((s) => s.totalCorrect);
  const totalAnswered = useGame((s) => s.totalAnswered);
  const resetProgress = useGame((s) => s.resetProgress);
  const { level } = levelFromXp(xp);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div>
      <HUD onBack={() => navigate({ type: 'map' })} />
      <div className="center-col">
        <h1 className="serif" style={{ fontSize: 30, fontStyle: 'italic' }}>
          🛂 Passport
        </h1>

        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: 560,
            background: 'linear-gradient(160deg, #274060, #1b2c45)',
            color: '#f5ecd9',
          }}
        >
          <div style={{ textAlign: 'center', letterSpacing: 4, fontSize: 13, opacity: 0.8 }}>
            REPUBBLICA DELL'APPRENDIMENTO · VIAGGIO IN ITALIA
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
              marginTop: 18,
            }}
          >
            {CITIES.map((city, i) => {
              const stamped = stamps.includes(city.id);
              return (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 12,
                    border: stamped ? `3px solid ${city.color}` : '2px dashed rgba(245,236,217,0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    transform: stamped ? `rotate(${((i * 7) % 13) - 6}deg)` : 'none',
                    background: stamped ? 'rgba(255,255,255,0.08)' : 'transparent',
                  }}
                >
                  <div style={{ fontSize: 30, filter: stamped ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                    {stamped ? city.emoji : '·'}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: stamped ? city.color : 'rgba(245,236,217,0.5)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {city.name}
                  </div>
                  {stamped && <div style={{ fontSize: 10, opacity: 0.7 }}>VISTO ✓</div>}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div className="hud-pill">⭐ Level {level}</div>
          <div className="hud-pill">⚡ {xp} XP</div>
          <div className="hud-pill">🔥 {streak}-day streak</div>
          <div className="hud-pill">🎯 {accuracy}% accuracy</div>
          <div className="hud-pill">
            🛂 {stamps.length}/{CITIES.length} stamps
          </div>
        </div>

        {stamps.length === CITIES.length && (
          <div className="card" style={{ textAlign: 'center', background: '#fff8ea', maxWidth: 560 }}>
            <div style={{ fontSize: 40 }}>🏆</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Journey complete!</div>
            <div className="subtle">
              You've conquered all of Italy. Keep playing for the perfect score: 12 stars in every
              city!
            </div>
          </div>
        )}

        <button
          className="btn ghost small"
          onClick={() => {
            if (window.confirm('Are you sure? This will erase all your progress!')) resetProgress();
          }}
        >
          🗑️ Start over
        </button>
      </div>
    </div>
  );
}
