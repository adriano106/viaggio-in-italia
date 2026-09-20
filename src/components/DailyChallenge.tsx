import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CITIES, cityById } from '../data/cities';
import { buildDailyChallenge, DAILY_ROUNDS, todayKey } from '../lib/daily';
import { matchAnswer, shuffle } from '../lib/answers';
import { sessionXp, starsFromAccuracy } from '../lib/scoring';
import { isCityUnlocked, useGame } from '../state/gameStore';
import { WordTiles } from './WordTiles';
import { TypedAnswer } from './TypedAnswer';
import { Feedback, type FeedbackState } from './Feedback';
import { ResultCard } from './ResultCard';
import { HUD } from './HUD';

export function DailyChallenge() {
  const navigate = useGame((s) => s.navigate);
  const stamps = useGame((s) => s.stamps);
  const daily = useGame((s) => s.daily);
  const addXp = useGame((s) => s.addXp);
  const touchStreak = useGame((s) => s.touchStreak);
  const addMistake = useGame((s) => s.addMistake);
  const recordAnswer = useGame((s) => s.recordAnswer);
  const completeDaily = useGame((s) => s.completeDaily);
  const bumpCounter = useGame((s) => s.bumpCounter);

  const today = todayKey();
  const alreadyDoneAtStart = useRef(daily.date === today);

  const rounds = useMemo(() => {
    const unlocked = CITIES.filter((c) => isCityUnlocked(c.id, stamps)).map((c) => c.id);
    return buildDailyChallenge(unlocked, today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [done, setDone] = useState(false);
  const [finalXp, setFinalXp] = useState(0);
  const [finalStars, setFinalStars] = useState(0);
  const finishedRef = useRef(false);

  const round = rounds[Math.min(idx, rounds.length - 1)];
  const city = cityById(round.cityId);

  const prepOptions = useMemo(
    () => (round.kind === 'prep' ? shuffle(round.item.options) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idx],
  );

  const answered = (good: boolean, correctAnswer: string, note?: string) => {
    if (feedback) return;
    recordAnswer(good);
    if (good) {
      setCorrect((c) => c + 1);
      setFeedback({ kind: 'good', message: 'Perfetto! (Perfect!)', note });
    } else {
      setFeedback({ kind: 'bad', message: `The answer: “${correctAnswer}”`, note });
    }
  };

  const submitRound = (value: string | number) => {
    if (round.kind === 'tiles') {
      const good = matchAnswer(String(value), round.item.it) !== 'wrong';
      answered(good, round.item.it, round.item.note);
      if (!good)
        addMistake({
          id: round.item.id,
          type: 'sentence',
          cityId: round.cityId,
          prompt: round.item.en,
          answer: round.item.it,
          it: round.item.it,
          note: round.item.note,
        });
    } else if (round.kind === 'verb') {
      const good = matchAnswer(String(value), round.item.answer) !== 'wrong';
      answered(good, round.item.answer, round.item.note);
      if (!good)
        addMistake({
          id: round.item.id,
          type: 'verb',
          cityId: round.cityId,
          prompt: `${round.item.before} ___ ${round.item.after} (${round.item.infinitive}, ${round.item.tense})`,
          answer: round.item.answer,
          note: round.item.note,
        });
    } else if (round.kind === 'prep') {
      const good = value === round.item.answer;
      answered(good, round.item.answer, round.item.note ?? round.item.en);
      if (!good)
        addMistake({
          id: round.item.id,
          type: 'verb',
          cityId: round.cityId,
          prompt: `${round.item.before} ___ ${round.item.after}`,
          answer: round.item.answer,
          note: round.item.note,
        });
    } else {
      const good = value === round.answer;
      answered(good, round.item.en);
      if (!good)
        addMistake({
          id: round.item.id,
          type: 'vocab',
          cityId: round.cityId,
          prompt: round.item.en,
          answer: round.item.it,
        });
    }
  };

  const next = () => {
    setFeedback(null);
    if (idx + 1 >= rounds.length) {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const stars = starsFromAccuracy(correct, rounds.length);
      const firstToday = !alreadyDoneAtStart.current;
      const xp = firstToday ? Math.round(sessionXp(correct, stars, correct) * 1.5) : 0;
      addXp(xp);
      touchStreak();
      if (firstToday) {
        completeDaily(today, correct);
        bumpCounter('dailyDone');
      }
      setFinalXp(xp);
      setFinalStars(stars);
      setDone(true);
    } else {
      // Non-functional update on purpose: stale double-fires re-set the same value.
      setIdx(idx + 1);
    }
  };

  if (done) {
    return (
      <ResultCard
        title="Daily Challenge"
        emoji="🗓️"
        correct={correct}
        total={rounds.length}
        stars={finalStars}
        xp={finalXp}
        onRetry={() => navigate({ type: 'map' })}
        onExit={() => navigate({ type: 'map' })}
        exitLabel="To the map 🗺️"
        extraNote={
          alreadyDoneAtStart.current
            ? 'Practice run — the XP bonus is awarded once per day. Come back tomorrow!'
            : 'Daily bonus: XP ×1.5! A new challenge arrives tomorrow. 🌅'
        }
      />
    );
  }

  return (
    <div>
      <HUD onBack={() => navigate({ type: 'map' })} />
      <div className="center-col" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div className="game-title">🗓️ Daily Challenge</div>
          <div style={{ flex: 1 }} />
          <div className="hud-pill">
            {city.emoji} {city.name}
          </div>
          <div className="hud-pill">
            {idx + 1}/{DAILY_ROUNDS}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="card center-col"
            style={{ width: '100%', gap: 14 }}
          >
            {round.kind === 'tiles' && (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div className="subtle">Translate into Italian:</div>
                  <div style={{ fontSize: 19, fontWeight: 700, marginTop: 4 }}>
                    “{round.item.en}”
                  </div>
                </div>
                <WordTiles sentence={round.item.it} onSubmit={submitRound} disabled={!!feedback} />
              </>
            )}

            {round.kind === 'verb' && (
              <>
                <div className="hud-pill" style={{ background: city.color, color: '#fff' }}>
                  {round.item.infinitive} → {round.item.tense}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', lineHeight: 1.6 }}>
                  {round.item.before}{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: 90,
                      borderBottom: '3px dashed var(--gold)',
                      color: 'var(--ink-soft)',
                    }}
                  >
                    ?
                  </span>{' '}
                  {round.item.after}
                </div>
                <div className="subtle" style={{ fontStyle: 'italic' }}>
                  {round.item.en}
                </div>
                <TypedAnswer onSubmit={submitRound} disabled={!!feedback} resetKey={idx} />
              </>
            )}

            {round.kind === 'prep' && (
              <>
                <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', lineHeight: 1.6 }}>
                  {round.item.before}{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: 64,
                      borderBottom: '3px dashed var(--gold)',
                      color: 'var(--ink-soft)',
                    }}
                  >
                    ?
                  </span>{' '}
                  {round.item.after}
                </div>
                <div className="subtle" style={{ fontStyle: 'italic' }}>
                  {round.item.en}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {prepOptions.map((opt) => (
                    <button
                      key={opt}
                      className="tile"
                      style={{ minWidth: 64, justifyContent: 'center', fontSize: 18 }}
                      disabled={!!feedback}
                      onClick={() => submitRound(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {round.kind === 'vocab' && (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div className="subtle">What does it mean?</div>
                  <div style={{ fontSize: 21, fontWeight: 800, marginTop: 4 }}>
                    {round.item.isIdiom ? '💬 ' : ''}
                    {round.item.it}
                  </div>
                </div>
                <div className="center-col" style={{ gap: 8, width: '100%' }}>
                  {round.options.map((opt, i) => (
                    <button
                      key={i}
                      className="tile"
                      style={{ width: '100%', maxWidth: 440, justifyContent: 'center' }}
                      disabled={!!feedback}
                      onClick={() => submitRound(i)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            <Feedback state={feedback} />
            {feedback && (
              <button className="btn" onClick={next} autoFocus>
                {idx + 1 >= rounds.length ? 'Results 🏁' : 'Next →'}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
