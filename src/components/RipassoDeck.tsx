import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { matchAnswer, sample } from '../lib/answers';
import { useGame } from '../state/gameStore';
import { cityById } from '../data/cities';
import { TypedAnswer } from './TypedAnswer';
import { WordTiles } from './WordTiles';
import { Feedback, type FeedbackState } from './Feedback';
import { ResultCard } from './ResultCard';
import { HUD } from './HUD';

const MAX_ITEMS = 10;
const XP_PER_FIX = 8;

export function RipassoDeck() {
  const navigate = useGame((s) => s.navigate);
  const mistakes = useGame((s) => s.mistakes);
  const resolveMistake = useGame((s) => s.resolveMistake);
  const addMistake = useGame((s) => s.addMistake);
  const addXp = useGame((s) => s.addXp);
  const touchStreak = useGame((s) => s.touchStreak);
  const recordAnswer = useGame((s) => s.recordAnswer);

  const [session, setSession] = useState(0);
  const deck = useMemo(
    () => sample(mistakes, MAX_ITEMS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );

  const [idx, setIdx] = useState(0);
  const [fixed, setFixed] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [done, setDone] = useState(false);
  const [finalXp, setFinalXp] = useState(0);

  // Guards the finish block against double-fire: the exiting card stays
  // clickable during its AnimatePresence exit animation, so next() can fire
  // twice (double-click, or held Enter on the autofocused button).
  const finishedRef = useRef(false);

  if (deck.length === 0) {
    return (
      <div>
        <HUD onBack={() => navigate({ type: 'map' })} />
        <div className="center-col" style={{ paddingTop: 40 }}>
          <div style={{ fontSize: 56 }}>🎉</div>
          <div className="game-title">No mistakes to review!</div>
          <div className="subtle">Play in the cities — anything you get wrong ends up here for review.</div>
          <button className="btn" onClick={() => navigate({ type: 'map' })}>
            To the map 🗺️
          </button>
        </div>
      </div>
    );
  }

  const item = deck[Math.min(idx, deck.length - 1)];

  const submit = (value: string) => {
    if (feedback) return;
    const good = matchAnswer(value, item.answer) !== 'wrong';
    recordAnswer(good);
    if (good) {
      setFixed((f) => f + 1);
      resolveMistake(item.id);
      setFeedback({ kind: 'good', message: 'Correct! Removed from the review deck. ✂️', note: item.note });
    } else {
      addMistake(item); // bumps timesMissed
      setFeedback({ kind: 'bad', message: `The answer: “${item.answer}”`, note: item.note });
    }
  };

  const next = () => {
    setFeedback(null);
    if (idx + 1 >= deck.length) {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const xp = fixed * XP_PER_FIX;
      addXp(xp);
      touchStreak();
      setFinalXp(xp);
      setDone(true);
    } else {
      // Non-functional update on purpose: a stale double-fire from the exiting
      // card sets the same value again instead of skipping an item.
      setIdx(idx + 1);
    }
  };

  const restart = () => {
    finishedRef.current = false;
    setSession((s) => s + 1);
    setIdx(0);
    setFixed(0);
    setFeedback(null);
    setDone(false);
  };

  if (done) {
    return (
      <ResultCard
        title="Review complete!"
        emoji="📝"
        correct={fixed}
        total={deck.length}
        stars={fixed === deck.length ? 3 : fixed >= deck.length * 0.7 ? 2 : fixed > 0 ? 1 : 0}
        xp={finalXp}
        onRetry={restart}
        onExit={() => navigate({ type: 'map' })}
        exitLabel="To the map 🗺️"
        extraNote="Fixed mistakes disappear; the rest stay in the deck."
      />
    );
  }

  const city = cityById(item.cityId);

  return (
    <div>
      <HUD onBack={() => navigate({ type: 'map' })} />
      <div className="center-col" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div className="game-title">📝 Review</div>
          <div style={{ flex: 1 }} />
          <div className="hud-pill">
            {city.emoji} {city.name}
          </div>
          <div className="hud-pill">
            {idx + 1}/{deck.length}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={item.id + idx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="card center-col"
            style={{ width: '100%', gap: 14 }}
          >
            {item.timesMissed > 1 && (
              <div className="hud-pill" style={{ background: '#fbe9e7', color: '#94301f' }}>
                Missed {item.timesMissed} times — focus! 🎯
              </div>
            )}
            {item.type === 'sentence' && item.it ? (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div className="subtle">Rebuild the sentence in Italian:</div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>“{item.prompt}”</div>
                </div>
                <WordTiles sentence={item.it} onSubmit={submit} disabled={!!feedback} />
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div className="subtle">
                    {item.type === 'vocab' ? 'How do you say it in Italian?' : 'Fill in the blank:'}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>{item.prompt}</div>
                </div>
                <TypedAnswer onSubmit={submit} disabled={!!feedback} resetKey={idx} />
              </>
            )}
            <Feedback state={feedback} />
            {feedback && (
              <button className="btn" onClick={next} autoFocus>
                {idx + 1 >= deck.length ? 'Finish 🏁' : 'Next →'}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
