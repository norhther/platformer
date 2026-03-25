---
phase: 02-player-core-mechanics
plan: 02
subsystem: ui
tags: [phaser3, arcade-physics, tween, respawn, death-detection]

# Dependency graph
requires:
  - phase: 02-player-core-mechanics
    plan: 01
    provides: GameScene with player sprite, physics ground, movement controls, SPAWN_X/SPAWN_Y constants
provides:
  - Player pit detection (y > 620 threshold) with isDead gate
  - Death flash tween (6 alpha cycles via repeat:5 + yoyo) triggered on fall
  - Respawn at SPAWN_X=100, SPAWN_Y=500 after flash completes
  - handleDeath() and respawn() private methods in GameScene
affects: [03-player-core-mechanics, enemies, level-design]

# Tech tracking
tech-stack:
  added: []
  patterns: [Phaser tween onComplete callback for sequenced state transitions, isDead boolean gate to prevent double-trigger during async animation]

key-files:
  created: []
  modified: [src/scenes/GameScene.ts]

key-decisions:
  - "isDead boolean gate prevents re-triggering handleDeath() while flash tween is running"
  - "setCollideWorldBounds(true) remains active — player still collides with canvas sides but falls through bottom (world bounds do not block below-canvas movement)"
  - "Flash tween uses repeat:5 + yoyo:true = 6 visible oscillations before onComplete fires respawn()"

patterns-established:
  - "Death/respawn pattern: isDead flag + tween onComplete callback — reusable pattern for future damage/invincibility frames"

requirements-completed: [PLAY-05, PLAY-06]

# Metrics
duration: 5min
completed: 2026-03-25
---

# Phase 02 Plan 02: Player Death Detection and Respawn Summary

**Pit-fall death detection at y=620 with alpha flash tween (6 cycles) and respawn at SPAWN_X=100, SPAWN_Y=500 — fully self-contained in GameScene**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-25T14:20:00Z
- **Completed:** 2026-03-25T14:25:00Z
- **Tasks:** 1/1
- **Files modified:** 1

## Accomplishments

- Added `isDead: boolean = false` private field that gates both death re-trigger and all player input during animation
- Added pit detection guard in `update()` — fires `handleDeath()` when `player.y > 620` (below 600px canvas height)
- Added `handleDeath()` — stops momentum with `setVelocity(0, 0)` and starts alpha flash tween (duration 100ms, repeat 5, yoyo true, onComplete calls respawn)
- Added `respawn()` — resets position to SPAWN_X/SPAWN_Y, clears velocity, restores alpha=1, sets isDead=false

## Task Commits

Each task was committed atomically:

1. **Task 1: Add isDead flag, handleDeath() and respawn() to GameScene** - `9eb2b4d` (feat)

## Files Created/Modified

- `src/scenes/GameScene.ts` - Extended with isDead flag, pit detection in update(), handleDeath() flash tween, and respawn() reset

## Decisions Made

- isDead gate used instead of disabling physics body — simpler approach, no risk of physics body state getting stuck
- Player position not reset inside handleDeath() — only in respawn() after the tween completes, so the falling player is visible during flash
- setCollideWorldBounds(true) remains unchanged — world bounds still block left/right/top movement; falling through bottom is the intended kill plane behavior

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Death and respawn are fully functional and self-contained in GameScene
- isDead gate pattern can be extended for damage/invincibility frames in enemy collision (Phase 03+)
- Plan 03 (UIScene / HUD) can read currentLevel without any death/respawn interference

## Self-Check: PASSED

- FOUND: src/scenes/GameScene.ts
- FOUND: .planning/phases/02-player-core-mechanics/02-SUMMARY.md
- FOUND commit: 9eb2b4d (task commit)
- TypeScript: compiles clean (npx tsc --noEmit exits 0)
- Build: succeeds (npm run build exits 0)

---
*Phase: 02-player-core-mechanics*
*Completed: 2026-03-25*
