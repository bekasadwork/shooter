import Phaser from 'phaser';
import { COLORS, PLAYER, ENEMY, BULLET, TANK, COVER, POWERUP } from '../config/constants.js';

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
    this.makeTankHullTexture('tank-hull-player', COLORS.player, 0x0f2a2a);
    this.makeTankHullTexture('tank-hull-enemy', COLORS.enemy, 0x331017);
    this.makeTankTurretTexture('tank-turret-player', COLORS.player);
    this.makeTankTurretTexture('tank-turret-enemy', COLORS.enemy);
    this.makeCoverBlockTexture();
    this.makePickupTextures();
    this.makeShieldRingTexture();
    this.makeSparkTexture();
  }

  makeTankHullTexture(key, fill, dark) {
    const w = TANK.hullW;
    const h = TANK.hullH + 8;
    const g = this.add.graphics();
    g.fillStyle(dark, 1);
    g.fillRect(0, 0, w, 6);
    g.fillRect(0, h - 6, w, 6);
    g.fillStyle(0x000000, 0.4);
    for (let x = 2; x < w - 2; x += 5) {
      g.fillRect(x, 1, 2, 4);
      g.fillRect(x, h - 5, 2, 4);
    }
    g.fillStyle(fill, 1);
    g.fillRoundedRect(2, 6, w - 4, h - 12, 3);
    g.lineStyle(1, 0xffffff, 0.5);
    g.strokeRoundedRect(2, 6, w - 4, h - 12, 3);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  makeTankTurretTexture(key, fill) {
    const w = TANK.turretW + TANK.barrelLen + 4;
    const h = TANK.turretH;
    const g = this.add.graphics();
    g.fillStyle(fill, 1);
    g.fillCircle(TANK.turretW / 2 + 2, h / 2, TANK.turretW / 2 + 1);
    g.lineStyle(1, 0xffffff, 0.6);
    g.strokeCircle(TANK.turretW / 2 + 2, h / 2, TANK.turretW / 2 + 1);
    g.fillStyle(0xffffff, 1);
    g.fillRect(TANK.turretW + 2, h / 2 - 2, TANK.barrelLen, 4);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  makeCoverBlockTexture() {
    const w = 32;
    const h = 32;
    const g = this.add.graphics();
    g.fillStyle(COVER.fill, 1);
    g.fillRoundedRect(0, 0, w, h, 4);
    g.lineStyle(2, COVER.edge, COVER.edgeAlpha);
    g.strokeRoundedRect(1, 1, w - 2, h - 2, 4);
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(5, 5, 1.5);
    g.fillCircle(w - 5, 5, 1.5);
    g.fillCircle(5, h - 5, 1.5);
    g.fillCircle(w - 5, h - 5, 1.5);
    g.generateTexture('cover-block', w, h);
    g.destroy();
  }

  makePickupTextures() {
    const size = POWERUP.iconSize;

    let g = this.add.graphics();
    g.fillStyle(0x002a14, 1);
    g.fillCircle(size / 2, size / 2, size / 2);
    g.fillStyle(0x4dff88, 1);
    g.fillRect(size / 2 - 8, size / 2 - 2, 16, 4);
    g.fillRect(size / 2 - 2, size / 2 - 8, 4, 16);
    g.lineStyle(1, 0xffffff, 0.8);
    g.strokeCircle(size / 2, size / 2, size / 2 - 1);
    g.generateTexture('pickup-health', size, size);
    g.destroy();

    g = this.add.graphics();
    g.fillStyle(0x331a00, 1);
    g.fillCircle(size / 2, size / 2, size / 2);
    g.lineStyle(2, 0xffa040, 1);
    for (let i = 0; i < 3; i++) {
      const dx = -6 + i * 6;
      g.beginPath();
      g.moveTo(size / 2 - 5 + dx, size / 2 + 4);
      g.lineTo(size / 2 + dx, size / 2 - 4);
      g.lineTo(size / 2 + 5 + dx, size / 2 + 4);
      g.strokePath();
    }
    g.lineStyle(1, 0xffffff, 0.8);
    g.strokeCircle(size / 2, size / 2, size / 2 - 1);
    g.generateTexture('pickup-triple', size, size);
    g.destroy();

    g = this.add.graphics();
    g.fillStyle(0x001a33, 1);
    g.fillCircle(size / 2, size / 2, size / 2);
    g.lineStyle(3, 0x4da6ff, 1);
    g.strokeCircle(size / 2, size / 2, size / 2 - 4);
    g.lineStyle(1, 0xffffff, 0.9);
    g.strokeCircle(size / 2, size / 2, size / 2 - 1);
    g.generateTexture('pickup-shield', size, size);
    g.destroy();
  }

  makeShieldRingTexture() {
    const size = PLAYER.radius * 4;
    const g = this.add.graphics();
    g.lineStyle(3, 0x4da6ff, 0.9);
    g.strokeCircle(size / 2, size / 2, size / 2 - 2);
    g.lineStyle(1, 0xffffff, 0.6);
    g.strokeCircle(size / 2, size / 2, size / 2 - 5);
    g.generateTexture('shield-ring', size, size);
    g.destroy();
  }

  makeSparkTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x00ffe0, 1);
    g.fillCircle(3, 3, 3);
    g.generateTexture('spark', 6, 6);
    g.destroy();
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
