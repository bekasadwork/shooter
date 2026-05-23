import Phaser from 'phaser';
import { PLAYER, BULLET, TANK, POWERUP } from '../config/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tank-hull-player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const bodyR = Math.min(TANK.hullW, TANK.hullH) / 2;
    this.body.setCircle(bodyR, this.width / 2 - bodyR, this.height / 2 - bodyR);
    this.body.setCollideWorldBounds(true);

    this.turret = scene.add.image(x, y, 'tank-turret-player').setDepth(this.depth + 1);

    this.shieldRing = scene.add.image(x, y, 'shield-ring').setDepth(this.depth + 2).setVisible(false);

    this.hp = PLAYER.maxHp;
    this.maxHp = PLAYER.maxHp;
    this.lastShotAt = 0;
    this.invulnUntil = 0;
    this.tripleUntil = 0;
    this.shieldUntil = 0;
    this.alive = true;
    this.hullAngle = 0;

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
    if (!this.alive) {
      this.turret.setPosition(this.x, this.y);
      this.shieldRing.setPosition(this.x, this.y).setVisible(false);
      return;
    }

    let vx = 0;
    let vy = 0;
    if (this.keys.left.isDown || this.keys.a.isDown) vx -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) vx += 1;
    if (this.keys.up.isDown || this.keys.w.isDown) vy -= 1;
    if (this.keys.down.isDown || this.keys.s.isDown) vy += 1;

    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      const len = Math.hypot(vx, vy);
      vx = (vx / len) * PLAYER.speed;
      vy = (vy / len) * PLAYER.speed;
      const target = Math.atan2(vy, vx);
      this.hullAngle = Phaser.Math.Angle.RotateTo(
        this.hullAngle,
        target,
        TANK.turnRateRad * (delta / 1000)
      );
    }
    this.body.setVelocity(vx, vy);
    this.rotation = this.hullAngle;

    const aimAngle = Phaser.Math.Angle.Between(this.x, this.y, pointerWorld.x, pointerWorld.y);
    this.turret.setPosition(this.x, this.y);
    this.turret.setRotation(aimAngle);

    if (time < this.shieldUntil) {
      this.shieldRing.setVisible(true).setPosition(this.x, this.y);
      this.shieldRing.setAlpha(0.55 + 0.35 * Math.sin(time * 0.012));
    } else {
      this.shieldRing.setVisible(false);
    }

    if (time < this.invulnUntil) {
      this.alpha = 0.4 + 0.4 * Math.sin(time * 0.04);
      this.turret.alpha = this.alpha;
    } else {
      this.alpha = 1;
      this.turret.alpha = 1;
    }
  }

  tryShoot(time, pointerWorld) {
    if (!this.alive) return null;
    if (time - this.lastShotAt < PLAYER.fireRateMs) return null;
    this.lastShotAt = time;

    const aimAngle = Phaser.Math.Angle.Between(this.x, this.y, pointerWorld.x, pointerWorld.y);
    const muzzleDist = TANK.turretW / 2 + TANK.barrelLen + 2;
    const baseX = this.x + Math.cos(aimAngle) * muzzleDist;
    const baseY = this.y + Math.sin(aimAngle) * muzzleDist;

    const flash = this.scene.add.image(baseX, baseY, 'muzzle').setBlendMode(Phaser.BlendModes.ADD).setScale(0.8);
    this.scene.tweens.add({
      targets: flash,
      alpha: { from: 1, to: 0 },
      scale: { from: 0.8, to: 1.4 },
      duration: 90,
      onComplete: () => flash.destroy(),
    });

    if (time < this.tripleUntil) {
      const s = POWERUP.tripleSpreadRad;
      return {
        shots: [
          { x: baseX, y: baseY, angle: aimAngle - s },
          { x: baseX, y: baseY, angle: aimAngle },
          { x: baseX, y: baseY, angle: aimAngle + s },
        ],
      };
    }
    return { shots: [{ x: baseX, y: baseY, angle: aimAngle }] };
  }

  takeDamage(amount, time) {
    if (!this.alive) return false;
    if (time < this.shieldUntil) {
      this.scene.cameras.main.shake(60, 0.003);
      return false;
    }
    if (time < this.invulnUntil) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnUntil = time + PLAYER.invulnMs;
    this.scene.cameras.main.shake(120, 0.006);
    if (this.hp === 0) {
      this.alive = false;
      this.body.setVelocity(0, 0);
    }
    return true;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  activateTriple(time, durationMs) {
    this.tripleUntil = time + durationMs;
  }

  activateShield(time, durationMs) {
    this.shieldUntil = time + durationMs;
  }

  destroy(fromScene) {
    if (this.turret) this.turret.destroy();
    if (this.shieldRing) this.shieldRing.destroy();
    super.destroy(fromScene);
  }
}
