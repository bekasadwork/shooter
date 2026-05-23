# Tanks, Cover Blocks, and Powerups — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (we are running inline in the current session).

**Goal:** Upgrade the Neon Shooter from circle combatants in an empty arena to two-axis tanks fighting around scattered cover blocks, with chance-dropped powerups.

**Architecture:** Procedurally drawn tank sprites (hull + child turret), Phaser static physics group for cover blocks with collide-only-with-bullets-die behavior, kinematic Powerup sprites in a group with player overlap pickup. All existing scenes/files extend in place; two new entity files added.

**Tech Stack:** Phaser 3, Vite, vanilla JS modules.

**Verification model:** This is a real-time game with no test framework. Each task ends with a visual/behavioral browser check at `http://127.0.0.1:5173/` followed by a commit. The dev server has HMR — reloads are automatic. Watch the browser console for errors.

---

### Task 1: Add new constants and per-level cover layouts

**Files:**
- Modify: `src/config/constants.js`
- Modify: `src/config/levels.js`

- [ ] **Step 1: Append `TANK`, `COVER`, `POWERUP` blocks to `src/config/constants.js`**

Add at the end of the file:

```js
export const TANK = {
  hullW: 36,
  hullH: 28,
  turretW: 14,
  turretH: 22,
  barrelLen: 18,
  turnRateRad: 6, // hull rotation lerp speed (radians per second)
};

export const COVER = {
  fill: 0x1c1c38,
  edge: 0x00ffe0,
  edgeAlpha: 0.9,
};

export const POWERUP = {
  dropChance: 0.12,
  healthAmount: 30,
  tripleMs: 10000,
  shieldMs: 8000,
  tripleSpreadRad: Math.PI / 18, // ~10 degrees
  iconSize: 22,
};
```

- [ ] **Step 2: Add `coverBlocks` to each level in `src/config/levels.js`**

Each level object gets a `coverBlocks` array. Replace the file body so each entry includes its layout. Center coords in 960x640 world.

Level 1 — corner cover, simple:
```js
coverBlocks: [
  { x: 240, y: 180, w: 100, h: 24 },
  { x: 720, y: 180, w: 100, h: 24 },
  { x: 240, y: 460, w: 100, h: 24 },
  { x: 720, y: 460, w: 100, h: 24 },
  { x: 480, y: 320, w: 32, h: 110 },
],
```

Level 2 — central spine + scattered:
```js
coverBlocks: [
  { x: 480, y: 320, w: 24, h: 220 },
  { x: 200, y: 320, w: 90, h: 28 },
  { x: 760, y: 320, w: 90, h: 28 },
  { x: 350, y: 140, w: 60, h: 24 },
  { x: 610, y: 500, w: 60, h: 24 },
],
```

Level 3 — pinwheel chaos:
```js
coverBlocks: [
  { x: 320, y: 200, w: 24, h: 100 },
  { x: 640, y: 440, w: 24, h: 100 },
  { x: 220, y: 420, w: 100, h: 24 },
  { x: 740, y: 220, w: 100, h: 24 },
  { x: 480, y: 100, w: 60, h: 24 },
  { x: 480, y: 540, w: 60, h: 24 },
  { x: 480, y: 320, w: 50, h: 50 },
],
```

- [ ] **Step 3: Verify Vite serves the modified files**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/src/config/constants.js`
Expected: `200`

- [ ] **Step 4: Commit**

```bash
git add src/config/constants.js src/config/levels.js
git commit -m "feat: add tank/cover/powerup constants and per-level cover layouts"
```

---

### Task 2: Generate new procedural textures in BootScene

**Files:**
- Modify: `src/scenes/BootScene.js`

- [ ] **Step 1: Import new constants**

At the top of `src/scenes/BootScene.js`, change the import line to:
```js
import { COLORS, PLAYER, ENEMY, BULLET, TANK, COVER, POWERUP } from '../config/constants.js';
```

- [ ] **Step 2: Add texture generator methods**

Add these methods to the `BootScene` class (alongside the existing `make*Texture` methods):

```js
makeTankHullTexture(key, fill, dark) {
  const w = TANK.hullW;
  const h = TANK.hullH + 8; // padding for treads
  const g = this.add.graphics();
  // treads (top and bottom)
  g.fillStyle(dark, 1);
  g.fillRect(0, 0, w, 6);
  g.fillRect(0, h - 6, w, 6);
  // tread cleats
  g.fillStyle(0x000000, 0.4);
  for (let x = 2; x < w - 2; x += 5) {
    g.fillRect(x, 1, 2, 4);
    g.fillRect(x, h - 5, 2, 4);
  }
  // hull body
  g.fillStyle(fill, 1);
  g.fillRoundedRect(2, 6, w - 4, h - 12, 3);
  g.lineStyle(1, 0xffffff, 0.5);
  g.strokeRoundedRect(2, 6, w - 4, h - 12, 3);
  g.generateTexture(key, w, h);
  g.destroy();
},

