import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CityId } from '../../types';
import { CONTENT, cityById } from '../../data/cities';
import { matchAnswer, sample } from '../../lib/answers';
import { sessionXp } from '../../lib/scoring';
import { useGame } from '../../state/gameStore';
import { TypedAnswer } from '../TypedAnswer';
import { Feedback, type FeedbackState } from '../Feedback';
import { ResultCard } from '../ResultCard';
import { HUD } from '../HUD';

const HITS_TO_WIN = 8;
const MAX_HEARTS = 4;

export function VerbDuel({ cityId }: { cityId: CityId }) {
  const city = cityById(cityId);
  const navigate = useGame((s) => s.navigate);
  const addXp = useGame((s) => s.addXp);
  const recordStars = useGame((s) => s.recordStars);
  const touchStreak = useGame((s) => s.touchStreak);
  const addMistake = useGame((s) => s.addMistake);
  const recordAnswer = useGame((s) => s.recordAnswer);
  const bumpCounter = useGame((s) => s.bumpCounter);

  const [session, setSession] = useState(0);
  const items = useMemo(
    () => sample(CONTENT[cityId].verbs, 12),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cityId, session],
  );

  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [playerFlinch, setPlayerFlinch] = useState(0);
  const [enemyFlinch, setEnemyFlinch] = useState(0);
  const [outcome, setOutcome] = useState<'win' | 'lose' | null>(null);
  const [finalXp, setFinalXp] = useState(0);
  const [finalStars, setFinalStars] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const item = items[idx % items.length];

  const finish = (won: boolean, heartsLeft: number, totalHits: number) => {
    const stars = won ? (heartsLeft >= MAX_HEARTS ? 3 : heartsLeft >= 3 ? 2 : 1) : 0;
    const xp = won ? sessionXp(totalHits, stars, totalHits) : totalHits * 5;
    if (won && heartsLeft >= MAX_HEARTS) bumpCounter('perfectDuel');
    addXp(xp);
    recordStars(cityId, 'verbs', stars);
    touchStreak();
    setFinalXp(xp);
    setFinalStars(stars);
    setOutcome(won ? 'win' : 'lose');
  };

  const submit = (value: string) => {
    if (feedback) return;
    const result = matchAnswer(value, item.answer);
    const good = result !== 'wrong';
    recordAnswer(good);
    if (good) {
      const newHits = hits + 1;
      setHits(newHits);
      setEnemyFlinch((f) => f + 1);
      setFeedback({
        kind: 'good',
        message:
          result === 'accents'
            ? `Hit! ⚔️ (watch the accents: it's “${item.answer}”)`
            : `Hit! ⚔️ “${item.answer}” is exactly right.`,
        note: item.note,
      });
      if (newHits >= HITS_TO_WIN) {
        setTimeout(() => finish(true, hearts, newHits), 900);
      }
    } else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setWrongCount((w) => w + 1);
      setPlayerFlinch((f) => f + 1);
      setFeedback({
        kind: 'bad',
        message: `${city.opponent.name} strikes back! The answer: “${item.answer}”`,
        note: item.note ?? `${item.infinitive} → ${item.tense}`,
      });
      addMistake({
        id: item.id,
        type: 'verb',
        cityId,
        prompt: `${item.before} ___ ${item.after} (${item.infinitive}, ${item.tense})`,
        answer: item.answer,
        note: item.note,
      });
      if (newHearts <= 0) {
        setTimeout(() => finish(false, 0, hits), 900);
      }
    }
  };

  const next = () => {
    setFeedback(null);
    // Non-functional update on purpose: a stale double-fire from the exiting
    // card (still clickable during its exit animation) sets the same value
    // again instead of skipping a question.
    setIdx(idx + 1);
  };

  const restart = () => {
    setSession((s) => s + 1);
    setIdx(0);
    setHits(0);
    setHearts(MAX_HEARTS);
    setFeedback(null);
    setOutcome(null);
    setWrongCount(0);
  };

  if (outcome) {
    return (
      <ResultCard
        title={outcome === 'win' ? `You beat ${city.opponent.name}!` : `${city.opponent.name} wins this time...`}
        emoji={outcome === 'win' ? '🏆' : '😵'}
        correct={hits}
        total={hits + wrongCount}
        stars={finalStars}
        xp={finalXp}
        onRetry={restart}
        onExit={() => navigate({ type: 'city', cityId })}
        extraNote={
          outcome === 'lose'
            ? 'No stars for a loss — land 8 hits before losing your 4 hearts. You need 1★ here to unlock the boss!'
            : undefined
        }
      />
    );
  }

  const enemyHp = Math.max(0, ((HITS_TO_WIN - hits) / HITS_TO_WIN) * 100);

  return (
    <div>
      <HUD onBack={() => navigate({ type: 'city', cityId })} backLabel={city.name} />
      <div className="center-col" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="game-title">⚔️ Verb Duel</div>

        {/* Battle scene */}
        <div
          className="card battle-scene"
          style={{ width: '100%', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <motion.div
            key={`p-${playerFlinch}`}
            animate={{ x: [0, -10, 8, 0], rotate: [0, -6, 4, 0] }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', flex: 1 }}
          >
            <div className="avatar" style={{ fontSize: 46 }}>🧑‍🎓</div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>You</div>
            <div style={{ fontSize: 18, letterSpacing: 2 }}>
              {'❤️'.repeat(hearts)}
              <span style={{ filter: 'grayscale(1) opacity(0.4)' }}>{'❤️'.repeat(MAX_HEARTS - hearts)}</span>
            </div>
          </motion.div>

          <div className="battle-vs" style={{ fontSize: 26, fontWeight: 900, color: 'var(--ink-soft)' }}>VS</div>

          <motion.div
            key={`e-${enemyFlinch}`}
            animate={{ x: [0, 10, -8, 0], rotate: [0, 6, -4, 0] }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', flex: 1 }}
          >
            <div className="avatar" style={{ fontSize: 46 }}>{city.opponent.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              {city.opponent.name} {city.opponent.title}
            </div>
            <div className="hp-bar" style={{ marginTop: 6 }}>
              <div
                style={{
                  width: `${enemyHp}%`,
                  background: enemyHp > 50 ? '#58b07a' : enemyHp > 25 ? '#f2b134' : '#cf4436',
                }}
              />
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${item.id}-${idx}-${session}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="card center-col"
            style={{ width: '100%', gap: 14 }}
          >
            <div className="hud-pill" style={{ background: city.color, color: '#fff' }}>
              {item.infinitive} → {item.tense}
            </div>
            <div style={{ fontSize: 21, fontWeight: 700, textAlign: 'center', lineHeight: 1.6 }}>
              {item.before}{' '}
              <span
                style={{
                  display: 'inline-block',
                  minWidth: 90,
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
            <TypedAnswer
              onSubmit={submit}
              disabled={!!feedback}
              resetKey={idx + session * 100}
              buttonLabel="Attack! ⚔️"
            />
            <Feedback state={feedback} />
            {feedback && hits < HITS_TO_WIN && hearts > 0 && (
              <button className="btn" onClick={next} autoFocus>
                Next round →
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
