# Platformer Game

## What This Is

A browser-based pixel art platformer game built with a modern web game framework. The player navigates through multiple levels, avoids or defeats enemies, and progresses through distinct stages. Designed to be shareable via GitHub Pages.

## Core Value

A playable, fun platformer that runs in the browser — levels with enemies and responsive pixel art movement that feels good to control.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Browser playable (no install required, deployable to GitHub Pages)
- [ ] Pixel art visual style with sprites and tiles
- [ ] Multiple levels (at least 2-3 distinct stages)
- [ ] Player movement — run, jump, with responsive arcade-feel controls
- [ ] Enemies — basic enemies the player can defeat or avoid
- [ ] Win/lose conditions per level
- [ ] Modern web game framework (Phaser 3)

### Out of Scope

- Sound / music — not requested, keeps scope lean
- Collectibles / coins — not requested for v1
- Mobile/touch controls — browser desktop focus
- Multiplayer — single player only
- Save system / persistence — prototype quality

## Context

- Greenfield project — building from scratch
- Target: GitHub Pages deployment (static web host)
- User wants modern framework — Phaser 3 is the standard 2025 choice for browser platformers
- Pixel art style — will need tileset and sprite assets (can use free CC0 assets)

## Constraints

- **Tech Stack**: Phaser 3 (modern web game framework) — user requirement
- **Platform**: Browser only, must work without a server (static files)
- **Deployment**: GitHub Pages compatible — no backend, pure client-side
- **Models**: Sonnet only — user specified no Opus for research/orchestration

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phaser 3 as framework | Industry standard 2025 browser game framework, canvas/WebGL, built-in arcade physics, tilemap support | — Pending |
| GitHub Pages deployment | User requested GitHub push and shareable URL | — Pending |
| Pixel art visual style | User selected — retro aesthetic, works well with Phaser sprite sheets | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-25 after initialization*
