import { useGame } from '../state/gameStore';
import { levelFromXp } from '../lib/scoring';

export function HUD({ onBack, backLabel }: { onBack?: () => void; backLabel?: string }) {
  const xp = useGame((s) => s.xp);
  const streak = useGame((s) => s.streakCount);
  const mistakes = useGame((s) => s.mistakes);
  const { level, into, needed } = levelFromXp(xp);

  return (
    <div className="hud">
      {onBack && (
        <button className="btn ghost small" onClick={onBack}>
          ← {backLabel ?? 'Map'}
        </button>
      )}
      <div className="spacer" />
      <div className="hud-pill" title={`${xp} total XP`}>
        <span>⭐ Lvl {level}</span>
        <div className="xp-bar">
          <div style={{ width: `${Math.min(100, (into / needed) * 100)}%` }} />
        </div>
      </div>
      <div className="hud-pill" title="Day streak">
        🔥 {streak}
      </div>
      {mistakes.length > 0 && (
        <div className="hud-pill" title="Mistakes to review">
          📝 {mistakes.length}
        </div>
      )}
    </div>
  );
}