makeTankTurretTexture(key, fill) {
  const w = TANK.turretW + TANK.barrelLen + 4;
  const h = TANK.turretH;
  const g = this.add.graphics();
  // turret body (left side)
  g.fillStyle(fill, 1);
  g.fillCircle(TANK.turretW / 2 + 2, h / 2, TANK.turretW / 2 + 1);
  g.lineStyle(1, 0xffffff, 0.6);
  g.strokeCircle(TANK.turretW / 2 + 2, h / 2, TANK.turretW / 2 + 1);
  // barrel sticks out to the right (tank's "forward")
  g.fillStyle(0xffffff, 1);
  g.fillRect(TANK.turretW + 2, h / 2 - 2, TANK.barrelLen, 4);
  g.generateTexture(key, w, h);
  g.destroy();
},

makeCoverBlockTexture() {
  const w = 32;
  const h = 32;
  const g = this.add.graphics();
  g.fillStyle(COVER.fill, 1);
  g.fillRoundedRect(0, 0, w, h, 4);
  g.lineStyle(2, COVER.edge, COVER.edgeAlpha);
  g.strokeRoundedRect(1, 1, w - 2, h - 2, 4);
  // subtle rivet dots
  g.fillStyle(0x000000, 0.3);
  g.fillCircle(5, 5, 1.5);
  g.fillCircle(w - 5, 5, 1.5);
  g.fillCircle(5, h - 5, 1.5);
  g.fillCircle(w - 5, h - 5, 1.5);
  g.generateTexture('cover-block', w, h);
  g.destroy();
},

makePickupTextures() {
  const size = POWERUP.iconSize;

  // Health: green plus sign
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

  // Triple: orange chevron / three arrows
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

  // Shield: blue ring with cross
  g = this.add.graphics();
  g.fillStyle(0x001a33, 1);
  g.fillCircle(size / 2, size / 2, size / 2);
  g.lineStyle(3, 0x4da6ff, 1);
  g.strokeCircle(size / 2, size / 2, size / 2 - 4);
  g.lineStyle(1, 0xffffff, 0.9);
  g.strokeCircle(size / 2, size / 2, size / 2 - 1);
  g.generateTexture('pickup-shield', size, size);
  g.destroy();
},

makeShieldRingTexture() {
  const size = PLAYER.radius * 4;
  const g = this.add.graphics();
  g.lineStyle(3, 0x4da6ff, 0.9);
  g.strokeCircle(size / 2, size / 2, size / 2 - 2);
  g.lineStyle(1, 0xffffff, 0.6);
  g.strokeCircle(size / 2, size / 2, size / 2 - 5);
  g.generateTexture('shield-ring', size, size);
  g.destroy();
},

makeSparkTexture() {
  const g = this.add.graphics();
  g.fillStyle(0x00ffe0, 1);
  g.fillCircle(3, 3, 3);
  g.generateTexture('spark', 6, 6);
  g.destroy();
},
```

- [ ] **Step 3: Call the new generators from `generateTextures`**

Replace the `generateTextures()` method body so it reads:
```js
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
```

- [ ] **Step 4: Verify in browser**

Reload `http://127.0.0.1:5173/`. The menu still works (these textures aren't visible yet, but generating them must not crash). Open browser DevTools — no errors in console.

- [ ] **Step 5: Commit**

```bash
git add src/scenes/BootScene.js
git commit -m "feat: generate tank, cover, pickup, and shield-ring textures"
```

---

### Task 3: Convert Player to a two-axis tank

