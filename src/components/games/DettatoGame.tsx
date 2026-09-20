import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CityId } from '../../types';
import { CONTENT, cityById } from '../../data/cities';
import { matchAnswer, sample } from '../../lib/answers';
import { comboMultiplier, sessionXp, starsFromAccuracy } from '../../lib/scoring';
import { speakItalian, speechAvailable } from '../../lib/speech';
import { useGame } from '../../state/gameStore';
import { WordTiles } from '../WordTiles';
import { Feedback, type FeedbackState } from '../Feedback';
import { ResultCard } from '../ResultCard';
import { HUD } from '../HUD';

const ROUNDS = 6;

export function DettatoGame({ cityId }: { cityId: CityId }) {
  const city = cityById(cityId);
  const navigate = useGame((s) => s.navigate);
  const addXp = useGame((s) => s.addXp);
  const recordStars = useGame((s) => s.recordStars);
  const touchStreak = useGame((s) => s.touchStreak);
  const addMistake = useGame((s) => s.addMistake);
  const recordAnswer = useGame((s) => s.recordAnswer);

  const [session, setSession] = useState(0);
  const items = useMemo(
    () => sample(CONTENT[cityId].dettato ?? [], ROUNDS),
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
  const [flash, setFlash] = useState(false); // no-voice fallback: show the text briefly
  const canSpeak = speechAvailable();

  const finishedRef = useRef(false);

  const item = items[Math.min(round, items.length - 1)];

  const listen = (rate = 1) => {
    if (canSpeak) {
      speakItalian(item.it, rate);
    } else {
      // No Italian voice on this device: flash the sentence instead.
      setFlash(true);
      window.setTimeout(() => setFlash(false), 2000);
    }
  };

  // Speak automatically at the start of each round.
  useEffect(() => {
    if (!done && item) {
      const t = window.setTimeout(() => listen(), 450);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, session, done]);

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
            ? `Che orecchio! Combo x${comboMultiplier(newCombo)} 🔥`
            : 'Che orecchio! (What an ear!)',
        note: `“${item.it}” — ${item.en}`,
      });
    } else {
      setCombo(0);
      setFeedback({
        kind: 'bad',
        message: `You heard: “${item.it}”`,
        note: item.note ?? item.en,
      });
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
      if (finishedRef.current) return;
      finishedRef.current = true;
      const stars = starsFromAccuracy(correct, items.length);
      const xp = sessionXp(correct, stars, bestCombo);
      addXp(xp);
      recordStars(cityId, 'dettato', stars);
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
        title="Il Dettato"
        emoji="🎧"
        correct={correct}
        total={items.length}
        stars={finalStars}
        xp={finalXp}
        onRetry={restart}
        onExit={() => navigate({ type: 'city', cityId })}
        extraNote={
          finalStars === 0
            ? 'No stars this time — rebuild at least half the sentences you hear. You need 1★ here to unlock the boss!'
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
          <div className="game-title">🎧 Il Dettato</div>
          <div style={{ flex: 1 }} />
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
            <div className="subtle">
              {canSpeak
                ? 'Listen and rebuild the sentence you hear:'
                : 'No Italian voice on this device — the sentence flashes briefly instead:'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" onClick={() => listen()} disabled={!!feedback}>
                🔊 Ascolta
              </button>
              <button className="btn ghost" onClick={() => listen(0.65)} disabled={!!feedback}>
                🐢 Più lento
              </button>
            </div>
            {flash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontSize: 19, fontWeight: 700 }}
              >
                “{item.it}”
              </motion.div>
            )}
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
