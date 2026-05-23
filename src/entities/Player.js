import Phaser from 'phaser';
import { PLAYER, BULLET } from '../config/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCircle(PLAYER.radius, this.width / 2 - PLAYER.radius, this.height / 2 - PLAYER.radius);
    this.body.setCollideWorldBounds(true);

    this.hp = PLAYER.maxHp;
    this.maxHp = PLAYER.maxHp;
    this.lastShotAt = 0;
    this.invulnUntil = 0;
    this.alive = true;

    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  update(time, delta, pointerWorld) {
    if (!this.alive) return;

    // Movement (8-directional, normalized)
    let vx = 0;
    let vy = 0;
    if (this.keys.left.isDown || this.keys.a.isDown) vx -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) vx += 1;
    if (this.keys.up.isDown || this.keys.w.isDown) vy -= 1;
    if (this.keys.down.isDown || this.keys.s.isDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      vx = (vx / len) * PLAYER.speed;
      vy = (vy / len) * PLAYER.speed;
    }
    this.body.setVelocity(vx, vy);

    // Aim toward pointer
    const angle = Phaser.Math.Angle.Between(this.x, this.y, pointerWorld.x, pointerWorld.y);
    this.rotation = angle;

    // Invuln flash
    if (time < this.invulnUntil) {
      this.alpha = 0.4 + 0.4 * Math.sin(time * 0.04);
    } else {
      this.alpha = 1;
    }
  }

  tryShoot(time, pointerWorld) {
    if (!this.alive) return null;
    if (time - this.lastShotAt < PLAYER.fireRateMs) return null;
    this.lastShotAt = time;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, pointerWorld.x, pointerWorld.y);
    const muzzleDist = PLAYER.radius + 14;
    const mx = this.x + Math.cos(angle) * muzzleDist;
    const my = this.y + Math.sin(angle) * muzzleDist;

    // Muzzle flash
    const flash = this.scene.add.image(mx, my, 'muzzle').setBlendMode(Phaser.BlendModes.ADD).setScale(0.8);
    this.scene.tweens.add({
      targets: flash,
      alpha: { from: 1, to: 0 },
      scale: { from: 0.8, to: 1.4 },
      duration: 90,
      onComplete: () => flash.destroy(),
    });

    return { x: mx, y: my, angle };
  }

  takeDamage(amount, time) {
    if (!this.alive || time < this.invulnUntil) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnUntil = time + PLAYER.invulnMs;
    this.scene.cameras.main.shake(120, 0.006);
    if (this.hp === 0) {
      this.alive = false;
      this.body.setVelocity(0, 0);
    }
    return true;
  }
}
