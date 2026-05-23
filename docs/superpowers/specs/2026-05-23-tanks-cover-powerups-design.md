# Spec: Tanks, Cover Blocks, and Powerups

**Date:** 2026-05-23
**Project:** claude-code-crash-course (Neon Shooter)
**Status:** Approved

## Goal

Upgrade the current top-down shooter from circle-based combatants in an empty arena to a tactical tank-vs-tank arena with cover blocks and powerup drops. Same retro neon aesthetic, same core control scheme.

## Decisions

| Topic | Choice |
| --- | --- |
| Tank rendering | Procedural hull + turret sprites (no external assets) |
| Player rotation | Two-axis: hull rotates with movement, turret tracks mouse |
| Enemy rotation | Single-axis: both hull and turret face the player |
| Arena layout | Scattered cover blocks, hand-designed per level (5–7) |
| Cover behavior | Player, enemies, and bullets all collide with blocks |
| Powerup types | Health pack (+30 HP), Triple shot (10 s), Shield (8 s) |
| Powerup source | Random enemy drop, 12% chance, equal weights |

## Components

### 1. Tank visuals (`BootScene.js`)

New procedural textures generated in BootScene:
- `tank-hull-player`, `tank-hull-enemy` — rectangle with tread strips on long sides
- `tank-turret-player`, `tank-turret-enemy` — smaller rectangle with white barrel protruding from front
- `cover-block` — dark steel rectangle with neon cyan edge
- `pickup-health`, `pickup-triple`, `pickup-shield` — small icons with additive glow tint

Tread animation is faked: hull texture includes tread pattern; we keep texture static (no per-frame scroll) for v1 — relying on motion alone for movement feedback. (Tread scroll is a stretch goal.)

### 2. Player (`entities/Player.js`)

- Holds two visual children: `hull` (this sprite itself) and `turret` (a `Phaser.GameObjects.Image` positioned at the same x/y, rotated independently).
- **Hull rotation:** when moving (velocity > 0), target angle = atan2(vy, vx); current angle lerps toward target with a turn rate (~6 rad/s). When stopped, hull stays where it was.
- **Turret rotation:** every frame = atan2(pointer.y − this.y, pointer.x − this.x).
- **Muzzle position:** `(this.x + cos(turret.rotation) * barrelLength, this.y + sin(...) * barrelLength)`.
- **Powerup state fields:** `tripleUntil`, `shieldUntil`.
- **`tryShoot`:** if `time < tripleUntil`, emit 3 bullets at angles `[turret − 10°, turret, turret + 10°]`; else 1.
- **Damage:** if `time < shieldUntil`, treat as invuln (no damage, optional small ring flash on hit).
- **Render:** while shield active, draw a faint blue ring on the player via a child `Image` or `Graphics`.

### 3. Enemy (`entities/Enemy.js`)

- Same hull + turret structure but both face the player every frame (single rotation).
- Otherwise mechanics unchanged (chase, contact damage, HP from level config).

### 4. CoverBlock (`entities/CoverBlock.js`)

- Static Arcade physics body created from a base `cover-block` texture, scaled per definition.
- Constructed from `{ x, y, w, h }` in level config (center coords, in pixels).
- Added to a static `coverGroup` in GameScene.

### 5. Powerup (`entities/Powerup.js`)

- Lightweight sprite with arcade physics body (kinematic, no velocity), no collision with anything except player overlap.
- Constructor: `(scene, x, y, type)` where `type ∈ {'health', 'triple', 'shield'}`.
- Idle animation: vertical bob (±4 px, ~0.8 s yoyo tween) and slow rotation.
- Exposes `applyTo(player, time)` that mutates the player and returns a label string (e.g., `"+30 HP"`).

### 6. GameScene changes (`scenes/GameScene.js`)

- After floor and before player creation: build the cover group from `level.coverBlocks`.
- Add colliders:
  - `physics.add.collider(player, coverGroup)`
  - `physics.add.collider(enemies, coverGroup)`
  - `physics.add.collider(bullets, coverGroup, onBulletHitsCover)` — bullet dies, small spark particle burst.
- Powerup group:
  - `powerups = physics.add.group({ classType: Powerup })`
  - `physics.add.overlap(player, powerups, onPickup)` — apply effect, destroy powerup, spawn floating text.
- On enemy death (existing path in `onBulletHitsEnemy`): roll `Math.random() < POWERUP.dropChance` → pick random type → instantiate `Powerup` at enemy death position → add to group.
- Floating text helper: `showFloatingText(x, y, label, color)` — tweens a `Text` upward and fades.

### 7. HUDScene (`scenes/HUDScene.js`)

- Below HP bar, an icon strip showing currently active powerups (Triple, Shield) as small textures + a shrinking horizontal countdown bar each. Health pickups are instant so no entry.

### 8. Level config (`config/levels.js`)

Each level gains a `coverBlocks` array, e.g.:
```js
coverBlocks: [
  { x: 240, y: 200, w: 96, h: 24 },
  { x: 720, y: 200, w: 96, h: 24 },
  { x: 480, y: 320, w: 32, h: 120 },
  // ...
],
```
Each of the three levels gets a distinct layout (corner cover, central column, etc.).

### 9. Constants (`config/constants.js`)

```js
TANK = { hullW: 36, hullH: 28, turretW: 14, turretH: 22, barrelLen: 16, turnRateRad: 6 }
COVER = { fill: 0x1c1c38, edge: 0x00ffe0, alpha: 0.9 }
POWERUP = {
  dropChance: 0.12,
  healthAmount: 30,
  tripleMs: 10000,
  shieldMs: 8000,
  tripleSpreadRad: Math.PI / 18,  // ~10°
}
```

## Out of Scope

- Sound effects
- Destructible cover blocks
- Per-level enemy tank visual variants
- Tread animation scroll on hull texture
- Powerup explosion VFX on pickup (use floating text only)

## Verification

1. Reload `http://127.0.0.1:5173/` after rebuild — no console errors.
2. **Tanks:** player is recognizable as a tank (hull + turret + barrel). Hull turns when WASD direction changes; turret swivels with mouse independently. Enemies render as tanks facing the player.
3. **Cover:** each of 3 levels has a different visible cover layout. Walking into a block stops the player. Enemies path around blocks via Phaser physics sliding (no AI changes). Bullets despawn against blocks with a spark.
4. **Powerups:** killing enemies sometimes drops a pickup. Walking over a pickup applies its effect; floating text appears; pickup disappears. Triple shot fires 3 bullets for 10 s; shield blocks damage and shows a ring for 8 s; health restores 30 HP capped at 100. HUD shows timers for active timed buffs.
5. Game still reaches Win screen after clearing level 3; localStorage high score still persists.
