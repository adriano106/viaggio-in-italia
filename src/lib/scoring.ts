/** Stars from accuracy: ≥90% → 3, ≥70% → 2, ≥50% → 1, else 0. */
export function starsFromAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  const acc = correct / total;
  if (acc >= 0.9) return 3;
  if (acc >= 0.7) return 2;
  if (acc >= 0.5) return 1;
  return 0;
}

/** XP for a completed session: base per correct answer + star bonus. */
export function sessionXp(correct: number, stars: number, comboBest: number): number {
  return correct * 10 + stars * 25 + Math.min(comboBest, 10) * 5;
}

/** Combo multiplier shown in-game: 1x, 2x at 3 streak, 3x at 6 streak. */
export function comboMultiplier(streak: number): number {
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

export function levelFromXp(xp: number): { level: number; into: number; needed: number } {
  // Level n requires 150 * n XP to advance (gentle curve).
  let level = 1;
  let remaining = xp;
  while (remaining >= 150 * level) {
    remaining -= 150 * level;
    level++;
  }
  return { level, into: remaining, needed: 150 * level };
}
