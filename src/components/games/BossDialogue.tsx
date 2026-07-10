import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { BossChallenge, CityId } from '../../types';
import { CONTENT, CITIES, cityById } from '../../data/cities';
import { matchAnswer } from '../../lib/answers';
import { useGame } from '../../state/gameStore';
import { TypedAnswer } from '../TypedAnswer';
import { WordTiles } from '../WordTiles';
import { Feedback, type FeedbackState } from '../Feedback';
import { ResultCard } from '../ResultCard';
import { HUD } from '../HUD';
import { Confetti } from '../Confetti';

const PASS_THRESHOLD = 6; // out of 8

export function BossDialogue({ cityId }: { cityId: CityId }) {
  const city = cityById(cityId);
  const steps = CONTENT[cityId].boss;
  const navigate = useGame((s) => s.navigate);
  const addXp = useGame((s) => s.addXp);
  const recordStars = useGame((s) => s.recordStars);
  const awardStamp = useGame((s) => s.awardStamp);
  const touchStreak = useGame((s) => s.touchStreak);
  const recordAnswer = useGame((s) => s.recordAnswer);
  const stamps = useGame((s) => s.stamps);

  const [session, setSession] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [showEn, setShowEn] = useState(false);
  const [done, setDone] = useState(false);
  const [passed, setPassed] = useState(false);
  const [finalXp, setFinalXp] = useState(0);
  const [finalStars, setFinalStars] = useState(0);
  const [justStamped, setJustStamped] = useState(false);

  const step = steps[stepIdx];
  const nextCity = CITIES[CITIES.findIndex((c) => c.id === cityId) + 1];

  const answered = (good: boolean, correctAnswer: string, note?: string) => {
    recordAnswer(good);
    if (good) {
      setCorrect((c) => c + 1);
      setFeedback({ kind: 'good', message: 'Ottimo! (Great!)', note });
    } else {
      setFeedback({ kind: 'bad', message: `The correct answer: “${correctAnswer}”`, note });
    }
  };

  const submitChallenge = (ch: BossChallenge, value: string | number) => {
    if (feedback) return;
    if (ch.type === 'choice') {
      answered(value === ch.answer, ch.options[ch.answer], ch.note);
    } else if (ch.type === 'verb') {
      answered(matchAnswer(String(value), ch.answer) !== 'wrong', ch.answer, ch.note);
    } else {
      answered(matchAnswer(String(value), ch.it) !== 'wrong', ch.it, ch.note);
    }
  };

  const next = () => {
    setFeedback(null);
    setShowEn(false);
    if (stepIdx + 1 >= steps.length) {
      const didPass = correct >= PASS_THRESHOLD;
      const stars = correct >= steps.length ? 3 : correct >= 7 ? 2 : didPass ? 1 : 0;
      const wasStamped = stamps.includes(cityId);
      const xp = didPass ? 60 + correct * 10 + (wasStamped ? 0 : 100) : correct * 8;
      addXp(xp);
      if (didPass) {
        recordStars(cityId, 'boss', stars);
        awardStamp(cityId);
        if (!wasStamped) setJustStamped(true);
      }
      touchStreak();
      setPassed(didPass);
      setFinalXp(xp);
      setFinalStars(stars);
      setDone(true);
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  const restart = () => {
    setSession((s) => s + 1);
    setStepIdx(0);
    setCorrect(0);
    setFeedback(null);
    setShowEn(false);
    setDone(false);
    setPassed(false);
    setJustStamped(false);
  };

  if (done) {
    return (
      <div>
        {passed && justStamped && <Confetti count={140} />}
        <ResultCard
          title={
            passed
              ? justStamped
                ? `Stamp earned! ${city.name} is yours! 🛂`
                : `${city.boss.name} is impressed once again!`
              : `${city.boss.name} isn't convinced yet...`
          }
          emoji={passed ? '🎉' : city.boss.emoji}
          correct={correct}
          total={steps.length}
          stars={finalStars}
          xp={finalXp}
          onRetry={restart}
          onExit={() => navigate({ type: 'map' })}
          exitLabel="To the map 🗺️"
          extraNote={
            passed && justStamped && nextCity
              ? `You unlocked ${nextCity.name} ${nextCity.emoji}!`
              : passed && justStamped
                ? "You've completed the whole journey! Sei un vero italofono! 🇮🇹"
                : !passed
                  ? `You need at least ${PASS_THRESHOLD}/${steps.length} correct answers.`
                  : undefined
          }
        />
      </div>
    );
  }

  const ch = step.challenge;

  return (
    <div>
      <HUD onBack={() => navigate({ type: 'city', cityId })} backLabel={city.name} />
      <div className="center-col" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div className="game-title">
            👑 {city.boss.name}
          </div>
          <div style={{ flex: 1 }} />
          <div className="hud-pill">✓ {correct}</div>
          <div className="hud-pill">
            {stepIdx + 1}/{steps.length}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${stepIdx}-${session}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            style={{ width: '100%' }}
            className="center-col"
          >
            {/* NPC speech */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', width: '100%' }}>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                style={{ fontSize: 48, lineHeight: 1 }}
              >
                {city.boss.emoji}
              </motion.div>
              <div className="bubble" style={{ flex: 1 }}>
                {step.npc}
                {showEn ? (
                  <span className="translation">{step.npcEn}</span>
                ) : (
                  <button
                    className="btn ghost small"
                    style={{ marginTop: 8, display: 'block' }}
                    onClick={() => setShowEn(true)}
                  >
                    🔎 show translation
                  </button>
                )}
              </div>
            </div>

            {/* Challenge */}
            <div className="card center-col" style={{ width: '100%', gap: 14 }}>
              {ch.type === 'choice' && (
                <>
                  <div style={{ fontWeight: 700, fontSize: 17, textAlign: 'center' }}>
                    {ch.question}
                  </div>
                  <div className="center-col" style={{ gap: 8, width: '100%' }}>
                    {ch.options.map((opt, i) => (
                      <button
                        key={i}
                        className="tile"
                        style={{ width: '100%', maxWidth: 440, justifyContent: 'center' }}
                        disabled={!!feedback}
                        onClick={() => submitChallenge(ch, i)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {ch.type === 'verb' && (
                <>
                  <div className="hud-pill" style={{ background: city.color, color: '#fff' }}>
                    {ch.infinitive} → {ch.tense}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', lineHeight: 1.6 }}>
                    {ch.before}{' '}
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
                    {ch.after}
                  </div>
                  <TypedAnswer
                    onSubmit={(v) => submitChallenge(ch, v)}
                    disabled={!!feedback}
                    resetKey={stepIdx + session * 100}
                  />
                </>
              )}

              {ch.type === 'order' && (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <div className="subtle">Build the sentence in Italian:</div>
                    <div style={{ fontWeight: 700, fontSize: 17 }}>“{ch.en}”</div>
                  </div>
                  <WordTiles
                    sentence={ch.it}
                    onSubmit={(v) => submitChallenge(ch, v)}
                    disabled={!!feedback}
                    resetKey={session}
                  />
                </>
              )}

              <Feedback state={feedback} />
              {feedback && (
                <button className="btn" onClick={next} autoFocus>
                  {stepIdx + 1 >= steps.length ? 'Final verdict 👑' : 'Continue →'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
