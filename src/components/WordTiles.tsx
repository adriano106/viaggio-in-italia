import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { shuffleAvoidIdentity, tokenize } from '../lib/answers';

interface Props {
  sentence: string;
  disabled?: boolean;
  onSubmit: (given: string) => void;
  /** Bump to force a reshuffle/reset for the same sentence. */
  resetKey?: number;
}

/** Tap-to-build word tile puzzle. Pool below, answer strip above. */
export function WordTiles({ sentence, disabled, onSubmit, resetKey = 0 }: Props) {
  const tokens = useMemo(() => tokenize(sentence), [sentence]);
  const pool = useMemo(
    () => shuffleAvoidIdentity(tokens.map((word, idx) => ({ word, idx }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sentence, resetKey],
  );
  const [placed, setPlaced] = useState<number[]>([]);

  useEffect(() => setPlaced([]), [sentence, resetKey]);

  const place = (idx: number) => {
    if (disabled || placed.includes(idx)) return;
    setPlaced((p) => [...p, idx]);
  };

  const unplace = (idx: number) => {
    if (disabled) return;
    setPlaced((p) => p.filter((i) => i !== idx));
  };

  const built = placed.map((i) => tokens[i]).join(' ');
  const complete = placed.length === tokens.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      <div className="answer-strip">
        <div className="tile-row">
          {placed.length === 0 && (
            <span className="subtle" style={{ padding: '0 6px' }}>
              Tap the words below to build the sentence…
            </span>
          )}
          {placed.map((idx) => (
            <motion.button
              key={idx}
              layout
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="tile placed"
              onClick={() => unplace(idx)}
            >
              {tokens[idx]}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="tile-row" style={{ justifyContent: 'center' }}>
        {pool.map(({ word, idx }) => (
          <button
            key={idx}
            className={`tile ${placed.includes(idx) ? 'ghosted' : ''}`}
            onClick={() => place(idx)}
          >
            {word}
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <button className="btn" disabled={!complete || disabled} onClick={() => onSubmit(built)}>
          Check ✓
        </button>
      </div>
    </div>
  );
}
