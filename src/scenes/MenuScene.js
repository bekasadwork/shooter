import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { getHighScore } from '../util/storage.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'floor').setOrigin(0, 0).setAlpha(0.6);

    // Animated title
    const title = this.add.text(GAME_WIDTH / 2, 160, 'NEON SHOOTER', {
      fontFamily: 'monospace',
      fontSize: '72px',
      color: '#00ffe0',
      stroke: '#ff3860',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.04 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.text(GAME_WIDTH / 2, 230, 'top-down arena, 3 levels of trouble', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // Controls
    const controlsBox = [
      'CONTROLS',
      '  MOVE     WASD  /  ARROW KEYS',
      '  AIM      MOUSE',
      '  SHOOT    LEFT CLICK   (hold for auto)',
    ].join('\n');
    this.add.text(GAME_WIDTH / 2, 330, controlsBox, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#e6e6f0',
      align: 'center',
    }).setOrigin(0.5);

    // Start button
    const start = this.add.text(GAME_WIDTH / 2, 470, '> START <', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#fff36b',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    start.on('pointerover', () => start.setColor('#ffffff'));
    start.on('pointerout', () => start.setColor('#fff36b'));
    start.on('pointerdown', () => this.startGame());

    this.tweens.add({
      targets: start,
      alpha: { from: 1, to: 0.5 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // High score
    const hi = getHighScore();
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, `HIGH SCORE: ${hi}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'press  ENTER  or  click  to begin', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#777799',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
  }

  startGame() {
    this.cameras.main.fadeOut(250, 11, 11, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game', { levelIndex: 0, score: 0 });
    });
  }
}
