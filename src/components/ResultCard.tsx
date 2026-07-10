import { motion } from 'framer-motion';
import { Confetti } from './Confetti';

interface Props {
  title: string;
  emoji: string;
  correct: number;
  total: number;
  stars: number;
  xp: number;
  onRetry: () => void;
  onExit: () => void;
  exitLabel?: string;
  extraNote?: string;
}

export function ResultCard({
  title,
  emoji,
  correct,
  total,
  stars,
  xp,
  onRetry,
  onExit,
  exitLabel,
  extraNote,
}: Props) {
  return (
    <div className="center-col" style={{ paddingTop: 30 }}>
      {stars >= 2 && <Confetti />}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="card center-col"
        style={{ maxWidth: 420, width: '100%', textAlign: 'center', gap: 12 }}
      >
        <div style={{ fontSize: 56 }}>{emoji}</div>
        <div className="game-title">{title}</div>
        <div style={{ fontSize: 34, letterSpacing: 6 }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4 + i * 0.25, type: 'spring', stiffness: 300 }}
              style={{ display: 'inline-block', filter: i < stars ? 'none' : 'grayscale(1) opacity(0.35)' }}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          {correct} / {total} correct
        </div>
        <div className="combo-badge">+{xp} XP</div>
        {extraNote && <div className="subtle">{extraNote}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn ghost" onClick={onRetry}>
            Retry 🔁
          </button>
          <button className="btn" onClick={onExit}>
            {exitLabel ?? 'Continue →'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
