import Phaser from 'phaser';
import { BULLET } from '../config/constants.js';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');
    this.lifetime = 0;
  }

  fire(x, y, angle) {
    this.enableBody(true, x, y, true, true);
    this.setActive(true).setVisible(true);
    this.rotation = angle;
    this.body.setVelocity(Math.cos(angle) * BULLET.speed, Math.sin(angle) * BULLET.speed);
    this.body.setSize(BULLET.radius * 4, BULLET.radius * 2);
    this.lifetime = BULLET.lifetimeMs;
  }

  update(time, delta) {
    this.lifetime -= delta;
    if (this.lifetime <= 0) {
      this.kill();
    }
  }

  kill() {
    this.disableBody(true, true);
  }
}
