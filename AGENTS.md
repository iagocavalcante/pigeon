# AGENTS.md

Pigeon is an email marketing platform: manage contact lists, send tracked
email campaigns, and record opens/clicks/unsubscribes per lead.

## Layout

```
client/   Vue 3 + Vite SPA (ESM)
server/   Express 5 + Mongoose API (CommonJS)
```

Server, `server/src/`:
- `routes/` — thin route tables, one file per resource, wired in `routes/index.js`.
- `controllers/` — request handlers. Most resources reuse `GenericController`
  (`controllers/generic.js`) for CRUD; only `auth`, `leads`, `campaigns`, and
  `tracking` have custom logic.
- `models/` — Mongoose schemas (`user`, `list`, `lead`, `campaign`).
- `services/crud.js` — `CrudService`, the generic list/get/insert/update/delete
  used by `GenericController` and by campaign-specific extensions.
- `email/sender.js` — sends via Mailgun. `email/tracker.js` rewrites campaign
  body links to route through `/campaigns/tracking/click` and appends an open
  pixel pointing at `/campaigns/tracking/open`.
- `auth/` — Passport JWT strategy (`auth/strategies/jwt.js`).
- `db/connection.js` — Mongoose connection, reads `MONGODB_URI`.

Client, `client/src/`:
- `states/` — Vuex store (`index.js` + `modules/user.js`, `modules/email.js`).
- `router/`, `components/`, `App.vue`, `main.js`.

## Running locally

```bash
npm run install:all   # npm ci in server/ and client/
npm run db             # docker compose up -d mongodb
npm run dev:server     # nodemon on :3000
npm run dev:client     # vite dev server on :8080, proxies /api /oauth /campaigns to :3000
```

Copy `.env.example` to `.env` (or export the vars) before running the server;
see that file for what each variable does.

## Testing

```bash
npm test               # == npm test --prefix server (jest + supertest against a real MongoDB)
```

Server tests hit the real Express app (`server/app.js`) against
`MONGODB_URI` (defaults to `mongodb://localhost:27017/pigeon_test`), so
MongoDB must be running (`npm run db`) before `npm test`. There is no
client test suite wired up beyond a Nightwatch config (see Known gaps).

Definition of done: `npm test` green and `npm run build` green.

## Environment variables

See `.env.example` at the repo root: `MONGODB_URI`, `JWT_SECRET`,
`MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAIL_FROM`, `VITE_API_URL`, `PORT`.

## Conventions

- Server is CommonJS (`require`/`module.exports`); client is ESM (`import`/`export`).
- Server routes are async handlers (Express 5 forwards rejected promises to
  the error handler automatically — no need to wrap in try/catch just to call
  `next(err)`).
- New CRUD resources: add a Mongoose model, then wire it up with
  `GenericController` + `CrudService` (see `controllers/lists.js` for the
  minimal example) rather than writing bespoke handlers.
- Every route under `/api/*` is JWT-protected in bulk by
  `app.use('/api', passport.authenticate('jwt', {session: false}))` in
  `routes/index.js` — you don't add auth per-route under `/api`. Routes
  outside `/api` (`/oauth/*`, `/leads/subscribe`, `/campaigns/tracking/*`,
  `/campaigns/in-browser/*`) are public unless they opt into
  `passport.authenticate` themselves, as `/oauth/me` does.
- Validation on public POST endpoints uses `express-validator` v7
  (`body(...).isEmail()` etc. run as route middleware, checked with
  `validationResult(req)`); see `controllers/leads.js`.

## Known gaps

- **Passwords are stored and compared in plaintext** (`controllers/auth.js`
  `register`/`token`). This needs bcrypt hashing before this is safe for
  real users — do not treat current auth as production-secure.
- Nightwatch is configured (`client/test/e2e`) but no e2e tests are actually
  written or wired into CI.
- The `server/bin/send_email*.js` worker scripts are not tested and are not
  run by CI or the app itself; treat them as unmaintained until covered.