**Files:**
- Modify: `src/entities/Player.js`

- [ ] **Step 1: Replace `src/entities/Player.js` with the tank version**

Full file contents:

```js
import Phaser from 'phaser';
import { PLAYER, BULLET, TANK, POWERUP } from '../config/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tank-hull-player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Circular body roughly matching hull half-width
    const bodyR = Math.min(TANK.hullW, TANK.hullH) / 2;
    this.body.setCircle(bodyR, this.width / 2 - bodyR, this.height / 2 - bodyR);
    this.body.setCollideWorldBounds(true);

    // Turret sits on top, follows the mouse independently
    this.turret = scene.add.image(x, y, 'tank-turret-player').setDepth(this.depth + 1);

    // Optional shield ring (toggled on by buff)
    this.shieldRing = scene.add.image(x, y, 'shield-ring').setDepth(this.depth + 2).setVisible(false);

    this.hp = PLAYER.maxHp;
    this.maxHp = PLAYER.maxHp;
    this.lastShotAt = 0;
    this.invulnUntil = 0;
    this.tripleUntil = 0;
    this.shieldUntil = 0;
    this.alive = true;
    this.hullAngle = 0; // current hull rotation in radians

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

    // Movement (8-directional, normalized)
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
      // Hull rotates smoothly toward movement direction
      const target = Math.atan2(vy, vx);
      this.hullAngle = Phaser.Math.Angle.RotateTo(
        this.hullAngle,
        target,
        TANK.turnRateRad * (delta / 1000)
      );
    }
    this.body.setVelocity(vx, vy);
    this.rotation = this.hullAngle;

    // Turret follows mouse, positioned at hull origin
    const aimAngle = Phaser.Math.Angle.Between(this.x, this.y, pointerWorld.x, pointerWorld.y);
    this.turret.setPosition(this.x, this.y);
    this.turret.setRotation(aimAngle);

    // Shield ring visibility + position
    if (time < this.shieldUntil) {
      this.shieldRing.setVisible(true).setPosition(this.x, this.y);
      this.shieldRing.setAlpha(0.55 + 0.35 * Math.sin(time * 0.012));
    } else {
      this.shieldRing.setVisible(false);
    }

    // Invuln visual flash
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

    // Muzzle flash
    const flash = this.scene.add.image(baseX, baseY, 'muzzle').setBlendMode(Phaser.BlendModes.ADD).setScale(0.8);
    this.scene.tweens.add({
      targets: flash,
      alpha: { from: 1, to: 0 },
      scale: { from: 0.8, to: 1.4 },
      duration: 90,
      onComplete: () => flash.destroy(),
    });

    // Triple shot when buff active
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
    // Shield blocks damage entirely
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
```

- [ ] **Step 2: Update GameScene to use the new `tryShoot` return shape**

In `src/scenes/GameScene.js`, the `fireBullet` method currently does:
```js
fireBullet(pointer) {
  if (pointer.button !== 0) return;
  const result = this.player.tryShoot(this.time.now, pointer.positionToCamera(this.cameras.main));
  if (!result) return;
  const bullet = this.bullets.get(result.x, result.y, 'bullet');
  if (!bullet) return;
  bullet.fire(result.x, result.y, result.angle);
},
```

Replace with:
```js
fireBullet(pointer) {
  if (pointer.button !== 0) return;
  const result = this.player.tryShoot(this.time.now, pointer.positionToCamera(this.cameras.main));
  if (!result) return;
  for (const shot of result.shots) {
    const bullet = this.bullets.get(shot.x, shot.y, 'bullet');
    if (!bullet) continue;
    bullet.fire(shot.x, shot.y, shot.angle);
  }
},
```

And the auto-fire block in `update()` (added earlier) — replace:
```js
if (ap.leftButtonDown()) {
  const aim = ap.positionToCamera(this.cameras.main);
  const result = this.player.tryShoot(this.time.now, aim);
  if (result) {
    const bullet = this.bullets.get(result.x, result.y, 'bullet');
    if (bullet) bullet.fire(result.x, result.y, result.angle);
  }
}
```

With:
```js
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
```

- [ ] **Step 3: Browser check**

