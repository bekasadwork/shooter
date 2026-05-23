import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelComplete');
  }

  init(data) {
    this.justFinished = data.justFinished;
    this.nextIndex = data.nextIndex;
    this.score = data.score;
  }

  create() {
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'floor').setOrigin(0, 0).setAlpha(0.5);

    this.add.text(GAME_WIDTH / 2, 200, `LEVEL ${this.justFinished} CLEAR`, {
      fontFamily: 'monospace',
      fontSize: '56px',
      color: '#4dff88',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 280, `SCORE: ${this.score}`, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#fff36b',
    }).setOrigin(0.5);

    const cont = this.add.text(GAME_WIDTH / 2, 400, '> CONTINUE <', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#00ffe0',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    cont.on('pointerover', () => cont.setColor('#ffffff'));
    cont.on('pointerout', () => cont.setColor('#00ffe0'));
    cont.on('pointerdown', () => this.go());

    this.input.keyboard.once('keydown-ENTER', () => this.go());
    this.input.keyboard.once('keydown-SPACE', () => this.go());

    this.cameras.main.fadeIn(250, 11, 11, 18);
  }

  go() {
    this.cameras.main.fadeOut(250, 11, 11, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game', { levelIndex: this.nextIndex, score: this.score });
    });
  }
}
