import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CityId } from '../../types';
import { CONTENT, cityById } from '../../data/cities';
import { matchAnswer, sample } from '../../lib/answers';
import { comboMultiplier, sessionXp, starsFromAccuracy } from '../../lib/scoring';
import { useGame } from '../../state/gameStore';
import { WordTiles } from '../WordTiles';
import { Feedback, type FeedbackState } from '../Feedback';
import { ResultCard } from '../ResultCard';
import { HUD } from '../HUD';

const ROUNDS = 8;

export function SentenceBuilder({ cityId }: { cityId: CityId }) {
  const city = cityById(cityId);
  const navigate = useGame((s) => s.navigate);
  const addXp = useGame((s) => s.addXp);
  const recordStars = useGame((s) => s.recordStars);
  const touchStreak = useGame((s) => s.touchStreak);
  const addMistake = useGame((s) => s.addMistake);
  const recordAnswer = useGame((s) => s.recordAnswer);

  const [session, setSession] = useState(0);
  const items = useMemo(
    () => sample(CONTENT[cityId].sentences, ROUNDS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cityId, session],
  );

  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [done, setDone] = useState(false);
  const [finalXp, setFinalXp] = useState(0);
  const [finalStars, setFinalStars] = useState(0);

  const item = items[round];

  const submit = (given: string) => {
    if (feedback) return;
    const result = matchAnswer(given, item.it);
    const good = result !== 'wrong';
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
            ? `Perfetto! Combo x${comboMultiplier(newCombo)} 🔥`
            : 'Perfetto! (Perfect!)',
        note: item.note,
      });
    } else {
      setCombo(0);
      setFeedback({ kind: 'bad', message: `The correct sentence: “${item.it}”`, note: item.note });
      addMistake({
        id: item.id,
        type: 'sentence',
        cityId,
        prompt: item.en,
        answer: item.it,
        it: item.it,
        note: item.note,
      });
    }
  };

  const next = () => {
    setFeedback(null);
    if (round + 1 >= items.length) {
      const wasCorrect = correct; // state already updated by submit
      const stars = starsFromAccuracy(wasCorrect, items.length);
      const xp = sessionXp(wasCorrect, stars, bestCombo);
      addXp(xp);
      recordStars(cityId, 'sentence', stars);
      touchStreak();
      setFinalXp(xp);
      setFinalStars(stars);
      setDone(true);
    } else {
      setRound((r) => r + 1);
    }
  };

  const restart = () => {
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
        title="Sentence Builder"
        emoji="🧱"
        correct={correct}
        total={items.length}
        stars={finalStars}
        xp={finalXp}
        onRetry={restart}
        onExit={() => navigate({ type: 'city', cityId })}
        extraNote={
          finalStars === 0
            ? 'No stars this time — get at least half the sentences right to earn one. You need 1★ here to unlock the boss!'
            : undefined
        }
      />
    );
  }

  return (
    <div>
      <HUD onBack={() => navigate({ type: 'city', cityId })} backLabel={city.name} />
      <div className="center-col" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div className="game-title">🧱 Sentence Builder</div>
          <div className="spacer" style={{ flex: 1 }} />
          {combo >= 3 && <div className="combo-badge">🔥 x{comboMultiplier(combo)}</div>}
          <div className="hud-pill">
            {round + 1}/{items.length}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${item.id}-${session}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="card center-col"
            style={{ width: '100%', gap: 16 }}
          >
            <div style={{ textAlign: 'center' }}>
              <div className="subtle">Translate into Italian:</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>“{item.en}”</div>
            </div>
            <WordTiles sentence={item.it} onSubmit={submit} disabled={!!feedback} />
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
