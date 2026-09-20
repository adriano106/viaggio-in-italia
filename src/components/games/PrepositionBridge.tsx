import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CityId } from '../../types';
import { CONTENT, cityById } from '../../data/cities';
import { sample, shuffle } from '../../lib/answers';
import { comboMultiplier, sessionXp, starsFromAccuracy } from '../../lib/scoring';
import { useGame } from '../../state/gameStore';
import { Feedback, type FeedbackState } from '../Feedback';
import { ResultCard } from '../ResultCard';
import { HUD } from '../HUD';

const ROUNDS = 10;
const ROUND_SECONDS = 15;

export function PrepositionBridge({ cityId }: { cityId: CityId }) {
  const city = cityById(cityId);
  const navigate = useGame((s) => s.navigate);
  const addXp = useGame((s) => s.addXp);
  const recordStars = useGame((s) => s.recordStars);
  const touchStreak = useGame((s) => s.touchStreak);
  const addMistake = useGame((s) => s.addMistake);
  const recordAnswer = useGame((s) => s.recordAnswer);

  const [session, setSession] = useState(0);
  const items = useMemo(
    () => sample(CONTENT[cityId].prepositions ?? [], ROUNDS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cityId, session],
  );

  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [done, setDone] = useState(false);
  const [finalXp, setFinalXp] = useState(0);
  const [finalStars, setFinalStars] = useState(0);

  const finishedRef = useRef(false);

  const item = items[Math.min(round, items.length - 1)];
  const options = useMemo(
    () => shuffle(item.options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.id, session],
  );

  // Per-round countdown; paused while feedback is showing.
  useEffect(() => {
    setTimeLeft(ROUND_SECONDS);
  }, [round, session]);

  useEffect(() => {
    if (feedback || done) return;
    const t = window.setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [feedback, done, round, session]);

  const answer = (choice: string | null) => {
    if (feedback) return;
    const good = choice !== null && choice === item.answer;
    recordAnswer(good);
    if (good) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setBestCombo(Math.max(bestCombo, newCombo));
      setCorrect((c) => c + 1);
      setFeedback({
        kind: 'good',
        message:
          comboMultiplier(newCombo) > 1
            ? `Un'altra asse! Combo x${comboMultiplier(newCombo)} 🔥`
            : 'Un’altra asse sul ponte! (Another plank!)',
        note: item.note,
      });
    } else {
      setCombo(0);
      setFeedback({
        kind: 'bad',
        message:
          choice === null
            ? `Time's up! The answer: “${item.answer}”`
            : `The answer: “${item.answer}”`,
        note: item.note ?? item.en,
      });
      addMistake({
        id: item.id,
        type: 'verb',
        cityId,
        prompt: `${item.before} ___ ${item.after}`,
        answer: item.answer,
        note: item.note,
      });
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 && !feedback && !done) answer(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const next = () => {
    setFeedback(null);
    if (round + 1 >= items.length) {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const stars = starsFromAccuracy(correct, items.length);
      const xp = sessionXp(correct, stars, bestCombo);
      addXp(xp);
      recordStars(cityId, 'prepositions', stars);
      touchStreak();
      setFinalXp(xp);
      setFinalStars(stars);
      setDone(true);
    } else {
      // Non-functional update on purpose: a stale double-fire from the exiting
      // card sets the same value again instead of skipping a round.
      setRound(round + 1);
    }
  };

  const restart = () => {
    finishedRef.current = false;
    setSession((s) => s + 1);
    setRound(0);
    setCorrect(0);
    setCombo(0);
    setBestCombo(0);
    setFeedback(null);
    setDone(false);
  };

  if (done) {
    return (
      <ResultCard
        title="Il Ponte delle Preposizioni"
        emoji="🌉"
        correct={correct}
        total={items.length}
        stars={finalStars}
        xp={finalXp}
        onRetry={restart}
        onExit={() => navigate({ type: 'city', cityId })}
        extraNote={
          finalStars === 0
            ? 'The bridge collapsed... get at least half right to earn a star. You need 1★ here to unlock the boss!'
            : correct >= items.length
              ? 'You crossed the whole gorge! 🎉'
              : undefined
        }
      />
    );
  }

  // Bridge visual: one plank per answered-correct round, player walks across.
  const gorgeWidth = 100;
  const plankW = gorgeWidth / ROUNDS;

  return (
    <div>
      <HUD onBack={() => navigate({ type: 'city', cityId })} backLabel={city.name} />
      <div className="center-col" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div className="game-title">🌉 Il Ponte delle Preposizioni</div>
          <div style={{ flex: 1 }} />
          {combo >= 3 && <div className="combo-badge">🔥 x{comboMultiplier(combo)}</div>}
          <div className="hud-pill">
            {round + 1}/{items.length}
          </div>
        </div>

        {/* The gorge */}
        <div className="card" style={{ width: '100%', padding: 12 }}>
          <svg viewBox="0 0 120 26" style={{ width: '100%', display: 'block' }}>
            <rect x="0" y="14" width="10" height="12" fill="#8a6d3b" rx="1" />
            <rect x="110" y="14" width="10" height="12" fill="#8a6d3b" rx="1" />
            <rect x="10" y="22" width="100" height="4" fill="#bcdce9" />
            {Array.from({ length: correct }).map((_, i) => (
              <rect
                key={i}
                x={10 + (i * plankW * 100) / gorgeWidth}
                y="15"
                width={plankW - 0.6}
                height="3.4"
                rx="0.8"
                fill="#c98a2e"
              />
            ))}
            <text x={8 + correct * plankW} y="13" fontSize="9">
              🚶
            </text>
            <text x="111" y="12" fontSize="9">
              🏁
            </text>
          </svg>
          <div className="timer-bar" style={{ marginTop: 8 }}>
            <div
              style={{
                width: `${Math.max(0, (timeLeft / ROUND_SECONDS) * 100)}%`,
                transition: 'width 1s linear',
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${item.id}-${session}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="card center-col"
            style={{ width: '100%', gap: 14 }}
          >
            <div style={{ fontSize: 21, fontWeight: 700, textAlign: 'center', lineHeight: 1.6 }}>
              {item.before}{' '}
              <span
                style={{
                  display: 'inline-block',
                  minWidth: 64,
                  borderBottom: '3px dashed var(--gold)',
                  textAlign: 'center',
                  color: 'var(--ink-soft)',
                }}
              >
                ?
              </span>{' '}
              {item.after}
            </div>
            <div className="subtle" style={{ fontStyle: 'italic' }}>
              {item.en}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {options.map((opt) => (
                <button
                  key={opt}
                  className="tile"
                  style={{ minWidth: 64, justifyContent: 'center', fontSize: 18 }}
                  disabled={!!feedback}
                  onClick={() => answer(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <Feedback state={feedback} />
            {feedback && (
              <button className="btn" onClick={next} autoFocus>
                {round + 1 >= items.length ? 'Results 🏁' : 'Next →'}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
