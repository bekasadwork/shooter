const HIGH_SCORE_KEY = 'neon-shooter:highScore';

export function getHighScore() {
  try {
    const v = localStorage.getItem(HIGH_SCORE_KEY);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function setHighScore(score) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // ignore
  }
}
