export const LEVELS = [
  {
    number: 1,
    name: 'WAKE UP',
    killsToAdvance: 12,
    spawnIntervalMs: 1100,
    maxConcurrent: 5,
    enemySpeedMult: 1.0,
    enemyHpMult: 1.0,
    coverBlocks: [
      { x: 240, y: 180, w: 100, h: 24 },
      { x: 720, y: 180, w: 100, h: 24 },
      { x: 240, y: 460, w: 100, h: 24 },
      { x: 720, y: 460, w: 100, h: 24 },
      { x: 480, y: 320, w: 32, h: 110 },
    ],
  },
  {
    number: 2,
    name: 'GETTING WARM',
    killsToAdvance: 20,
    spawnIntervalMs: 800,
    maxConcurrent: 8,
    enemySpeedMult: 1.25,
    enemyHpMult: 1.4,
    coverBlocks: [
      { x: 480, y: 320, w: 24, h: 220 },
      { x: 200, y: 320, w: 90, h: 28 },
      { x: 760, y: 320, w: 90, h: 28 },
      { x: 350, y: 140, w: 60, h: 24 },
      { x: 610, y: 500, w: 60, h: 24 },
    ],
  },
  {
    number: 3,
    name: 'OVERRUN',
    killsToAdvance: 30,
    spawnIntervalMs: 550,
    maxConcurrent: 12,
    enemySpeedMult: 1.55,
    enemyHpMult: 1.8,
    coverBlocks: [
      { x: 320, y: 200, w: 24, h: 100 },
      { x: 640, y: 440, w: 24, h: 100 },
      { x: 220, y: 420, w: 100, h: 24 },
      { x: 740, y: 220, w: 100, h: 24 },
      { x: 480, y: 100, w: 60, h: 24 },
      { x: 480, y: 540, w: 60, h: 24 },
      { x: 480, y: 320, w: 50, h: 50 },
    ],
  },
];

export const TOTAL_LEVELS = LEVELS.length;