Reload `http://127.0.0.1:5173/`. Start a game. Verify:
- Player is now a tank (hull rectangle with treads + turret circle + barrel).
- WASD moves; hull rotates smoothly to face movement direction.
- Mouse moves; turret rotates independently to follow cursor.
- Click fires from the tip of the barrel.
- No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/entities/Player.js src/scenes/GameScene.js
git commit -m "feat: convert player to two-axis tank (hull + turret)"
```

---

### Task 4: Convert Enemy to a tank

**Files:**
- Modify: `src/entities/Enemy.js`

- [ ] **Step 1: Replace `src/entities/Enemy.js`**

Full file:

```js
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
```

- [ ] **Step 2: Browser check**

Reload. Start a game. Enemies appear as red tanks with turrets pointing at the player. They chase as before. Bullets still kill them. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/entities/Enemy.js
git commit -m "feat: convert enemies to tank sprites with tracking turret"
```

---

### Task 5: Add CoverBlock entity and spawn per-level

**Files:**
- Create: `src/entities/CoverBlock.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Create `src/entities/CoverBlock.js`**

```js
import Phaser from 'phaser';

export default class CoverBlock extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, w, h) {
    super(scene, x, y, 'cover-block');
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.setDisplaySize(w, h);
    this.refreshBody();
  }
}
```

- [ ] **Step 2: Wire cover blocks into `GameScene`**

In `src/scenes/GameScene.js`, add the import at the top:
```js
import CoverBlock from '../entities/CoverBlock.js';
```

In `create()`, after the `physics.world.setBounds(...)` line and **before** creating the player, add:
```js
// Cover blocks
this.coverGroup = this.physics.add.staticGroup({ classType: CoverBlock });
for (const def of level.coverBlocks || []) {
  const block = new CoverBlock(this, def.x, def.y, def.w, def.h);
  this.coverGroup.add(block);
}
```

After the existing collision setup lines (after the two `physics.add.overlap` calls), add:
```js
this.physics.add.collider(this.player, this.coverGroup);
this.physics.add.collider(this.enemies, this.coverGroup);
```

- [ ] **Step 3: Browser check**

Reload. Each level should display its hand-designed cover layout. Walking into a block stops the player. Enemies bump into and slide around blocks. (Bullets pass through blocks for now — fixed in next task.)

- [ ] **Step 4: Commit**

```bash
git add src/entities/CoverBlock.js src/scenes/GameScene.js
git commit -m "feat: spawn cover blocks per level and collide with player/enemies"
```

---

### Task 6: Bullets are blocked by cover (with spark VFX)

**Files:**
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Add bullet × cover collider and spark emitter**

In `src/scenes/GameScene.js` `create()`, after the `this.deathEmitter = ...` block, add a second emitter for sparks:
```js
this.sparkEmitter = this.add.particles(0, 0, 'spark', {
  speed: { min: 60, max: 160 },
  lifespan: 250,
  scale: { start: 1, end: 0 },
  tint: [0x00ffe0, 0xffffff],
  blendMode: 'ADD',
  emitting: false,
});
```

After the existing colliders added in Task 5, add:
```js
this.physics.add.collider(this.bullets, this.coverGroup, this.onBulletHitsCover, null, this);
```

Add the method to the class:
```js
onBulletHitsCover(bullet, _block) {
  if (!bullet.active) return;
  this.sparkEmitter.emitParticleAt(bullet.x, bullet.y, 6);
  bullet.kill();
},
```

- [ ] **Step 2: Browser check**

Reload. Shoot at a cover block. Bullets despawn on impact and emit a cyan spark burst. Bullets still pass freely over open ground.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: bullets despawn against cover blocks with spark VFX"
```

---

### Task 7: Add Powerup entity

**Files:**
- Create: `src/entities/Powerup.js`

- [ ] **Step 1: Create `src/entities/Powerup.js`**

```js
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
    this.baseY = y;
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
```

- [ ] **Step 2: Commit (no spawn yet, just the entity)**

```bash
git add src/entities/Powerup.js
git commit -m "feat: add Powerup entity with bob/rotate animation and applyTo"
```

---

### Task 8: Drop powerups on enemy death and pick up

**Files:**
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Add imports and group**

