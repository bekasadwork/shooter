import Phaser from 'phaser';
import { GAME_WIDTH, COLORS } from '../config/constants.js';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const padding = 16;
    const barWidth = 220;
    const barHeight = 16;

    // HP label
    this.add.text(padding, padding, 'HP', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#e6e6f0',
    });
    // HP background
    this.add.rectangle(padding + 30, padding + 7, barWidth, barHeight, 0x000000, 0.5).setOrigin(0, 0.5);
    this.hpBar = this.add
      .rectangle(padding + 30, padding + 7, barWidth, barHeight, COLORS.hudGood)
      .setOrigin(0, 0.5);

    this.levelText = this.add.text(GAME_WIDTH / 2, padding, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#00ffe0',
    }).setOrigin(0.5, 0);

    this.killsText = this.add.text(GAME_WIDTH - padding, padding, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#e6e6f0',
    }).setOrigin(1, 0);

    this.scoreText = this.add.text(GAME_WIDTH - padding, padding + 22, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#fff36b',
    }).setOrigin(1, 0);

    this.hintText = this.add.text(GAME_WIDTH / 2, this.scale.height - 14,
      'WASD / arrows to move  •  mouse to aim  •  click to shoot', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#777799',
    }).setOrigin(0.5, 1);
  }

  update() {
    if (!this.gameScene || !this.gameScene.scene.isActive()) return;
    const player = this.gameScene.player;
    const hpPct = player ? player.hp / player.maxHp : 0;
    this.hpBar.width = 220 * hpPct;
    this.hpBar.fillColor = hpPct > 0.5 ? COLORS.hudGood : hpPct > 0.25 ? 0xffaa00 : COLORS.hudBad;

    const level = this.gameScene.level;
    this.levelText.setText(`LEVEL ${level.number}  —  ${level.name}`);
    const remaining = Math.max(0, level.killsToAdvance - this.gameScene.kills);
    this.killsText.setText(`KILLS LEFT: ${remaining}`);
    this.scoreText.setText(`SCORE: ${this.gameScene.score}`);
  }
}
