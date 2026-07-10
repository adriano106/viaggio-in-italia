import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { CityId, VocabItem } from '../../types';
import { CONTENT, cityById } from '../../data/cities';
import { shuffle } from '../../lib/answers';
import { sessionXp, starsFromAccuracy } from '../../lib/scoring';
import { useGame } from '../../state/gameStore';
import { ResultCard } from '../ResultCard';
import { HUD } from '../HUD';

const TIME_LIMIT = 100; // seconds
const VISIBLE = 5;

interface CardState {
  item: VocabItem;
  side: 'it' | 'en';
}

export function VocabMarket({ cityId }: { cityId: CityId }) {
  const city = cityById(cityId);
  const navigate = useGame((s) => s.navigate);
  const addXp = useGame((s) => s.addXp);
  const recordStars = useGame((s) => s.recordStars);
  const touchStreak = useGame((s) => s.touchStreak);
  const addMistake = useGame((s) => s.addMistake);
  const recordAnswer = useGame((s) => s.recordAnswer);

  const [session, setSession] = useState(0);
  const allItems = useMemo(
    () => shuffle(CONTENT[cityId].vocab),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cityId, session],
  );

  // Queue of not-yet-shown items; visible board of up to VISIBLE pairs.
  const [queue, setQueue] = useState<VocabItem[]>(() => allItems.slice(VISIBLE));
  const [board, setBoard] = useState<VocabItem[]>(() => allItems.slice(0, VISIBLE));
  const [leftOrder, setLeftOrder] = useState<string[]>(() =>
    shuffle(allItems.slice(0, VISIBLE).map((i) => i.id)),
  );
  const [rightOrder, setRightOrder] = useState<string[]>(() =>
    shuffle(allItems.slice(0, VISIBLE).map((i) => i.id)),
  );
  const [selected, setSelected] = useState<CardState | null>(null);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streakRun, setStreakRun] = useState(0);
  const [bestRun, setBestRun] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [done, setDone] = useState(false);
  const [finalXp, setFinalXp] = useState(0);
  const [finalStars, setFinalStars] = useState(0);
  const finishedRef = useRef(false);

  const total = allItems.length;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [done, session]);

  const finish = (matched: number, wrong: number, run: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const attempts = matched + wrong;
    const stars =
      matched === total ? starsFromAccuracy(matched, attempts) : matched >= total / 2 ? 1 : 0;
    const xp = sessionXp(matched, stars, run);
    addXp(xp);
    recordStars(cityId, 'vocab', stars);
    touchStreak();
    setFinalStars(stars);
    setFinalXp(xp);
    setDone(true);
  };

  useEffect(() => {
    if (timeLeft <= 0 && !done) finish(matchedCount, wrongCount, bestRun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const pick = (item: VocabItem, side: 'it' | 'en') => {
    if (done) return;
    if (!selected) {
      setSelected({ item, side });
      return;
    }
    if (selected.side === side) {
      setSelected({ item, side });
      return;
    }
    // One from each side: check match.
    const match = selected.item.id === item.id;
    recordAnswer(match);
    if (match) {
      const newMatched = matchedCount + 1;
      const newRun = streakRun + 1;
      setMatchedCount(newMatched);
      setStreakRun(newRun);
      setBestRun((b) => Math.max(b, newRun));
      setSelected(null);
      // Replace matched card with next from queue.
      setBoard((b) => {
        const next = queue[0];
        const nb = b.filter((x) => x.id !== item.id);
        if (next) nb.push(next);
        return nb;
      });
      setQueue((q) => q.slice(1));
      const replaceId = queue[0]?.id;
      const swapIn = (order: string[]) =>
        order.map((id) => (id === item.id ? (replaceId ?? '__gone__' + id) : id));
      setLeftOrder(swapIn);
      setRightOrder(swapIn);
      if (newMatched === total) {
        setTimeout(() => finish(newMatched, wrongCount, Math.max(bestRun, newRun)), 500);
      }
    } else {
      setWrongCount((w) => w + 1);
      setStreakRun(0);
      setErrorIds([selected.item.id, item.id]);
      setTimeout(() => setErrorIds([]), 450);
      setSelected(null);
      addMistake({
        id: selected.item.id,
        type: 'vocab',
        cityId,
        prompt: selected.item.en,
        answer: selected.item.it,
        note: selected.item.isIdiom ? "It's an idiom — a fixed expression!" : undefined,
      });
    }
  };

  const restart = () => {
    finishedRef.current = false;
    setSession((s) => s + 1);
    setDone(false);
    setMatchedCount(0);
    setWrongCount(0);
    setStreakRun(0);
    setBestRun(0);
    setSelected(null);
    setTimeLeft(TIME_LIMIT);
  };

  // Rebuild board on session change.
  useEffect(() => {
    setQueue(allItems.slice(VISIBLE));
    setBoard(allItems.slice(0, VISIBLE));
    setLeftOrder(shuffle(allItems.slice(0, VISIBLE).map((i) => i.id)));
    setRightOrder(shuffle(allItems.slice(0, VISIBLE).map((i) => i.id)));
  }, [allItems]);

  if (done) {
    return (
      <ResultCard
        title="Word Market"
        emoji="🛍️"
        correct={matchedCount}
        total={total}
        stars={finalStars}
        xp={finalXp}
        onRetry={restart}
        onExit={() => navigate({ type: 'city', cityId })}
        extraNote={
          matchedCount < total ? "Time's up! Match all the pairs for more stars." : undefined
        }
      />
    );
  }

  const byId = (id: string) => board.find((b) => b.id === id);

  const renderColumn = (order: string[], side: 'it' | 'en') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      {order.map((id) => {
        const item = byId(id);
        if (!item) return <div key={id} style={{ minHeight: 58 }} />;
        const isSel = selected?.item.id === id && selected.side === side;
        const isErr = errorIds.includes(id);
        return (
          <motion.button
            key={`${id}-${side}`}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`vocab-card ${isSel ? 'selected' : ''} ${isErr ? 'error' : ''} ${
              item.isIdiom && side === 'it' ? 'idiom' : ''
            }`}
            onClick={() => pick(item, side)}
          >
            {item.isIdiom && side === 'it' ? '💬 ' : ''}
            {side === 'it' ? item.it : item.en}
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <div>
      <HUD onBack={() => navigate({ type: 'city', cityId })} backLabel={city.name} />
      <div className="center-col" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div className="game-title">🛍️ Word Market</div>
          <div style={{ flex: 1 }} />
          {streakRun >= 3 && <div className="combo-badge">🔥 {streakRun} in a row</div>}
          <div className="hud-pill">
            {matchedCount}/{total}
          </div>
        </div>

        <div style={{ width: '100%' }}>
          <div className="timer-bar">
            <div
              style={{
                width: `${Math.max(0, (timeLeft / TIME_LIMIT) * 100)}%`,
                transition: 'width 1s linear',
              }}
            />
          </div>
          <div className="subtle" style={{ textAlign: 'right', marginTop: 4 }}>
            ⏱ {timeLeft}s
          </div>
        </div>

        <div className="card" style={{ width: '100%', display: 'flex', gap: 14 }}>
          {renderColumn(leftOrder, 'it')}
          {renderColumn(rightOrder, 'en')}
        </div>
        <div className="subtle">Match each Italian word to its meaning. 💬 = idiom</div>
      </div>
    </div>
  );
}
