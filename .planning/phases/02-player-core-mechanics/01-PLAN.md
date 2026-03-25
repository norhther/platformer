---
phase: 02-player-core-mechanics
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/scenes/MenuScene.ts
  - src/scenes/GameScene.ts
  - src/main.ts
autonomous: true
requirements:
  - PLAY-01
  - PLAY-02
  - PLAY-03
  - PLAY-04

must_haves:
  truths:
    - "Player renders as a colored rectangle sprite (16x24px) in the game world"
    - "Player moves left and right when arrow keys or WASD are pressed"
    - "Player jumps when Space or Up arrow is pressed, only when on the ground"
    - "Player falls due to gravity and lands on the ground platform"
    - "Scene transitions from MenuScene to GameScene when clicking Play"
  artifacts:
    - path: "src/scenes/MenuScene.ts"
      provides: "Main menu scene with Play button"
      exports: ["MenuScene (default)"]
    - path: "src/scenes/GameScene.ts"
      provides: "Game scene with player sprite, physics ground, keyboard controls"
      exports: ["GameScene (default)"]
    - path: "src/main.ts"
      provides: "Updated scene registry: [BootScene, MenuScene, GameScene]"
      contains: "MenuScene, GameScene"
  key_links:
    - from: "src/main.ts"
      to: "src/scenes/MenuScene.ts"
      via: "scene array in GameConfig"
      pattern: "MenuScene"
    - from: "src/scenes/MenuScene.ts"
      to: "src/scenes/GameScene.ts"
      via: "this.scene.start('GameScene')"
      pattern: "scene.start.*GameScene"
    - from: "src/scenes/GameScene.ts"
      to: "Phaser Arcade physics"
      via: "this.physics.add.sprite + this.physics.add.staticGroup"
      pattern: "physics\\.add\\.sprite"
---

<objective>
Create the MenuScene and GameScene with a programmatically generated pixel art player, Arcade physics ground, and full keyboard controls (left/right/jump).

Purpose: The core feel of a platformer lives in player movement. This plan establishes the playable foundation that every subsequent plan builds on.
Output: A scene flow from MenuScene -> GameScene, with a controllable jumping player that obeys gravity and lands on a ground platform.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@src/main.ts
@src/scenes/BootScene.ts

<interfaces>
<!-- Existing code contracts the executor must respect -->

From src/main.ts (current):
```typescript
// Arcade physics already configured — gravity y:300 is set, do NOT change it
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: [BootScene],   // <-- update to [BootScene, MenuScene, GameScene]
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 300 }, debug: false },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
};
```

From src/scenes/BootScene.ts (existing pattern — follow this class structure):
```typescript
export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }
  create(): void { ... this.scene.start('MenuScene'); }
}
```

New scene keys (canonical — use exactly these strings):
- 'MenuScene'   → src/scenes/MenuScene.ts
- 'GameScene'   → src/scenes/GameScene.ts
- 'UIScene'     → src/scenes/UIScene.ts (Plan 03)
- 'GameOverScene' → src/scenes/GameOverScene.ts (Plan 03)

Player constants (use these exact values):
- Sprite size: 16px wide, 24px tall
- Player color: 0x44aaff (blue rectangle)
- Walk speed: 180 px/s
- Jump velocity: -420 px/s (negative = upward in Phaser)
- Spawn position: x=100, y=500 (inside 800x600 canvas, above ground)

Ground platform:
- A static physics group containing one 800x16 rectangle at y=584 (bottom of 600px canvas)
- Color: 0x228b22 (dark green)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create MenuScene with Play button</name>
  <files>src/scenes/MenuScene.ts</files>
  <read_first>
    - src/scenes/BootScene.ts — follow the exact class structure (extends Phaser.Scene, constructor with key, typed methods)
    - src/main.ts — see how scenes are currently registered; this file will need updating in Task 3
  </read_first>
  <action>
Create `src/scenes/MenuScene.ts` as a new TypeScript file. Follow this exact structure:

```typescript
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Title text — centered
    this.add.text(width / 2, height / 3, 'PLATFORMER', {
      fontSize: '48px',
      color: '#e0e0e0',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Play button — interactive text
    const playButton = this.add.text(width / 2, height / 2, '[ PLAY ]', {
      fontSize: '32px',
      color: '#44aaff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => playButton.setColor('#ffffff'));
    playButton.on('pointerout', () => playButton.setColor('#44aaff'));
    playButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
```