In `src/scenes/GameScene.js`, add to the imports:
```js
import Powerup from '../entities/Powerup.js';
import { POWERUP } from '../config/constants.js';
```
(Update existing constants import line to include `POWERUP` if it's not already in the import list, which it isn't — add a new line.)

Actually the current constants import is `import { GAME_WIDTH, GAME_HEIGHT, COLORS, ENEMY, BULLET } from '../config/constants.js';`. Change it to:
```js
import { GAME_WIDTH, GAME_HEIGHT, COLORS, ENEMY, BULLET, POWERUP } from '../config/constants.js';
```

In `create()`, after the cover group setup, add the powerup group and overlap:
```js
this.powerups = this.physics.add.group({ classType: Powerup, runChildUpdate: false });
this.physics.add.overlap(this.player, this.powerups, this.onPickup, null, this);
```

- [ ] **Step 2: Drop on enemy death**

In `onBulletHitsEnemy`, immediately after the `enemy.die()` line, add:
```js
this.maybeDropPowerup(enemy.x, enemy.y);
```

Add the new methods to the class:
```js
maybeDropPowerup(x, y) {
  if (Math.random() >= POWERUP.dropChance) return;
  const types = ['health', 'triple', 'shield'];
  const type = types[Math.floor(Math.random() * types.length)];
  const p = new Powerup(this, x, y, type);
  this.powerups.add(p);
},

onPickup(_player, powerup) {
  if (!powerup.active) return;
  const result = powerup.applyTo(this.player, this.time.now);
  this.showFloatingText(powerup.x, powerup.y, result.label, result.color);
  powerup.destroy();
},

showFloatingText(x, y, label, color) {
  const txt = this.add.text(x, y - 10, label, {
    fontFamily: 'monospace',
    fontSize: '16px',
    color,
    stroke: '#000',
    strokeThickness: 3,
  }).setOrigin(0.5);
  this.tweens.add({
    targets: txt,
    y: y - 50,
    alpha: { from: 1, to: 0 },
    duration: 900,
    ease: 'Cubic.easeOut',
    onComplete: () => txt.destroy(),
  });
},
```

- [ ] **Step 3: Browser check**

