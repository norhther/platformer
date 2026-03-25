---
phase: 02-player-core-mechanics
plan: 02
type: execute
wave: 2
depends_on:
  - 02-01
files_modified:
  - src/scenes/GameScene.ts
autonomous: true
requirements:
  - PLAY-05
  - PLAY-06

must_haves:
  truths:
    - "Player dies when falling below y=620 (off the bottom of the 600px canvas)"
    - "On death, player flashes (tween alpha 0→1 repeatedly) to signal the event"
    - "After the flash completes, player respawns at x=100, y=500 (level start position)"
    - "Death and respawn are self-contained in GameScene — no scene switch needed at this stage"
  artifacts:
    - path: "src/scenes/GameScene.ts"
      provides: "Extended GameScene with pit detection, death flash tween, and respawn logic"
      contains: "isDead, handleDeath, respawn"
  key_links:
    - from: "src/scenes/GameScene.ts update()"
      to: "handleDeath()"
      via: "player.y > 620 guard check"
      pattern: "player\\.y.*620"
    - from: "handleDeath()"
      to: "this.tweens.add"
      via: "alpha flash tween with onComplete callback"
      pattern: "tweens\\.add"
    - from: "tween onComplete"
      to: "respawn()"
      via: "callback that resets position and physics velocity"
      pattern: "respawn"
---

<objective>
Extend GameScene with player death detection (pit fall), a visual flash effect, and respawn at the level start position.

Purpose: Death and respawn are core to platformer feel. Players must know when they die and get a clear chance to retry.
Output: Player falls into pit → flashes → respawns at start. Self-contained in GameScene, no additional scenes needed.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@src/scenes/GameScene.ts

<interfaces>
<!-- Contracts established by Plan 01 that this plan extends -->

From src/scenes/GameScene.ts (Plan 01 output):
```typescript
export default class GameScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite;   // physics sprite at SPAWN_X=100, SPAWN_Y=500
  private ground: Phaser.Physics.Arcade.StaticGroup;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { left: Key; right: Key; up: Key };
  private readonly SPAWN_X = 100;
  private readonly SPAWN_Y = 500;
  private readonly WALK_SPEED = 180;
  private readonly JUMP_VELOCITY = -420;
  public currentLevel: number = 1;

  preload(): void { /* generates 'player', 'ground', 'platform' textures */ }
  create(): void { /* sets up physics, colliders, input */ }
  update(): void { /* handles movement and jump each frame */ }
}
```

New private fields to add:
```typescript
private isDead: boolean = false;   // gate: prevents input and double-death during flash
```

New private methods to add:
```typescript
private handleDeath(): void { ... }   // triggers flash tween, sets isDead=true
private respawn(): void { ... }       // resets position, velocity, isDead=false
```

Phaser tween API for the flash effect:
```typescript
this.tweens.add({
  targets: this.player,
  alpha: { from: 0, to: 1 },
  duration: 100,
  repeat: 5,
  yoyo: true,
  onComplete: () => { this.respawn(); },
});
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add isDead flag, handleDeath() and respawn() to GameScene</name>
  <files>src/scenes/GameScene.ts</files>
  <read_first>
    - src/scenes/GameScene.ts — read the full file; you will be adding fields and methods, not replacing existing code
  </read_first>
  <action>
Edit `src/scenes/GameScene.ts` to add death and respawn logic. Make these exact additions:

**1. Add private field** after the existing private fields (after `wasd`, before constants):
```typescript
private isDead: boolean = false;
```

**2. Add pit detection guard at the START of the update() method** (before any movement code):
```typescript
update(): void {
  // Pit detection — canvas is 600px tall; anything below 620 is off-screen
  if (!this.isDead && this.player.y > 620) {
    this.handleDeath();
    return;
  }

  // Gate all input during death animation
  if (this.isDead) return;

  // ... existing movement code unchanged below ...
}
```

**3. Add handleDeath() method** after update():
```typescript
private handleDeath(): void {
  this.isDead = true;
  // Stop player momentum immediately
  this.player.setVelocity(0, 0);

  // Flash tween: alpha oscillates 0→1 six times, then calls respawn
  this.tweens.add({
    targets: this.player,
    alpha: { from: 0, to: 1 },
    duration: 100,
    repeat: 5,
    yoyo: true,
    onComplete: () => {
      this.respawn();
    },
  });
}
```

**4. Add respawn() method** after handleDeath():
```typescript
private respawn(): void {
  this.player.setPosition(this.SPAWN_X, this.SPAWN_Y);
  this.player.setVelocity(0, 0);
  this.player.setAlpha(1);
  this.isDead = false;
}
```

Do NOT modify preload(), create(), or the movement/jump logic inside update() — only add the pit guard at the top and the two new private methods.
  </action>
  <verify>
    <automated>grep -n "isDead\|handleDeath\|respawn\|player\.y.*620\|tweens\.add" /Users/norhther/platformer/src/scenes/GameScene.ts</automated>
  </verify>
  <acceptance_criteria>
    - `isDead: boolean = false` private field exists in the class
    - `if (!this.isDead && this.player.y > 620)` check is present in update()
    - `if (this.isDead) return` guard is present in update() after the pit check
    - `handleDeath()` private method exists and calls `this.tweens.add`
    - tween config includes `repeat: 5`, `yoyo: true`, and `onComplete` callback
    - `onComplete` callback calls `this.respawn()`
    - `respawn()` private method calls `this.player.setPosition(this.SPAWN_X, this.SPAWN_Y)`
    - `respawn()` sets `this.isDead = false`
    - `respawn()` calls `this.player.setAlpha(1)` to ensure player is visible after flash
    - `respawn()` calls `this.player.setVelocity(0, 0)` to clear momentum
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Player falls below y=620, triggers handleDeath() once (isDead gate prevents re-trigger), flashes via tween, then respawns at SPAWN_X=100 SPAWN_Y=500 with full visibility and zero velocity.</done>
</task>

</tasks>

<verification>
After task completes:

1. TypeScript check: `npx tsc --noEmit` — must exit 0
2. Build check: `npm run build` — must exit 0
3. Death logic grep: `grep -n "isDead\|handleDeath\|respawn" src/scenes/GameScene.ts` — all three must appear
4. Pit threshold grep: `grep "player\.y" src/scenes/GameScene.ts` — must show the 620 threshold
5. Tween grep: `grep "tweens.add\|onComplete\|yoyo" src/scenes/GameScene.ts` — all three must appear
6. Respawn position grep: `grep "SPAWN_X\|SPAWN_Y\|setPosition" src/scenes/GameScene.ts` — all must appear in respawn()
</verification>

<success_criteria>
- isDead flag gates all death/input logic correctly
- Player stops immediately on death (setVelocity 0,0 in handleDeath)
- Flash tween runs 6 cycles (repeat:5 + initial = 6 flashes) then calls respawn
- Player reappears at x=100 y=500 with alpha=1 and zero velocity
- TypeScript compiles clean, build succeeds
</success_criteria>

<output>
After completion, create `.planning/phases/02-player-core-mechanics/02-02-SUMMARY.md`
</output>
