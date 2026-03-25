# Roadmap: Platformer Game

**Milestone:** v1.0 — Playable browser platformer with pixel art, 3 levels, enemies
**Granularity:** Coarse
**Model profile:** Budget (Haiku)

---

## Phase 1: Project Foundation

**Goal:** Phaser 3 project running in the browser, deployable to GitHub Pages.

**Why this first:** Nothing else can be built without a working dev environment and deploy pipeline. Getting GitHub Pages live early means every subsequent phase is immediately shareable.

### Plans

#### 1.1 — Scaffold Phaser 3 + Vite project [COMPLETE - 2026-03-25]
- Initialize Vite project with Phaser 3 as a dependency
- Configure TypeScript (optional but preferred for a game project)
- Set up `index.html` entry point and basic Phaser game config (canvas, dimensions)
- Verify local dev server runs: `npm run dev`
- SUMMARY: /Users/norhther/platformer/.planning/phases/01-project-foundation/01-SUMMARY.md

#### 1.2 — GitHub Pages deploy pipeline
- Create GitHub repository
- Add GitHub Actions workflow: push to `main` → build → deploy to `gh-pages` branch
- Verify deploy works: game URL is live

**Success criteria:**
- [x] `npm run dev` starts a local server with a Phaser canvas visible and correctly centered (plan 1.1 complete)
- [ ] Pushing to `main` triggers GitHub Actions and deploys to GitHub Pages (plan 1.2)
- [ ] Live URL loads the game in a browser (plan 1.2)

**Requirements covered:** SETUP-01, SETUP-02, SETUP-03

---

## Phase 2: Player & Core Mechanics

**Goal:** A controllable pixel art player character with gravity, jumping, and a basic UI.

**Why this second:** Core feel of a platformer lives entirely in player movement. Getting this right before building levels means levels can be designed around real movement characteristics.

### Plans

#### 2.1 — Player sprite and movement
- Add a pixel art player sprite (use a free CC0 asset, e.g. from itch.io or OpenGameArt)
- Implement left/right movement with keyboard (arrow keys + WASD)
- Implement single jump (Space or Up arrow)
- Add Phaser Arcade physics: gravity, ground collision

#### 2.2 — Player death and respawn
- Detect fall-into-pit (player.y > world bounds)
- Implement death state and respawn at level start position
- Add a simple death animation or flash effect

#### 2.3 — UI: Main menu, HUD, Game Over
- Main menu scene with "Play" button
- HUD overlay: current level number (top-left)
- Game Over scene with "Retry" button that restarts the current level

**Success criteria:**
- [ ] Player moves left/right and jumps with keyboard
- [ ] Player falls and lands on platforms via Arcade physics
- [ ] Player dies falling into a pit, respawns at start
- [ ] Main menu → Play → Game → Game Over → Retry flow works
- [ ] HUD shows level number

**Requirements covered:** PLAY-01, PLAY-02, PLAY-03, PLAY-04, PLAY-05, PLAY-06, UI-01, UI-02, UI-03

---

## Phase 3: Levels & Enemies

**Goal:** Three complete levels with tile-based maps, an enemy type, and a win condition.

**Why this last:** Levels are content — they can only be designed meaningfully once player movement is locked in. Enemies layered on top of working levels keeps each piece independently testable.

### Plans

#### 3.1 — Tilemap levels (3 levels)
- Create 3 levels as JSON tilemaps (use Tiled editor or hand-craft)
- Source a free pixel art tileset (e.g. 16x16 tiles from OpenGameArt)
- Each level has: ground, platforms at different heights, gaps/pits
- Each level has a start point and a goal object (flag, door, star)
- Reaching goal advances to next level; after level 3, show Win screen

#### 3.2 — Enemy: patrol + defeat
- Add a basic patrol enemy sprite (free CC0 asset)
- Enemy walks back and forth on a platform, reverses at edges
- Player defeats enemy by landing on top (stomp mechanic)
- Player dies if touching enemy from side or below
- At least 2 enemies per level

#### 3.3 — Win screen and level progression
- Win screen shown after completing level 3
- "Play Again" button restarts from level 1
- Level number increments correctly on the HUD through all 3 levels

**Success criteria:**
- [ ] 3 distinct levels load from tilemap data
- [ ] Each level has a reachable goal that advances to next level
- [ ] Enemies patrol and can be defeated by stomping
- [ ] Player dies on enemy side/bottom contact
- [ ] Win screen shows after level 3 with Play Again option

**Requirements covered:** LVL-01, LVL-02, LVL-03, LVL-04, LVL-05, ENMY-01, ENMY-02, ENMY-03, ENMY-04

---

## Summary

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| 1 | Foundation | Phaser 3 + GitHub Pages live |
| 2 | Core Mechanics | Playable player with UI |
| 3 | Content | 3 levels + enemies + win condition |

**Total v1 requirements:** 21
**Covered by roadmap:** 21 ✓

---
*Roadmap created: 2026-03-25*
*Milestone: v1.0 browser platformer*
