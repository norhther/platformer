---
phase: 02-player-core-mechanics
plan: 03
type: execute
wave: 3
depends_on:
  - 02-01
  - 02-02
files_modified:
  - src/scenes/UIScene.ts
  - src/scenes/GameOverScene.ts
  - src/scenes/GameScene.ts
  - src/main.ts
autonomous: true
requirements:
  - UI-01
  - UI-02
  - UI-03

must_haves:
  truths:
    - "HUD overlay shows 'Level: 1' in top-left corner while GameScene is running"
    - "UIScene runs in parallel with GameScene (scene.launch, not scene.start)"
    - "When player dies, GameScene emits 'player-died' event and transitions to GameOverScene"
    - "GameOverScene shows 'GAME OVER' and a 'Retry' button"
    - "Clicking Retry restarts GameScene (and re-launches UIScene overlay)"
    - "Full flow works: MenuScene → GameScene + UIScene → GameOverScene → GameScene + UIScene"
  artifacts:
    - path: "src/scenes/UIScene.ts"
      provides: "HUD overlay scene showing current level number"
      exports: ["UIScene (default)"]
    - path: "src/scenes/GameOverScene.ts"
      provides: "Game over screen with Retry button"
      exports: ["GameOverScene (default)"]
    - path: "src/scenes/GameScene.ts"
      provides: "Updated: launches UIScene overlay, emits player-died event, stops UIScene before leaving"
      contains: "scene.launch.*UIScene, events.emit.*player-died"
    - path: "src/main.ts"
      provides: "Updated scene registry: all five scenes registered"
      contains: "UIScene, GameOverScene"
  key_links:
    - from: "src/scenes/GameScene.ts create()"
      to: "src/scenes/UIScene.ts"
      via: "this.scene.launch('UIScene', { level: this.currentLevel })"
      pattern: "scene\\.launch.*UIScene"
    - from: "src/scenes/GameScene.ts handleDeath()"
      to: "src/scenes/GameOverScene.ts"
      via: "this.scene.stop('UIScene'); this.scene.start('GameOverScene')"
      pattern: "scene\\.start.*GameOverScene"
    - from: "src/scenes/GameOverScene.ts"
      to: "src/scenes/GameScene.ts"
      via: "this.scene.start('GameScene') on Retry click"
      pattern: "scene\\.start.*GameScene"
    - from: "src/scenes/UIScene.ts"
      to: "src/scenes/GameScene.ts currentLevel"
      via: "scene.get('GameScene') to read currentLevel"
      pattern: "scene\\.get.*GameScene"
---

<objective>
Add UIScene (HUD overlay), GameOverScene, wire death → GameOverScene transition, and register all scenes in main.ts.

Purpose: Complete the full game loop: MenuScene → GameScene+UIScene → GameOverScene → retry back to GameScene. The HUD informs players of the current level.
Output: Five scenes registered and wired. HUD shows level number. Game over screen has working Retry button.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@src/scenes/GameScene.ts
@src/main.ts

<interfaces>
<!-- Contracts from Plans 01+02 that this plan builds on -->

From src/scenes/GameScene.ts (Plans 01+02 output):
```typescript
export default class GameScene extends Phaser.Scene {
  public currentLevel: number = 1;           // read by UIScene to display level
  private isDead: boolean = false;
  private readonly SPAWN_X = 100;
  private readonly SPAWN_Y = 500;

  create(): void {
    // ... existing setup ...
    // ADD: this.scene.launch('UIScene', { level: this.currentLevel });
  }

  private handleDeath(): void {
    this.isDead = true;
    this.player.setVelocity(0, 0);
    // MODIFY: replace the tween + respawn flow with a scene transition to GameOverScene
    // tween still runs, but onComplete goes to GameOverScene instead of respawn()
    this.tweens.add({
      targets: this.player,
      alpha: { from: 0, to: 1 },
      duration: 100,
      repeat: 3,        // shorter for game over flow
      yoyo: true,
      onComplete: () => {
        this.scene.stop('UIScene');
        this.scene.start('GameOverScene', { level: this.currentLevel });
      },
    });
  }
  // respawn() can remain but is not called from handleDeath anymore
}
```

New scene key strings (canonical):
- 'UIScene'        → src/scenes/UIScene.ts
- 'GameOverScene'  → src/scenes/GameOverScene.ts

Phaser parallel scene API:
- `this.scene.launch('UIScene', data)` — starts UIScene alongside GameScene (both active)
- `this.scene.stop('UIScene')` — stops and destroys UIScene before transitioning
- `this.scene.get('GameScene')` — from UIScene, get reference to the active GameScene instance