No preload() needed — no external assets.
  </action>
  <verify>
    <automated>grep -n "scene.start.*GameScene" /Users/norhther/platformer/src/scenes/MenuScene.ts</automated>
  </verify>
  <acceptance_criteria>
    - File exists at src/scenes/MenuScene.ts
    - Class is named MenuScene and extends Phaser.Scene
    - constructor calls super({ key: 'MenuScene' })
    - pointerdown handler calls this.scene.start('GameScene')
    - setInteractive is called on the play button
    - File compiles without error: `npx tsc --noEmit` passes
  </acceptance_criteria>
  <done>MenuScene.ts exists with a Play button that transitions to GameScene on click.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create GameScene with player sprite, physics ground, and keyboard controls</name>
  <files>src/scenes/GameScene.ts</files>
  <read_first>
    - src/main.ts — arcade physics config (gravity y:300, debug:false) — do NOT re-add gravity; it's inherited
    - src/scenes/BootScene.ts — follow the typed class structure
    - src/scenes/MenuScene.ts — completed in Task 1, reference for scene key strings
  </read_first>
  <action>
Create `src/scenes/GameScene.ts`. This is the main gameplay scene. Implement exactly as follows:

```typescript
import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; up: Phaser.Input.Keyboard.Key };
  private readonly WALK_SPEED = 180;
  private readonly JUMP_VELOCITY = -420;
  private readonly SPAWN_X = 100;
  private readonly SPAWN_Y = 500;
  public currentLevel: number = 1;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    // Generate player texture programmatically (16x24 blue rectangle)
    const playerGfx = this.make.graphics({ x: 0, y: 0 });
    playerGfx.fillStyle(0x44aaff);
    playerGfx.fillRect(0, 0, 16, 24);
    playerGfx.generateTexture('player', 16, 24);
    playerGfx.destroy();

    // Generate ground texture programmatically (800x16 dark green rectangle)
    const groundGfx = this.make.graphics({ x: 0, y: 0 });
    groundGfx.fillStyle(0x228b22);
    groundGfx.fillRect(0, 0, 800, 16);
    groundGfx.generateTexture('ground', 800, 16);
    groundGfx.destroy();

    // Generate platform texture (120x16 tile for mid-air platforms)
    const platformGfx = this.make.graphics({ x: 0, y: 0 });
    platformGfx.fillStyle(0x8b5e3c);
    platformGfx.fillRect(0, 0, 120, 16);
    platformGfx.generateTexture('platform', 120, 16);
    platformGfx.destroy();
  }

  create(): void {
    const { width, height } = this.scale;

    // Ground — static physics group at bottom of canvas
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 584, 'ground');  // y=584: 600 - 8 (half of 16px)

    // Two mid-air platforms for testability
    const platforms = this.physics.add.staticGroup();
    platforms.create(250, 430, 'platform');
    platforms.create(550, 320, 'platform');

    // Player sprite with arcade physics — spawned above ground
    this.player = this.physics.add.sprite(this.SPAWN_X, this.SPAWN_Y, 'player');
    this.player.setCollideWorldBounds(true);

    // Colliders
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, platforms);

    // Keyboard input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    };
  }

  update(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    // Horizontal movement
    const goLeft = this.cursors.left.isDown || this.wasd.left.isDown;
    const goRight = this.cursors.right.isDown || this.wasd.right.isDown;

    if (goLeft) {
      this.player.setVelocityX(-this.WALK_SPEED);
    } else if (goRight) {
      this.player.setVelocityX(this.WALK_SPEED);
    } else {
      this.player.setVelocityX(0);
    }

    // Jump — only when on ground
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up);

    if (jumpPressed && onGround) {
      this.player.setVelocityY(this.JUMP_VELOCITY);
    }
  }
}
```

