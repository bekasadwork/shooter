import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { getHighScore, setHighScore } from '../util/storage.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.levelReached = data.levelReached;
    this.score = data.score;
  }

  create() {
    const prevHi = getHighScore();
    const newHi = this.score > prevHi;
    if (newHi) setHighScore(this.score);

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0b0b12, 0.95).setOrigin(0, 0);

    this.add.text(GAME_WIDTH / 2, 180, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#ff3860',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 260, `you fell on level ${this.levelReached}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 310, `SCORE: ${this.score}`, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#fff36b',
    }).setOrigin(0.5);

    if (newHi) {
      const hi = this.add.text(GAME_WIDTH / 2, 345, '** NEW HIGH SCORE **', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#4dff88',
      }).setOrigin(0.5);
      this.tweens.add({ targets: hi, alpha: { from: 1, to: 0.3 }, duration: 600, yoyo: true, repeat: -1 });
    }

    const retry = this.add.text(GAME_WIDTH / 2, 420, '> RETRY <', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#00ffe0',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerover', () => retry.setColor('#ffffff'));
    retry.on('pointerout', () => retry.setColor('#00ffe0'));
    retry.on('pointerdown', () => this.go('Game', { levelIndex: 0, score: 0 }));

    const menu = this.add.text(GAME_WIDTH / 2, 470, 'menu', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#aaaacc',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on('pointerover', () => menu.setColor('#ffffff'));
    menu.on('pointerout', () => menu.setColor('#aaaacc'));
    menu.on('pointerdown', () => this.go('Menu'));

    this.input.keyboard.once('keydown-ENTER', () => this.go('Game', { levelIndex: 0, score: 0 }));
    this.input.keyboard.once('keydown-ESC', () => this.go('Menu'));

    this.cameras.main.fadeIn(300, 11, 11, 18);
  }

  go(scene, data) {
    this.cameras.main.fadeOut(250, 11, 11, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(scene, data));
  }
}
