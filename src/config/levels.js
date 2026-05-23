export const LEVELS = [
  {
    number: 1,
    name: 'WAKE UP',
    killsToAdvance: 12,
    spawnIntervalMs: 1100,
    maxConcurrent: 5,
    enemySpeedMult: 1.0,
    enemyHpMult: 1.0,
  },
  {
    number: 2,
    name: 'GETTING WARM',
    killsToAdvance: 20,
    spawnIntervalMs: 800,
    maxConcurrent: 8,
    enemySpeedMult: 1.25,
    enemyHpMult: 1.4,
  },
  {
    number: 3,
    name: 'OVERRUN',
    killsToAdvance: 30,
    spawnIntervalMs: 550,
    maxConcurrent: 12,
    enemySpeedMult: 1.55,
    enemyHpMult: 1.8,
  },
];

export const TOTAL_LEVELS = LEVELS.length;
