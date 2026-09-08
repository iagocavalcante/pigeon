# Pigeon 🐦

Email marketing platform: manage contact lists, send tracked email
campaigns, and record opens/clicks/unsubscribes per lead. Vue 3 client,
Express + MongoDB API.

## Quick start

```bash
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, Mailgun creds, etc.
npm run install:all    # npm ci in server/ and client/
npm run db              # docker compose up -d mongodb
npm run dev:server      # API on :3000
npm run dev:client      # SPA on :8080 (proxies /api, /oauth, /campaigns to :3000)
```

## Architecture

- `client/` — Vue 3 + Vite SPA, Vuex for state, Materialize CSS.
- `server/` — Express 5 + Mongoose API. Routes → controllers → a generic
  `CrudService` for standard resources (lists, leads, campaigns); custom
  logic for auth, lead subscription, and campaign open/click tracking.
- MongoDB stores users, lists, leads, and campaigns.

## Testing

```bash
npm test   # jest + supertest against a real MongoDB (npm run db first)
```

## Deployment

Both apps deploy to Fly.io: `server/fly.toml` (`pigeon-api`) and
`client/fly.toml` (`pigeon-web`, served via the nginx config in
`client/nginx.conf`). `fly.mongo.toml` documents the Mongo data volume.
Deploy each app with `fly deploy` from its directory.

## For AI agents

See [AGENTS.md](./AGENTS.md) for the codebase map, conventions, and known
gaps. `CLAUDE.md` in this repo just points there.

## License

MIT