UIScene data passing:
- Launched with `{ level: this.currentLevel }` — available as `this.scene.settings.data` or via `init(data)`
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create UIScene (HUD overlay) and GameOverScene</name>
  <files>src/scenes/UIScene.ts, src/scenes/GameOverScene.ts</files>
  <read_first>
    - src/scenes/BootScene.ts — follow the class pattern (extends Phaser.Scene, typed methods)
    - src/scenes/MenuScene.ts — follow the interactive button pattern for GameOverScene's Retry button
  </read_first>
  <action>
Create two new scene files.

**File 1 — src/scenes/UIScene.ts:**

```typescript
import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private level: number = 1;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { level: number }): void {
    // Receive level from GameScene.create() launch call
    this.level = data?.level ?? 1;
  }

  create(): void {
    // HUD text — top-left corner, always on top of GameScene
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#00000066',
      padding: { x: 8, y: 4 },
    });

    // UIScene sits above GameScene in display order — no depth adjustment needed
    // Canvas width 800, height 600 — text at (16,16) is safely in top-left
  }

  update(): void {
    // Sync level from GameScene in case it changes during play
    const gameScene = this.scene.get('GameScene') as { currentLevel: number } | null;
    if (gameScene && this.levelText) {
      const currentLevel = (gameScene as any).currentLevel ?? this.level;
      this.levelText.setText(`Level: ${currentLevel}`);
    }
  }
}
```

**File 2 — src/scenes/GameOverScene.ts:**

```typescript
import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  private level: number = 1;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { level: number }): void {
    this.level = data?.level ?? 1;
  }

  create(): void {
    const { width, height } = this.scale;

    // Dark semi-transparent overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Game Over title
    this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Level info
    this.add.text(width / 2, height / 2 - 20, `Level ${this.level}`, {
      fontSize: '24px',
      color: '#e0e0e0',
    }).setOrigin(0.5);

    // Retry button
    const retryButton = this.add.text(width / 2, height / 2 + 50, '[ RETRY ]', {
      fontSize: '32px',
      color: '#44aaff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryButton.on('pointerover', () => retryButton.setColor('#ffffff'));
    retryButton.on('pointerout', () => retryButton.setColor('#44aaff'));
    retryButton.on('pointerdown', () => {
      // Restart GameScene fresh, then launch UIScene overlay again
      this.scene.start('GameScene');
    });
  }
}
```

Note on Retry flow: `this.scene.start('GameScene')` stops GameOverScene and starts GameScene fresh. GameScene.create() will launch UIScene again via `this.scene.launch('UIScene', ...)`.
  </action>
  <verify>
    <automated>grep -n "scene.start\|scene.get\|scene.launch\|setInteractive\|init(" /Users/norhther/platformer/src/scenes/UIScene.ts /Users/norhther/platformer/src/scenes/GameOverScene.ts</automated>
  </verify>
  <acceptance_criteria>
    - src/scenes/UIScene.ts exists
    - UIScene class key is 'UIScene'
    - UIScene has init(data: { level: number }) method that stores the level
    - UIScene.create() renders levelText at position (16, 16)
    - UIScene.update() reads currentLevel from scene.get('GameScene')
    - src/scenes/GameOverScene.ts exists
    - GameOverScene class key is 'GameOverScene'
    - GameOverScene has init(data: { level: number }) method
    - GameOverScene.create() renders 'GAME OVER' text and a Retry button
    - Retry button pointerdown handler calls this.scene.start('GameScene')
    - Both files use `!` non-null assertion on text fields (TypeScript strict mode safe)
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>UIScene.ts and GameOverScene.ts created with correct scene keys, init() data handling, HUD text at (16,16), and functional Retry button that starts GameScene.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Wire GameScene death→GameOverScene and launch UIScene; update main.ts</name>
  <files>src/scenes/GameScene.ts, src/main.ts</files>
  <read_first>
    - src/scenes/GameScene.ts — read the full file; specifically the create() method and handleDeath() method that will be modified
    - src/main.ts — read the scene array; UIScene and GameOverScene must be added
    - src/scenes/UIScene.ts — verify it accepts { level: number } in init()
    - src/scenes/GameOverScene.ts — verify it accepts { level: number } in init()
  </read_first>
  <action>
Two file edits:

**Edit 1 — src/scenes/GameScene.ts:**

**In create():** Add `this.scene.launch('UIScene', { level: this.currentLevel })` as the last line of create(), after all physics and input setup:

```typescript
create(): void {
  // ... all existing setup code unchanged ...

  // Launch HUD overlay in parallel (runs alongside GameScene)
  this.scene.launch('UIScene', { level: this.currentLevel });
}
```

**In handleDeath():** Replace the existing tween's `onComplete` callback (which currently calls `this.respawn()`) with a transition to GameOverScene:

