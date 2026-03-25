# Requirements: Platformer Game

**Defined:** 2026-03-25
**Core Value:** A playable, fun browser platformer with pixel art, multiple levels, and enemies that feels good to control.

## v1 Requirements

### Project Setup

- [x] **SETUP-01**: Phaser 3 project scaffolded with modern build tooling (Vite)
- [ ] **SETUP-02**: Project deployable to GitHub Pages as static files
- [ ] **SETUP-03**: GitHub repository with automated deploy workflow (GitHub Actions)

### Player

- [x] **PLAY-01**: Player character renders as a pixel art sprite
- [x] **PLAY-02**: Player can move left and right with keyboard input
- [x] **PLAY-03**: Player can jump (single jump) with keyboard input
- [x] **PLAY-04**: Player has gravity and lands on platforms
- [x] **PLAY-05**: Player can die (fall into pit, touched by enemy)
- [x] **PLAY-06**: Player respawns at level start on death

### Levels

- [ ] **LVL-01**: At least 3 distinct levels defined as tilemaps
- [ ] **LVL-02**: Level has platforms, ground, and gaps/pits
- [ ] **LVL-03**: Level has a start point and a goal/exit
- [ ] **LVL-04**: Completing goal advances player to next level
- [ ] **LVL-05**: After all levels, a simple win screen is shown

### Enemies

- [ ] **ENMY-01**: At least one enemy type that patrols platforms
- [ ] **ENMY-02**: Player can defeat enemy by jumping on top of it
- [ ] **ENMY-03**: Player dies if touching enemy from the side or below
- [ ] **ENMY-04**: Enemies render as pixel art sprites

### UI

- [x] **UI-01**: Main menu with "Play" button
- [x] **UI-02**: Game over screen with "Retry" button
- [x] **UI-03**: HUD shows current level number

## v2 Requirements

### Gameplay Depth

- **V2-01**: Collectible coins or gems per level
- **V2-02**: Score or coin count on HUD
- **V2-03**: Multiple enemy types with different behaviors
- **V2-04**: Moving platforms

### Polish

- **V2-05**: Sound effects (jump, death, enemy defeat)
- **V2-06**: Background music
- **V2-07**: Animated tiles or parallax scrolling backgrounds
- **V2-08**: Level transition animation

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile/touch controls | Desktop browser focus for v1 |
| Save/load game state | Prototype scope, no backend |
| Multiplayer | Single player only |
| Level editor | Out of v1 scope |
| Leaderboard | Requires backend |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 1 | Complete (plan 01-01) |
| SETUP-02 | Phase 1 | Pending |
| SETUP-03 | Phase 1 | Pending |
| PLAY-01 | Phase 2 | Complete |
| PLAY-02 | Phase 2 | Complete |
| PLAY-03 | Phase 2 | Complete |
| PLAY-04 | Phase 2 | Complete |
| PLAY-05 | Phase 2 | Complete |
| PLAY-06 | Phase 2 | Complete |
| LVL-01 | Phase 3 | Pending |
| LVL-02 | Phase 3 | Pending |
| LVL-03 | Phase 3 | Pending |
| LVL-04 | Phase 3 | Pending |
| LVL-05 | Phase 3 | Pending |
| ENMY-01 | Phase 3 | Pending |
| ENMY-02 | Phase 3 | Pending |
| ENMY-03 | Phase 3 | Pending |
| ENMY-04 | Phase 3 | Pending |
| UI-01 | Phase 2 | Complete |
| UI-02 | Phase 2 | Complete |
| UI-03 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after initial definition*
