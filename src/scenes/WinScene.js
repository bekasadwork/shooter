import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { getHighScore, setHighScore } from '../util/storage.js';

export default class WinScene extends Phaser.Scene {
  constructor() {
    super('Win');
  }

  init(data) {
    this.score = data.score;
  }

  create() {
    const prevHi = getHighScore();
    const newHi = this.score > prevHi;
    if (newHi) setHighScore(this.score);

    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'floor').setOrigin(0, 0).setAlpha(0.6);

    const title = this.add.text(GAME_WIDTH / 2, 180, 'YOU WIN', {
      fontFamily: 'monospace',
      fontSize: '88px',
      color: '#fff36b',
      stroke: '#00ffe0',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, scale: { from: 1, to: 1.08 }, duration: 800, yoyo: true, repeat: -1 });

    this.add.text(GAME_WIDTH / 2, 290, 'the arena is silent.', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 340, `FINAL SCORE: ${this.score}`, {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#4dff88',
    }).setOrigin(0.5);

    if (newHi) {
      const hi = this.add.text(GAME_WIDTH / 2, 380, '** NEW HIGH SCORE **', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#00ffe0',
      }).setOrigin(0.5);
      this.tweens.add({ targets: hi, alpha: { from: 1, to: 0.3 }, duration: 600, yoyo: true, repeat: -1 });
    }

    const again = this.add.text(GAME_WIDTH / 2, 460, '> PLAY AGAIN <', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#00ffe0',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    again.on('pointerover', () => again.setColor('#ffffff'));
    again.on('pointerout', () => again.setColor('#00ffe0'));
    again.on('pointerdown', () => this.go('Game', { levelIndex: 0, score: 0 }));

    const menu = this.add.text(GAME_WIDTH / 2, 510, 'menu', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aaaacc',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on('pointerover', () => menu.setColor('#ffffff'));
    menu.on('pointerout', () => menu.setColor('#aaaacc'));
    menu.on('pointerdown', () => this.go('Menu'));

    this.input.keyboard.once('keydown-ENTER', () => this.go('Menu'));

    this.cameras.main.fadeIn(400, 11, 11, 18);
  }

  go(scene, data) {
    this.cameras.main.fadeOut(250, 11, 11, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(scene, data));
  }
}
