# Iron Man

A canvas side-scroller built with Vite and TypeScript. Fly, dodge buildings, planes, and clouds, collect energy tokens, and shoot blasts.

Play it here: [https://nik00did.github.io/iron-man_game_version_2.0/](https://nik00did.github.io/iron-man_game_version_2.0/)

Version **2.1**. Author: [nik00did](https://github.com/nik00did).

## Play

- **Arrows** — move
- **Enter** — start
- **Space** — shoot (ammo from energy tokens, up to 3)
- **P** or **Escape** — pause / resume

Score is flight time plus collected tokens. The sky and obstacle speed step up every 40 seconds.

## Setup

Requires Node.js 22.

```bash
npm install
npm run dev
```

Then open the local Vite URL (usually `http://localhost:5173/`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local Vite server |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier |

CI on `main` also deploys the production build to GitHub Pages.
