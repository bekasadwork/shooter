import Phaser from 'phaser';
import { ENEMY, TANK } from '../config/constants.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tank-hull-enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const bodyR = Math.min(TANK.hullW, TANK.hullH) / 2;
    this.body.setCircle(bodyR, this.width / 2 - bodyR, this.height / 2 - bodyR);

    this.turret = scene.add.image(x, y, 'tank-turret-enemy').setDepth(this.depth + 1);

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
      this.turret.setPosition(this.x, this.y);
      return;
    }
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.rotation = angle;
    this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    this.turret.setPosition(this.x, this.y).setRotation(angle);
    this.turret.setVisible(this.visible);
  }

  takeDamage(amount) {
    if (!this.alive) return false;
    this.hp -= amount;
    this.scene.tweens.killTweensOf(this);
    this.setTint(0xffffff);
    if (this.turret) this.turret.setTint(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (this.active) {
        this.clearTint();
        if (this.turret) this.turret.clearTint();
      }
    });
    return this.hp <= 0;
  }

  die() {
    this.alive = false;
    if (this.turret) this.turret.setVisible(false);
    this.disableBody(true, true);
  }

  destroy(fromScene) {
    if (this.turret) this.turret.destroy();
    super.destroy(fromScene);
  }
}
