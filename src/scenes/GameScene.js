import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Bullet from '../entities/Bullet.js';
import CoverBlock from '../entities/CoverBlock.js';
import { LEVELS, TOTAL_LEVELS } from '../config/levels.js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, ENEMY, BULLET } from '../config/constants.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.levelIndex = data.levelIndex ?? 0;
    this.carryScore = data.score ?? 0;
  }

  create() {
    const level = LEVELS[this.levelIndex];
    this.level = level;
    this.kills = 0;
    this.score = this.carryScore;
    this.spawnsRemaining = level.killsToAdvance;
    this.levelComplete = false;

    // Tiled floor background
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'floor').setOrigin(0, 0).setAlpha(0.8);

    // World bounds
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Cover blocks
    this.coverGroup = this.physics.add.staticGroup({ classType: CoverBlock });
    for (const def of level.coverBlocks || []) {
      const block = new CoverBlock(this, def.x, def.y, def.w, def.h);
      this.coverGroup.add(block);
    }

    // Player
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Bullet group (pooled)
    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 64,
      runChildUpdate: true,
    });

    // Enemy group
    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: false,
    });

    // Particle manager for death bursts
    this.deathEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 80, max: 220 },
      lifespan: 350,
      scale: { start: 1, end: 0 },
      tint: [0xff3860, 0xfff36b, 0xffffff],
      blendMode: 'ADD',
      emitting: false,
    });

    // Collisions
    this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitsEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemyHitsPlayer, null, this);
    this.physics.add.collider(this.player, this.coverGroup);
    this.physics.add.collider(this.enemies, this.coverGroup);

    // Input: shoot
    this.input.on('pointerdown', this.fireBullet, this);
    this.input.on('pointermove', () => {}); // ensure pointer is tracked

    // Spawn loop
    this.spawnTimer = this.time.addEvent({
      delay: level.spawnIntervalMs,
      loop: true,
      callback: this.trySpawnEnemy,
      callbackScope: this,
    });

    // HUD overlay
    this.scene.launch('HUD', { gameScene: this });

    // Cleanup on shutdown
    this.events.once('shutdown', this.onShutdown, this);

    // Fade in
    this.cameras.main.fadeIn(250, 11, 11, 18);
    this.showLevelBanner();
  }

  showLevelBanner() {
    const banner = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `LEVEL ${this.level.number}`, {
        fontFamily: 'monospace',
        fontSize: '56px',
        color: '#00ffe0',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0);
    const subtitle = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, this.level.name, {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#e6e6f0',
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({
      targets: [banner, subtitle],
      alpha: { from: 0, to: 1 },
      duration: 350,
      yoyo: true,
      hold: 700,
      onComplete: () => {
        banner.destroy();
        subtitle.destroy();
      },
    });
  }

  trySpawnEnemy() {
    if (this.levelComplete || !this.player.alive) return;
    if (this.spawnsRemaining <= 0) return;
    if (this.enemies.countActive(true) >= this.level.maxConcurrent) return;

    const { x, y } = this.randomEdgeSpawn();
    let enemy = this.enemies.get(x, y, 'enemy');
    if (!enemy) return;
    enemy.setActive(true).setVisible(true);
    enemy.alive = true;
    if (enemy.body) {
      enemy.body.enable = true;
      enemy.body.reset(x, y);
    }
    enemy.configure({
      hp: Math.round(ENEMY.baseHp * this.level.enemyHpMult),
      speed: ENEMY.baseSpeed * this.level.enemySpeedMult,
    });
    this.spawnsRemaining -= 1;
  }

  randomEdgeSpawn() {
    const margin = 30;
    const side = Phaser.Math.Between(0, 3);
    if (side === 0) return { x: Phaser.Math.Between(0, GAME_WIDTH), y: -margin };
    if (side === 1) return { x: GAME_WIDTH + margin, y: Phaser.Math.Between(0, GAME_HEIGHT) };
    if (side === 2) return { x: Phaser.Math.Between(0, GAME_WIDTH), y: GAME_HEIGHT + margin };
    return { x: -margin, y: Phaser.Math.Between(0, GAME_HEIGHT) };
  }

  fireBullet(pointer) {
    if (pointer.button !== 0) return; // left click only
    const result = this.player.tryShoot(this.time.now, pointer.positionToCamera(this.cameras.main));
    if (!result) return;
    for (const shot of result.shots) {
      const bullet = this.bullets.get(shot.x, shot.y, 'bullet');
      if (!bullet) continue;
      bullet.fire(shot.x, shot.y, shot.angle);
    }
  }

  onBulletHitsEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active || !enemy.alive) return;
    bullet.kill();
    const killed = enemy.takeDamage(BULLET.damage);
    if (killed) {
      this.deathEmitter.emitParticleAt(enemy.x, enemy.y, 14);
      enemy.die();
      this.kills += 1;
      this.score += 10;
      this.checkLevelComplete();
    }
  }

  onEnemyHitsPlayer(player, enemy) {
    if (!enemy.alive) return;
    const took = player.takeDamage(ENEMY.contactDamage, this.time.now);
    if (took) {
      this.deathEmitter.emitParticleAt(enemy.x, enemy.y, 8);
      enemy.die();
      if (!player.alive) {
        this.gameOver();
      }
    }
  }

  checkLevelComplete() {
    if (this.levelComplete) return;
    if (this.kills < this.level.killsToAdvance) return;
    this.levelComplete = true;
    this.spawnTimer.remove(false);
    // Clear remaining enemies dramatically
    this.enemies.children.each((e) => {
      if (e.active && e.alive) {
        this.deathEmitter.emitParticleAt(e.x, e.y, 6);
        e.die();
      }
    });
    this.time.delayedCall(500, () => {
      this.cameras.main.fadeOut(300, 11, 11, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (this.levelIndex + 1 >= TOTAL_LEVELS) {
          this.scene.start('Win', { score: this.score });
        } else {
          this.scene.start('LevelComplete', {
            justFinished: this.level.number,
            nextIndex: this.levelIndex + 1,
            score: this.score,
          });
        }
      });
    });
  }

  gameOver() {
    this.spawnTimer.remove(false);
    this.time.delayedCall(700, () => {
      this.cameras.main.fadeOut(400, 11, 11, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOver', {
          levelReached: this.level.number,
          score: this.score,
        });
      });
    });
  }

  onShutdown() {
    if (this.scene.isActive('HUD')) this.scene.stop('HUD');
    this.input.off('pointerdown', this.fireBullet, this);
  }

  update(time, delta) {
    const pointer = this.input.activePointer.positionToCamera(this.cameras.main);
    this.player.update(time, delta, pointer);

    // Continuous fire if left mouse is currently held
    const ap = this.input.activePointer;
    if (ap.leftButtonDown()) {
      const aim = ap.positionToCamera(this.cameras.main);
      const result = this.player.tryShoot(this.time.now, aim);
      if (result) {
        for (const shot of result.shots) {
          const bullet = this.bullets.get(shot.x, shot.y, 'bullet');
          if (bullet) bullet.fire(shot.x, shot.y, shot.angle);
        }
      }
    }

    this.enemies.children.each((enemy) => {
      if (enemy.active && enemy.alive) enemy.update(time, delta, this.player);
    });

    // World-bound bullet cleanup
    this.bullets.children.each((b) => {
      if (!b.active) return;
      if (b.x < -20 || b.x > GAME_WIDTH + 20 || b.y < -20 || b.y > GAME_HEIGHT + 20) {
        b.kill();
      }
    });
  }
}