Reload. Kill ~10 enemies. ~1–2 of them should drop a glowing icon. Walk over it. Floating colored text appears, and the effect applies (triple shot fires 3 bullets, shield ring appears, health restores). No errors.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: drop powerups on enemy death with pickup overlap and floating text"
```

---

### Task 9: HUD timers for active powerups

**Files:**
- Modify: `src/scenes/HUDScene.js`

- [ ] **Step 1: Add icon strip below HP bar**

Replace the entire `src/scenes/HUDScene.js` body with:

```js
import Phaser from 'phaser';
import { GAME_WIDTH, COLORS, POWERUP } from '../config/constants.js';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const padding = 16;
    const barWidth = 220;
    const barHeight = 16;

    this.add.text(padding, padding, 'HP', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#e6e6f0',
    });
    this.add.rectangle(padding + 30, padding + 7, barWidth, barHeight, 0x000000, 0.5).setOrigin(0, 0.5);
    this.hpBar = this.add
      .rectangle(padding + 30, padding + 7, barWidth, barHeight, COLORS.hudGood)
      .setOrigin(0, 0.5);

    // Powerup icon strip below HP bar
    const stripY = padding + 30;
    this.tripleIcon = this.add.image(padding + 10, stripY + 12, 'pickup-triple').setVisible(false);
    this.tripleBarBg = this.add.rectangle(padding + 28, stripY + 12, 60, 6, 0x000000, 0.5).setOrigin(0, 0.5).setVisible(false);
    this.tripleBar = this.add.rectangle(padding + 28, stripY + 12, 60, 6, 0xffa040).setOrigin(0, 0.5).setVisible(false);

    this.shieldIcon = this.add.image(padding + 10, stripY + 36, 'pickup-shield').setVisible(false);
    this.shieldBarBg = this.add.rectangle(padding + 28, stripY + 36, 60, 6, 0x000000, 0.5).setOrigin(0, 0.5).setVisible(false);
    this.shieldBar = this.add.rectangle(padding + 28, stripY + 36, 60, 6, 0x4da6ff).setOrigin(0, 0.5).setVisible(false);

    this.levelText = this.add.text(GAME_WIDTH / 2, padding, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#00ffe0',
    }).setOrigin(0.5, 0);

    this.killsText = this.add.text(GAME_WIDTH - padding, padding, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#e6e6f0',
    }).setOrigin(1, 0);

    this.scoreText = this.add.text(GAME_WIDTH - padding, padding + 22, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#fff36b',
    }).setOrigin(1, 0);

    this.hintText = this.add.text(GAME_WIDTH / 2, this.scale.height - 14,
      'WASD / arrows to move  •  mouse to aim  •  click to shoot', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#777799',
    }).setOrigin(0.5, 1);
  }

  update() {
    if (!this.gameScene || !this.gameScene.scene.isActive()) return;
    const player = this.gameScene.player;
    const hpPct = player ? player.hp / player.maxHp : 0;
    this.hpBar.width = 220 * hpPct;
    this.hpBar.fillColor = hpPct > 0.5 ? COLORS.hudGood : hpPct > 0.25 ? 0xffaa00 : COLORS.hudBad;

    const level = this.gameScene.level;
    this.levelText.setText(`LEVEL ${level.number}  —  ${level.name}`);
    const remaining = Math.max(0, level.killsToAdvance - this.gameScene.kills);
    this.killsText.setText(`KILLS LEFT: ${remaining}`);
    this.scoreText.setText(`SCORE: ${this.gameScene.score}`);

    // Powerup timers
    const now = this.gameScene.time.now;
    const tripleLeft = Math.max(0, player.tripleUntil - now);
    const tripleActive = tripleLeft > 0;
    this.tripleIcon.setVisible(tripleActive);
    this.tripleBarBg.setVisible(tripleActive);
    this.tripleBar.setVisible(tripleActive);
    if (tripleActive) this.tripleBar.width = 60 * (tripleLeft / POWERUP.tripleMs);

    const shieldLeft = Math.max(0, player.shieldUntil - now);
    const shieldActive = shieldLeft > 0;
    this.shieldIcon.setVisible(shieldActive);
    this.shieldBarBg.setVisible(shieldActive);
    this.shieldBar.setVisible(shieldActive);
    if (shieldActive) this.shieldBar.width = 60 * (shieldLeft / POWERUP.shieldMs);
  }
}
```

- [ ] **Step 2: Browser check**

Reload. Grab a triple or shield powerup. The corresponding icon and shrinking bar appears in the top-left HUD. Disappears when the buff expires.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/HUDScene.js
git commit -m "feat: HUD timers for triple-shot and shield powerups"
```

---

### Task 10: Final integration verification

- [ ] **Step 1: Full playthrough**

Reload. Play from menu through all 3 levels.

Verify:
- Menu and Game Over still work.
- Each level shows distinct cover layout.
- Player tank: hull turns with movement, turret tracks mouse, bullets exit barrel tip.
- Enemy tanks chase and aim turret at player.
- Bullets spark off cover blocks.
- Powerups drop occasionally (~12% per kill); pickup applies effect; floating text appears; HUD shows timers for triple/shield.
- Triple shot fires 3 spread bullets while active.
- Shield blocks all damage and shows ring while active.
- Health restores HP capped at 100.
- Cleared level 3 → Win scene.
- High score persists across reload.

- [ ] **Step 2: Push branch**

```bash
git push
```

---

## Self-Review

**Spec coverage check:** Each of the 9 spec components (BootScene textures, Player, Enemy, CoverBlock, Powerup, GameScene changes, HUDScene, levels config, constants) is implemented in tasks 1–9. Verification step in task 10 covers each line of the spec's Verification section.

**Placeholder scan:** None. Every step has either full code, an exact command, or a concrete browser action.

**Type consistency:**
- `tryShoot` now returns `{ shots: [...] }` and both call sites in GameScene are updated to iterate.
- Player exposes `heal(amount)`, `activateTriple(time, ms)`, `activateShield(time, ms)` — Powerup.applyTo calls exactly these signatures.
- `Powerup.applyTo` returns `{ label, color }` — `onPickup` destructures exactly these.
- `level.coverBlocks` is read by GameScene `for (const def of level.coverBlocks || [])` — defensive `|| []` handles old configs but every level in this plan has it set.
