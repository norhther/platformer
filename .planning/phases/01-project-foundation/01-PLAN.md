---
phase: 01-project-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - vite.config.ts
  - tsconfig.json
  - index.html
  - src/main.ts
  - src/scenes/BootScene.ts
autonomous: true
requirements:
  - SETUP-01

must_haves:
  truths:
    - "Running `npm run dev` starts a local dev server without errors"
    - "Browser shows a Phaser canvas at 800x600 pixels with a visible background color"
    - "TypeScript compiles without errors"
    - "Phaser 3 is importable and Game instance initializes successfully"
  artifacts:
    - path: "package.json"
      provides: "Project metadata and npm scripts"
      contains: "\"phaser\""
    - path: "vite.config.ts"
      provides: "Vite build configuration"
      contains: "defineConfig"
    - path: "tsconfig.json"
      provides: "TypeScript compiler configuration"
      contains: "\"strict\": true"
    - path: "index.html"
      provides: "HTML entry point"
      contains: "src/main.ts"
    - path: "src/main.ts"
      provides: "Phaser Game instantiation"
      contains: "new Phaser.Game"
    - path: "src/scenes/BootScene.ts"
      provides: "Initial scene for the game"
      contains: "extends Phaser.Scene"
  key_links:
    - from: "index.html"
      to: "src/main.ts"
      via: "script type=module src"
      pattern: "src/main.ts"
    - from: "src/main.ts"
      to: "src/scenes/BootScene.ts"
      via: "scene array in Phaser.Game config"
      pattern: "BootScene"
---

<objective>
Scaffold a Phaser 3 + Vite + TypeScript project from scratch that runs in the browser with a visible canvas.

Purpose: Establish the working dev environment that all subsequent game phases build upon.
Output: A runnable local dev server showing a Phaser canvas, with TypeScript configured and Phaser 3 installed.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Initialize Vite + TypeScript project with Phaser 3</name>
  <files>package.json, vite.config.ts, tsconfig.json, index.html</files>
  <read_first>
    - Check if package.json exists: if present read it first; if absent scaffold fresh.
    - Check if index.html exists at project root.
  </read_first>
  <action>
    Run the following commands sequentially:

    ```bash
    npm create vite@latest . -- --template vanilla-ts --yes 2>/dev/null || true
    npm install phaser@3
    npm install --save-dev vite typescript
    ```

    If `npm create vite` fails because the directory is non-empty, manually create the files below.

    **package.json** — ensure these scripts exist (merge with existing if file already present):
    ```json
    {
      "name": "platformer",
      "version": "0.1.0",
      "scripts": {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview"
      },
      "dependencies": {
        "phaser": "^3.60.0"
      },
      "devDependencies": {
        "typescript": "^5.0.0",
        "vite": "^5.0.0"
      }
    }
    ```

    **vite.config.ts** — create at project root:
    ```typescript
    import { defineConfig } from 'vite';

    export default defineConfig({
      base: './',
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
      },
    });
    ```

    Note: `base: './'` is mandatory so GitHub Pages serves asset paths correctly (relative, not absolute).

    **tsconfig.json** — create at project root:
    ```json
    {
      "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "outDir": "dist"
      },
      "include": ["src"]
    }
    ```

    **index.html** — create at project root (replace any vite-generated placeholder):
    ```html
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Platformer</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
        </style>
      </head>
      <body>
        <script type="module" src="/src/main.ts"></script>
      </body>
    </html>
    ```

    Delete any auto-generated files that conflict: `src/counter.ts`, `src/style.css`, `src/typescript.svg`, `public/vite.svg` (if present).
  </action>
  <verify>
    <automated>node -e "const pkg = require('./package.json'); if (!pkg.dependencies.phaser) throw new Error('phaser missing'); console.log('OK: phaser', pkg.dependencies.phaser);"</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` contains `"phaser"` key under `dependencies`
    - `vite.config.ts` contains `base: './'`
    - `tsconfig.json` contains `"strict": true`
    - `index.html` contains `src="/src/main.ts"`
    - `node_modules/phaser` directory exists after `npm install`
  </acceptance_criteria>
  <done>All config files created, phaser installed, index.html points to src/main.ts</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create BootScene and Phaser Game entry point</name>
  <files>src/main.ts, src/scenes/BootScene.ts</files>
  <read_first>
    - Read `src/main.ts` if it already exists (vite scaffold may have created it).
    - Read `src/scenes/BootScene.ts` if it already exists.
  </read_first>
  <action>
    Create `src/scenes/BootScene.ts`:
    ```typescript
    export default class BootScene extends Phaser.Scene {
      constructor() {
        super({ key: 'BootScene' });
      }

      create(): void {
        // Solid background colour to confirm canvas is rendering
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Placeholder text — replaced in Phase 2 with a real main menu
        const { width, height } = this.scale;
        this.add
          .text(width / 2, height / 2, 'Platformer\n(Phase 1 — Canvas OK)', {
            fontSize: '24px',
            color: '#e0e0e0',
            align: 'center',
          })
          .setOrigin(0.5);
      }
    }
    ```

    Create `src/main.ts` (overwrite any vite-generated placeholder):
    ```typescript
    import Phaser from 'phaser';
    import BootScene from './scenes/BootScene';

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: '#1a1a2e',
      scene: [BootScene],
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

    Arcade physics gravity is pre-configured here so Phase 2 player tasks inherit the correct gravity value (300 px/s²) without needing to revisit the config.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `src/main.ts` contains `new Phaser.Game`
    - `src/main.ts` contains `BootScene`
    - `src/scenes/BootScene.ts` contains `extends Phaser.Scene`
    - `src/scenes/BootScene.ts` contains `super({ key: 'BootScene' })`
    - `npm run build` exits with code 0 (no TypeScript or Vite errors)
    - `dist/index.html` exists after build
  </acceptance_criteria>
  <done>TypeScript compiles, Vite build succeeds, dist/ contains output. `npm run dev` serves a page with a dark canvas and "Platformer" text.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify local dev server shows Phaser canvas</name>
  <what-built>Vite dev server serving Phaser 3 game with BootScene canvas</what-built>
  <how-to-verify>
    1. Run `npm run dev` in the project root
    2. Open the URL printed in the terminal (typically http://localhost:5173)
    3. Confirm: dark (#1a1a2e) canvas appears, text "Platformer" is visible
    4. Open browser DevTools console — confirm zero errors
    5. Stop the server (Ctrl+C)
  </how-to-verify>
  <resume-signal>Type "approved" if canvas and text are visible with no console errors, or describe any issues seen.</resume-signal>
</task>

</tasks>

<verification>
- `npm run build` exits 0
- `dist/index.html` exists
- `dist/assets/` contains bundled JS
- `src/main.ts` imports Phaser and instantiates `Phaser.Game` with 800x600 config
- `src/scenes/BootScene.ts` extends `Phaser.Scene` and renders text in `create()`
</verification>

<success_criteria>
- `npm run dev` starts without errors and browser shows a Phaser canvas
- `npm run build` produces a `dist/` folder with all static files
- TypeScript strict mode passes with zero errors
- Canvas renders at 800x600 with visible content (dark background + text)
</success_criteria>

<output>
After completion, create `.planning/phases/01-project-foundation/01-SUMMARY.md` documenting:
- Files created and their purpose
- Phaser version installed
- Key config choices (canvas size, physics gravity, Vite base path)
- Any deviations from the plan
</output>