Important: `this.make.graphics` in preload() generates textures before create() runs. Do NOT use `this.add.graphics` in preload() — it's not available until create(). The pattern `this.make.graphics({ x: 0, y: 0 })` then `.generateTexture(key, w, h)` then `.destroy()` is the correct Phaser 3 approach for programmatic textures in preload.
  </action>
  <verify>
    <automated>grep -n "JUMP_VELOCITY\|setVelocityY\|blocked.down\|createCursorKeys\|staticGroup" /Users/norhther/platformer/src/scenes/GameScene.ts</automated>
  </verify>
  <acceptance_criteria>
    - File exists at src/scenes/GameScene.ts
    - Class is named GameScene and extends Phaser.Scene
    - constructor calls super({ key: 'GameScene' })
    - player field typed as Phaser.Physics.Arcade.Sprite
    - ground field typed as Phaser.Physics.Arcade.StaticGroup
    - cursors field typed as Phaser.Types.Input.Keyboard.CursorKeys
    - WALK_SPEED = 180 and JUMP_VELOCITY = -420 constants present
    - physics.add.sprite called with 'player' texture key
    - physics.add.staticGroup called for ground
    - physics.add.collider called for player+ground
    - body.blocked.down used to gate jump
    - JustDown used for jump to prevent holding jump
    - setCollideWorldBounds(true) called on player
    - currentLevel public field = 1 (consumed by UIScene in Plan 03)
    - generateTexture called for 'player', 'ground', 'platform' keys
    - `npx tsc --noEmit` passes
  </acceptance_criteria>
  <done>GameScene renders player on ground platform, player moves left/right with arrow/WASD, jumps with Space/Up/W, gravity pulls player down, can land on mid-air platforms.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Register MenuScene and GameScene in main.ts; update BootScene to transition</name>
  <files>src/main.ts, src/scenes/BootScene.ts</files>
  <read_first>
    - src/main.ts — read the current scene array (currently [BootScene] only); must add MenuScene and GameScene
    - src/scenes/BootScene.ts — read the current create() method; add this.scene.start('MenuScene') at the end
    - src/scenes/MenuScene.ts — verify the scene key string matches 'MenuScene'
    - src/scenes/GameScene.ts — verify the scene key string matches 'GameScene'
  </read_first>
  <action>
Two file edits:

**Edit 1 — src/main.ts:**
Add imports for MenuScene and GameScene, then update the `scene` array:

```typescript
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: [BootScene, MenuScene, GameScene],   // <-- updated
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
```

**Edit 2 — src/scenes/BootScene.ts:**
Add `this.scene.start('MenuScene')` at the end of create(), replacing or adding after the placeholder text:

```typescript
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Transition immediately to main menu
    this.scene.start('MenuScene');
  }
}
```

Remove the old placeholder text block entirely — it is replaced by MenuScene.
  </action>
  <verify>
    <automated>grep -n "MenuScene\|GameScene" /Users/norhther/platformer/src/main.ts</automated>
  </verify>
  <acceptance_criteria>
    - src/main.ts imports MenuScene from './scenes/MenuScene'
    - src/main.ts imports GameScene from './scenes/GameScene'
    - scene array in main.ts contains [BootScene, MenuScene, GameScene] (all three)
    - src/scenes/BootScene.ts create() calls this.scene.start('MenuScene')
    - No placeholder text remains in BootScene
    - `npx tsc --noEmit` exits 0 (no TypeScript errors across all files)
    - `npm run build` exits 0 (Vite build succeeds)
  </acceptance_criteria>
  <done>Game boots through BootScene into MenuScene. Clicking Play starts GameScene. TypeScript compilation clean. Build succeeds.</done>
</task>

</tasks>

<verification>
After all tasks complete, verify the full plan end-to-end:

1. TypeScript check: `npx tsc --noEmit` — must exit 0
2. Build check: `npm run build` — must exit 0, no errors
3. File existence checks:
   - `ls src/scenes/MenuScene.ts src/scenes/GameScene.ts` — both must exist
4. Scene key grep: `grep -r "scene.start" src/scenes/` — must show BootScene→MenuScene and MenuScene→GameScene transitions
5. Physics grep: `grep "blocked.down\|setVelocityY\|setVelocityX" src/scenes/GameScene.ts` — all three must appear
6. Input grep: `grep "createCursorKeys\|addKey\|JustDown" src/scenes/GameScene.ts` — all three must appear
</verification>

<success_criteria>
- MenuScene.ts and GameScene.ts exist in src/scenes/
- main.ts scene array includes all three scenes (BootScene, MenuScene, GameScene)
- BootScene transitions to MenuScene on startup
- GameScene has player at x=100 y=500 with physics, moves at 180px/s, jumps at -420px/s
- Jump gated by body.blocked.down (no double jump)
- JustDown used for jump input (no repeat on hold)
- TypeScript compiles clean, Vite build succeeds
</success_criteria>

<output>
After completion, create `.planning/phases/02-player-core-mechanics/02-01-SUMMARY.md`
</output>
