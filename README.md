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

Self-hosted via `deploy/docker-compose.prod.yml`: mongo, api, and web all
run with `network_mode: host`, bound to loopback on ports 27017, 3100, and
8098. Put a `.env` at the repo root (see `.env.example`), then run
`deploy/deploy.sh` to pull and rebuild. A Cloudflare tunnel points at
`127.0.0.1:8098` as the public front door. Set `ALLOW_REGISTRATION=false`
in `.env` once the first account exists.

## For AI agents

See [AGENTS.md](./AGENTS.md) for the codebase map, conventions, and known
gaps. `CLAUDE.md` in this repo just points there.

## License

MIT
