import Phaser from 'phaser';
import { POWERUP } from '../config/constants.js';

const TEXTURE_BY_TYPE = {
  health: 'pickup-health',
  triple: 'pickup-triple',
  shield: 'pickup-shield',
};

const LABEL_BY_TYPE = {
  health: `+${POWERUP.healthAmount} HP`,
  triple: 'TRIPLE!',
  shield: 'SHIELD!',
};

const COLOR_BY_TYPE = {
  health: '#4dff88',
  triple: '#ffa040',
  shield: '#4da6ff',
};

export default class Powerup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, TEXTURE_BY_TYPE[type]);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setCircle(POWERUP.iconSize / 2, 0, 0);
    this.type = type;

    this.setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: this,
      y: y - 5,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 6000,
      repeat: -1,
    });
  }

  applyTo(player, time) {
    if (this.type === 'health') {
      player.heal(POWERUP.healthAmount);
    } else if (this.type === 'triple') {
      player.activateTriple(time, POWERUP.tripleMs);
    } else if (this.type === 'shield') {
      player.activateShield(time, POWERUP.shieldMs);
    }
    return { label: LABEL_BY_TYPE[this.type], color: COLOR_BY_TYPE[this.type] };
  }
}
