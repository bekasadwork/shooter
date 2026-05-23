import Phaser from 'phaser';
import { ENEMY } from '../config/constants.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCircle(ENEMY.radius, this.width / 2 - ENEMY.radius, this.height / 2 - ENEMY.radius);
    this.hp = ENEMY.baseHp;
    this.maxHp = ENEMY.baseHp;
    this.speed = ENEMY.baseSpeed;
    this.alive = true;
  }

  configure({ hp, speed }) {
    this.hp = hp;
    this.maxHp = hp;
    this.speed = speed;
  }

  update(time, delta, target) {
    if (!this.alive || !target || !target.alive) {
      this.body.setVelocity(0, 0);
      return;
    }
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.rotation = angle + Math.PI / 2; // face the player (eyes up)
    this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
  }

  takeDamage(amount) {
    if (!this.alive) return false;
    this.hp -= amount;
    // Hit flash
    this.scene.tweens.killTweensOf(this);
    this.setTint(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (this.active) this.clearTint();
    });
    return this.hp <= 0;
  }

  die() {
    this.alive = false;
    this.disableBody(true, true);
  }
}
