---
phase: 02-player-core-mechanics
plan: 03
subsystem: ui
tags: [phaser3, typescript, scene-management, hud, game-over]

# Dependency graph
requires:
  - phase: 02-player-core-mechanics
    provides: GameScene with player physics, pit detection, death tween, and currentLevel field
provides:
  - UIScene HUD overlay showing current level number in top-left corner
  - GameOverScene with GAME OVER title and functional Retry button
  - Full scene transition chain: Menu → Game+UI → GameOver → Retry → Game+UI
  - All five scenes registered in main.ts
affects:
  - 03-levels-and-enemies (needs UIScene to stay updated when level changes)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Parallel scene launch via scene.launch() for HUD overlays that run alongside game scenes
    - Data passing between scenes via init(data) method
    - scene.get('GameScene') cast via unknown for safe type bridging in Phaser TypeScript

key-files:
  created:
    - src/scenes/UIScene.ts
    - src/scenes/GameOverScene.ts
  modified:
    - src/scenes/GameScene.ts
    - src/main.ts

key-decisions:
  - "UIScene launched with scene.launch() not scene.start() so HUD runs in parallel with GameScene"
  - "scene.get() cast via unknown to avoid TS2352 error when narrowing Phaser.Scene to GameScene interface"
  - "respawn() method removed (was unused after death→GameOverScene transition, caused TS6133 error)"
  - "Death flash repeat reduced from 5 to 3 for snappier game-over feedback"

patterns-established:
  - "Parallel HUD overlay pattern: scene.launch('UIScene', data) in GameScene.create()"
  - "Scene cleanup before transition: scene.stop('UIScene') before scene.start('GameOverScene')"
  - "Retry flow: GameOverScene.scene.start('GameScene') which re-triggers create() and relaunches UIScene"

requirements-completed: [UI-01, UI-02, UI-03]

# Metrics
duration: 5min
completed: 2026-03-25
---

# Phase 2 Plan 03: UI HUD, Game Over Screen, and Full Scene Flow Summary

**UIScene HUD overlay + GameOverScene with Retry wired to complete the full game loop: MenuScene → GameScene+UIScene → GameOverScene → retry back to GameScene**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-25T14:20:06Z
- **Completed:** 2026-03-25T14:25:00Z
- **Tasks:** 2 (plus checkpoint)
- **Files modified:** 4

## Accomplishments
- Created UIScene showing "Level: N" HUD in top-left corner, syncing from GameScene.currentLevel each frame
- Created GameOverScene with GAME OVER title, level info display, and interactive Retry button
- Wired GameScene.create() to launch UIScene in parallel via scene.launch()
- Wired GameScene.handleDeath() tween onComplete to stop UIScene and start GameOverScene
- Registered all five scenes in main.ts: BootScene, MenuScene, GameScene, UIScene, GameOverScene
- TypeScript compiles clean, Vite production build passes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create UIScene and GameOverScene** - `7e869a4` (feat)
2. **Task 2: Wire GameScene death transition + update main.ts** - `1599e71` (feat)

## Files Created/Modified
- `src/scenes/UIScene.ts` - HUD overlay scene; shows Level: N text, updates from GameScene each frame
- `src/scenes/GameOverScene.ts` - Game over screen with GAME OVER title and Retry button
- `src/scenes/GameScene.ts` - Added UIScene launch in create(); replaced respawn() with GameOverScene transition in handleDeath()
- `src/main.ts` - Added UIScene and GameOverScene imports and registrations in scene array

## Decisions Made
- Used `scene.launch()` (not `scene.start()`) for UIScene so it runs in parallel with GameScene
- Cast `scene.get('GameScene')` via `unknown` to bridge Phaser.Scene and GameScene's interface without TS error
- Removed `respawn()` method: it was unused after transitioning to GameOverScene flow, and TypeScript TS6133 flagged it as an error

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript cast error in UIScene.update()**
- **Found during:** Task 1 (Create UIScene)
- **Issue:** `scene.get('GameScene') as { currentLevel: number }` caused TS2352 — Phaser.Scene doesn't overlap enough with the target type
- **Fix:** Changed to `as unknown as { currentLevel: number }` and removed the redundant `(gameScene as any)` wrapper
- **Files modified:** src/scenes/UIScene.ts
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** 7e869a4 (Task 1 commit)

**2. [Rule 1 - Bug] Removed unused respawn() method causing TS6133 error**
- **Found during:** Task 2 (Wire GameScene)
- **Issue:** After replacing `this.respawn()` call with GameOverScene transition, the `respawn()` method remained but was never called. TypeScript TS6133 "declared but value never read" prevented build.
- **Fix:** Removed the `respawn()` method entirely
- **Files modified:** src/scenes/GameScene.ts
- **Verification:** `npx tsc --noEmit` exits 0, `npm run build` succeeds
- **Committed in:** 1599e71 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both fixes required for TypeScript compilation. No behavioral scope change.

## Issues Encountered
None beyond the two TypeScript errors that were auto-fixed inline.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full game loop complete: MenuScene → GameScene+UIScene → GameOverScene → Retry → GameScene
- UIScene reads currentLevel from GameScene each frame — ready for level progression in Phase 3
- GameScene and GameOverScene pass level data via init() — ready for multi-level support

## Self-Check: PASSED

- FOUND: src/scenes/UIScene.ts
- FOUND: src/scenes/GameOverScene.ts
- FOUND: src/scenes/GameScene.ts
- FOUND: src/main.ts
- FOUND: .planning/phases/02-player-core-mechanics/02-03-SUMMARY.md
- FOUND commit: 7e869a4
- FOUND commit: 1599e71

---
*Phase: 02-player-core-mechanics*
*Completed: 2026-03-25*
