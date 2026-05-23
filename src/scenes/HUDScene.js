import Phaser from 'phaser';
import { GAME_WIDTH, COLORS, POWERUP } from '../config/constants.js';

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

    this.add.text(padding, padding, 'HP', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#e6e6f0',
    });
    this.add.rectangle(padding + 30, padding + 7, barWidth, barHeight, 0x000000, 0.5).setOrigin(0, 0.5);
    this.hpBar = this.add
      .rectangle(padding + 30, padding + 7, barWidth, barHeight, COLORS.hudGood)
      .setOrigin(0, 0.5);

    const stripY = padding + 30;
    this.tripleIcon = this.add.image(padding + 10, stripY + 12, 'pickup-triple').setVisible(false);
    this.tripleBarBg = this.add.rectangle(padding + 28, stripY + 12, 60, 6, 0x000000, 0.5).setOrigin(0, 0.5).setVisible(false);
    this.tripleBar = this.add.rectangle(padding + 28, stripY + 12, 60, 6, 0xffa040).setOrigin(0, 0.5).setVisible(false);

    this.shieldIcon = this.add.image(padding + 10, stripY + 36, 'pickup-shield').setVisible(false);
    this.shieldBarBg = this.add.rectangle(padding + 28, stripY + 36, 60, 6, 0x000000, 0.5).setOrigin(0, 0.5).setVisible(false);
    this.shieldBar = this.add.rectangle(padding + 28, stripY + 36, 60, 6, 0x4da6ff).setOrigin(0, 0.5).setVisible(false);

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

    const now = this.gameScene.time.now;
    const tripleLeft = Math.max(0, player.tripleUntil - now);
    const tripleActive = tripleLeft > 0;
    this.tripleIcon.setVisible(tripleActive);
    this.tripleBarBg.setVisible(tripleActive);
    this.tripleBar.setVisible(tripleActive);
    if (tripleActive) this.tripleBar.width = 60 * (tripleLeft / POWERUP.tripleMs);

    const shieldLeft = Math.max(0, player.shieldUntil - now);
    const shieldActive = shieldLeft > 0;
    this.shieldIcon.setVisible(shieldActive);
    this.shieldBarBg.setVisible(shieldActive);
    this.shieldBar.setVisible(shieldActive);
    if (shieldActive) this.shieldBar.width = 60 * (shieldLeft / POWERUP.shieldMs);
  }
}
