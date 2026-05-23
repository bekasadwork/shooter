import Phaser from 'phaser';

export default class CoverBlock extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, w, h) {
    super(scene, x, y, 'cover-block');
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDisplaySize(w, h);
    this.refreshBody();
  }
}
