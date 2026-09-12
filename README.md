# fishtheflats

Fish the Flats is a small web app for logging saltwater flats fishing catches and
tracking your best days on the water. It ships with an Express JSON API and a
lightweight vanilla-JS frontend.

## Requirements

- Node.js >= 20 (repo is developed against Node 22)
- npm

## Getting started

```bash
npm install     # install dependencies
npm start       # start the server on http://localhost:3000
npm test        # run the API test suite
npm run dev     # start with auto-reload (node --watch)
```

Then open http://localhost:3000 in your browser.

Catches are persisted to `data/catches.json` (created automatically and
git-ignored). Override the data directory with the `FTF_DATA_DIR` environment
variable and the port with `PORT`.

## API

| Method | Path                | Description                          |
| ------ | ------------------- | ------------------------------------ |
| GET    | `/api/health`       | Health check                         |
| GET    | `/api/species`      | List supported species              |
| GET    | `/api/catches`      | List catches (newest first)          |
| POST   | `/api/catches`      | Log a catch                          |
| DELETE | `/api/catches/:id`  | Remove a catch                       |
| GET    | `/api/stats`        | Totals, per-species counts, longest  |

Example:

```bash
curl -s -X POST http://localhost:3000/api/catches \
  -H 'Content-Type: application/json' \
  -d '{"species":"Bonefish","lengthIn":24.5,"spot":"Islamorada","angler":"Casey"}'
```

## Project layout

```
src/         Express app (app.js), server entrypoint (server.js), JSON store
public/      Static frontend (HTML/CSS/JS)
tests/       Jest + supertest API tests
.cursor/     Cloud Agent environment configuration
```

## Cloud Agent environment

`.cursor/environment.json` runs `npm ci` on setup and launches the dev server
(`npm start`) in a persistent `dev-server` terminal on port 3000.
