export function calculateXpForStep(step: any, userScore?: number): {
  baseXp: number;
  bonusXp: number;
  totalXp: number;
} {
  const baseXp = step.xp || 10;
  let bonusXp = 0;

  // Perfect score bonus (10%)
  if (userScore === 100) {
    bonusXp = Math.floor(baseXp * 0.1);
  }

  return {
    baseXp,
    bonusXp,
    totalXp: baseXp + bonusXp,
  };
}

export function calculateLevel(totalXp: number): number {
  // Simple leveling: level = floor(sqrt(totalXp / 100)) + 1
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}