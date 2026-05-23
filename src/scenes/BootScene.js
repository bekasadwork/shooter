import Phaser from 'phaser';
import { COLORS, PLAYER, ENEMY, BULLET } from '../config/constants.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'LOADING...', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#00ffe0',
      })
      .setOrigin(0.5);

    this.generateTextures();

    this.time.delayedCall(150, () => this.scene.start('Menu'));
  }

  generateTextures() {
    this.makePlayerTexture();
    this.makeEnemyTexture();
    this.makeBulletTexture();
    this.makeParticleTexture();
    this.makeMuzzleFlashTexture();
    this.makeFloorTileTexture();
  }

  makePlayerTexture() {
    const r = PLAYER.radius;
    const size = r * 3;
    const g = this.add.graphics();
    g.fillStyle(COLORS.player, 1);
    g.fillCircle(size / 2, size / 2, r);
    g.lineStyle(2, 0xffffff, 0.9);
    g.strokeCircle(size / 2, size / 2, r);

    // Gun barrel sticks out to the right (sprite's "forward")
    g.fillStyle(COLORS.playerBarrel, 1);
    g.fillRect(size / 2 + r * 0.4, size / 2 - 3, r * 1.1, 6);

    // Small directional notch
    g.fillStyle(0x0b0b12, 0.7);
    g.fillCircle(size / 2 - r * 0.3, size / 2, 3);

    g.generateTexture('player', size, size);
    g.destroy();
  }

  makeEnemyTexture() {
    const r = ENEMY.radius;
    const size = r * 3;
    const g = this.add.graphics();
    // Outer rim
    g.fillStyle(COLORS.enemyDark, 1);
    g.fillCircle(size / 2, size / 2, r);
    // Inner body
    g.fillStyle(COLORS.enemy, 1);
    g.fillCircle(size / 2, size / 2, r - 3);
    // Eyes / menace
    g.fillStyle(0xffffff, 1);
    g.fillCircle(size / 2 - 4, size / 2 - 2, 2);
    g.fillCircle(size / 2 + 4, size / 2 - 2, 2);
    g.fillStyle(0x000000, 1);
    g.fillCircle(size / 2 - 4, size / 2 - 2, 1);
    g.fillCircle(size / 2 + 4, size / 2 - 2, 1);

    g.generateTexture('enemy', size, size);
    g.destroy();
  }

  makeBulletTexture() {
    const r = BULLET.radius;
    const w = r * 5;
    const h = r * 2;
    const g = this.add.graphics();
    g.fillStyle(COLORS.bullet, 1);
    g.fillRoundedRect(0, 0, w, h, h / 2);
    g.fillStyle(0xffffff, 0.7);
    g.fillRoundedRect(w * 0.6, h * 0.2, w * 0.35, h * 0.6, h / 4);

    g.generateTexture('bullet', w, h);
    g.destroy();
  }

  makeParticleTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }

  makeMuzzleFlashTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xfff36b, 1);
    g.fillCircle(10, 10, 10);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(10, 10, 5);
    g.generateTexture('muzzle', 20, 20);
    g.destroy();
  }

  makeFloorTileTexture() {
    const size = 64;
    const g = this.add.graphics();
    g.fillStyle(COLORS.bg, 1);
    g.fillRect(0, 0, size, size);
    g.lineStyle(1, COLORS.bgGrid, 1);
    g.strokeRect(0.5, 0.5, size - 1, size - 1);
    // subtle inner cross
    g.lineStyle(1, 0x1c1c38, 0.7);
    g.beginPath();
    g.moveTo(size / 2, 8);
    g.lineTo(size / 2, size - 8);
    g.moveTo(8, size / 2);
    g.lineTo(size - 8, size / 2);
    g.strokePath();
    g.generateTexture('floor', size, size);
    g.destroy();
  }
}
