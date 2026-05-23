export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;

export const COLORS = {
  bg: 0x0b0b12,
  bgGrid: 0x14142a,
  player: 0x00ffe0,
  playerBarrel: 0xffffff,
  enemy: 0xff3860,
  enemyDark: 0x801c30,
  bullet: 0xfff36b,
  bulletTrail: 0xffffff,
  hudGood: 0x4dff88,
  hudBad: 0xff3860,
  hudText: 0xe6e6f0,
};

export const PLAYER = {
  radius: 16,
  speed: 240,
  maxHp: 100,
  invulnMs: 600,
  fireRateMs: 180,
};

export const BULLET = {
  speed: 720,
  radius: 4,
  lifetimeMs: 1000,
  damage: 25,
};

export const ENEMY = {
  radius: 14,
  baseSpeed: 90,
  baseHp: 25,
  contactDamage: 20,
  separationStrength: 60,
};

export const TANK = {
  hullW: 36,
  hullH: 28,
  turretW: 14,
  turretH: 22,
  barrelLen: 18,
  turnRateRad: 6,
};

export const COVER = {
  fill: 0x1c1c38,
  edge: 0x00ffe0,
  edgeAlpha: 0.9,
};

export const POWERUP = {
  dropChance: 0.12,
  healthAmount: 30,
  tripleMs: 10000,
  shieldMs: 8000,
  tripleSpreadRad: Math.PI / 18,
  iconSize: 22,
};