```typescript
private handleDeath(): void {
  this.isDead = true;
  this.player.setVelocity(0, 0);

  this.tweens.add({
    targets: this.player,
    alpha: { from: 0, to: 1 },
    duration: 100,
    repeat: 3,
    yoyo: true,
    onComplete: () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', { level: this.currentLevel });
    },
  });
}
```

The `respawn()` method can stay in the file but is no longer called — it will be used in Phase 3 mid-level checkpoints.

**Edit 2 — src/main.ts:**

Add imports for UIScene and GameOverScene, then add them to the scene array. Order matters: Phaser registers scenes in array order; the first scene auto-starts. Keep BootScene first.

```typescript
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import GameOverScene from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: [BootScene, MenuScene, GameScene, UIScene, GameOverScene],
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

Note: UIScene is launched via `scene.launch()` from GameScene, not auto-started. GameOverScene is started via `scene.start()` from GameScene. Both must be registered in the scene array to be accessible.
  </action>
  <verify>
    <automated>grep -n "scene.launch\|scene.stop\|scene.start.*GameOverScene\|UIScene\|GameOverScene" /Users/norhther/platformer/src/scenes/GameScene.ts /Users/norhther/platformer/src/main.ts</automated>
  </verify>
  <acceptance_criteria>
    - GameScene.create() calls `this.scene.launch('UIScene', { level: this.currentLevel })`
    - GameScene.handleDeath() tween onComplete calls `this.scene.stop('UIScene')`
    - GameScene.handleDeath() tween onComplete calls `this.scene.start('GameOverScene', { level: this.currentLevel })`
    - main.ts imports UIScene from './scenes/UIScene'
    - main.ts imports GameOverScene from './scenes/GameOverScene'
    - main.ts scene array contains all five scenes: [BootScene, MenuScene, GameScene, UIScene, GameOverScene]
    - No duplicate scene keys (each scene key string is unique across all scene files)
    - `npx tsc --noEmit` exits 0
    - `npm run build` exits 0
  </acceptance_criteria>
  <done>Full scene flow operational: Boot→Menu→Game+UI→GameOver→Game+UI. UIScene launched in parallel in create(). Death transitions to GameOverScene after flash. Build passes.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Complete Phase 2 UI flow:
    - MenuScene with Play button
    - GameScene with player physics + keyboard controls
    - UIScene HUD overlay (Level: 1)
    - GameOverScene with Retry button
    - Full scene transition chain
  </what-built>
  <how-to-verify>
    Run `npm run dev`, open http://localhost:5173 in browser and verify:

    1. Canvas loads showing MenuScene with "PLATFORMER" title and "[ PLAY ]" button
    2. Click Play — transitions to GameScene showing colored rectangle player on green ground
    3. "Level: 1" text appears in top-left corner (UIScene HUD)
    4. Arrow keys / WASD move player left and right
    5. Space / Up arrow / W makes player jump (single jump, cannot double-jump)
    6. Player lands on the green ground platform
    7. Walk player off the edge of the screen (or wait for gravity to push below y=620)
    8. Player flashes, then GameOverScene appears with "GAME OVER" and "[ RETRY ]" button
    9. Click Retry — returns to GameScene with player at start position, HUD shows Level: 1
    10. Confirm the full loop works: Play → Game → Die → Retry → Game
  </how-to-verify>
  <resume-signal>Type "approved" if the full loop works. Describe any issues if not.</resume-signal>
</task>

</tasks>

<verification>
After all tasks complete (before checkpoint):

1. TypeScript check: `npx tsc --noEmit` — must exit 0
2. Build check: `npm run build` — must exit 0
3. Scene file existence: `ls src/scenes/` — must show BootScene.ts, MenuScene.ts, GameScene.ts, UIScene.ts, GameOverScene.ts
4. Scene registry: `grep "UIScene\|GameOverScene" src/main.ts` — both must appear in imports and scene array
5. Flow wiring: `grep "scene.launch\|scene.stop\|scene.start" src/scenes/GameScene.ts` — all three must appear
6. HUD text: `grep "Level:" src/scenes/UIScene.ts` — must appear in create() text string
7. Retry button: `grep "scene.start.*GameScene" src/scenes/GameOverScene.ts` — must appear in pointerdown handler
</verification>

<success_criteria>
- Five scenes exist: BootScene, MenuScene, GameScene, UIScene, GameOverScene
- All five registered in main.ts scene array
- UIScene launched in parallel (scene.launch) from GameScene.create()
- Death transitions to GameOverScene with level data passed
- Retry button in GameOverScene starts GameScene fresh (which re-launches UIScene)
- HUD shows "Level: 1" text in top-left
- TypeScript compiles clean, Vite build succeeds
- Human verifies full loop: Menu → Play → Die → Retry → Play again
</success_criteria>

<output>
After completion, create `.planning/phases/02-player-core-mechanics/02-03-SUMMARY.md`
</output>
