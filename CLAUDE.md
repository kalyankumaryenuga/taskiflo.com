# Taskiflo — CLAUDE.md

Approval-first AI marketing automation for Shopify stores. Merchants connect their store, and the app drafts social posts, Gmail replies, and product campaigns that sit in an approval inbox until the merchant acts.

## Architecture

Two processes, one repository:

- **Frontend** — React + TypeScript + Vite SPA (`src/`). Runs on `http://127.0.0.1:5173` in dev.
- **API proxy** — Node.js ESM server (`server.mjs`). Runs on `http://127.0.0.1:8787` in dev. Holds all secret keys (OpenAI, Shopify, OAuth credentials). The browser never touches these keys directly.

Production is a static Vite build deployed to Vercel. The `vercel.json` rewrites all paths to `index.html` for client-side routing. The API proxy is a separate service (not deployed as a Vercel function; run it separately or host on a Node-compatible platform).

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19, TypeScript strict, Vite |
| Styling | Plain CSS with CSS custom properties (`src/styles.css`) |
| Icons | lucide-react |
| Auth + DB | Supabase (`@supabase/supabase-js`) |
| AI | OpenAI Responses API (structured JSON output via `json_schema`) |
| Integrations | Shopify Admin GraphQL, Meta OAuth, Google OAuth, TikTok OAuth |
| Linting | ESLint with typescript-eslint + react-hooks + react-refresh |
| Testing | Playwright installed, no test files exist yet |

## Development

```bash
npm install         # install all dependencies
npm run dev         # start Vite (5173) + API proxy (8787) concurrently
npm run build       # tsc type-check then vite build
npm run lint        # eslint across ts/tsx files
npm run preview     # preview the production build locally
```

`scripts/dev.mjs` spawns both `dev:api` and `dev:vite` as child processes and pipes their stdout with `[api]` / `[vite]` prefixes. Killing one kills both.

## Environment variables

Copy `.env.example` to `.env.local`. The API proxy loads `.env` then `.env.local` at startup. Vite reads `VITE_*` vars automatically.

| Variable | Used by | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | Supabase anon key |
| `VITE_OPENAI_PROXY_URL` | Frontend | API proxy base URL (defaults to 8787 in dev) |
| `OPENAI_API_KEY` | API proxy | OpenAI Responses API |
| `OPENAI_MODEL` | API proxy | Defaults to `gpt-4.1-mini` |
| `TASKIFLO_APP_URL` | API proxy | Full public URL of the proxy (for OAuth redirect URIs) |
| `SHOPIFY_CLIENT_ID` | API proxy | Shopify app client ID |
| `SHOPIFY_CLIENT_SECRET` | API proxy | Shopify app client secret (used for HMAC verification) |
| `SHOPIFY_SCOPES` | API proxy | Defaults to `read_products,read_inventory` |
| `SHOPIFY_API_VERSION` | API proxy | Defaults to `2026-04` |
| `GOOGLE_CLIENT_ID` | API proxy | Google OAuth for Gmail |
| `GOOGLE_SCOPES` | API proxy | Defaults to gmail.compose + gmail.send |
| `META_CLIENT_ID` | API proxy | Meta OAuth for Instagram/Facebook |
| `META_API_VERSION` | API proxy | Defaults to `v22.0` |
| `TIKTOK_CLIENT_KEY` | API proxy | TikTok OAuth |

Without Supabase env vars, the app runs in **demo mode**: auth is simulated and state persists to `localStorage` only.

## Client-side routing

No router library. Routing is a single `getRoute()` function in `src/App.tsx` that reads `window.location.pathname`. Add new routes by:
1. Adding the route string to the `Route` type.
2. Adding a `path === '/new-path'` branch in `getRoute()`.
3. Returning the new page component from `App()`.

| Path | Component |
|---|---|
| `/` | `HomePage` |
| `/privacy` | `PolicyPage` (kind=privacy) |
| `/terms` | `PolicyPage` (kind=terms) |
| `/data-deletion` | `DataDeletionPage` |
| `/support` | `SupportPage` |
| `/faq` | `FaqPage` |
| `/app-store-assets` | `AssetsPage` |

## State and persistence

`src/lib/taskifloStore.ts` owns all persistence logic via three exported functions:

- `readLocalSnapshot(defaults)` — reads from `localStorage` with `taskiflo.*` keys, falls back to `marketpilot.*` legacy keys, then to defaults.
- `writeLocalSnapshot(snapshot)` — writes the full `AppSnapshot` to `localStorage`.
- `syncSnapshotToSupabase(snapshot)` — upserts the business profile and inserts content drafts when Supabase is configured and a user is signed in.

`AppSnapshot` (defined in `src/lib/types.ts`) is the single state shape: website URL, approval toggle, campaign mode, profile fields, approval items, and integration connection flags.

Legacy `marketpilot.*` keys exist for backward compatibility with the previous app name.

## API proxy endpoints

All endpoints live in `server.mjs`. CORS is locked to `http://127.0.0.1:5173`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns `{ ok: true }` |
| `POST` | `/api/analyze-website` | Fetches a URL, strips HTML, calls OpenAI, returns brand tone + drafts |
| `POST` | `/api/engagement/reply` | Generates a draft reply to a customer comment or DM |
| `GET` | `/api/shopify/products` | Fetches the 12 most recently updated Shopify products via Admin GraphQL |
| `GET` | `/api/shopify/connect?shop=` | Starts Shopify OAuth — returns `{ authorizationUrl }` |
| `GET` | `/api/shopify/callback` | Handles Shopify OAuth callback, exchanges code, saves token to `.taskiflo/shopify-connections.json` |
| `GET` | `/api/integrations/connect?provider=` | Starts OAuth for Gmail, Meta, or TikTok |
| `GET` | `/api/integrations/callback/:provider` | Receives OAuth callback, redirects to frontend with status |

### OpenAI integration

Uses the Responses API (`POST /v1/responses`), not Chat Completions. Responses are requested with `text.format.type = "json_schema"` for strict structured output. Do not switch to Chat Completions without updating the response parsing (`data.output_text` path).

### Shopify OAuth security

`verifyShopifyCallback()` in `server.mjs` uses `timingSafeEqual` HMAC verification on the callback query string. Never skip or weaken this check. Pending OAuth states expire after 10 minutes.

## Database schema

Schema lives in `supabase/schema.sql`. Apply it to a new Supabase project via the SQL editor.

Key tables and their relationships:

```
auth.users
  └── businesses (owner_id → auth.users.id)
        ├── website_analyses
        ├── integrations (provider: gmail | google_sheets | instagram | facebook_meta | tiktok | shopify)
        ├── products (shopify_product_id for Shopify-sourced products)
        ├── content_drafts (status: needs_approval → approved → scheduled → posted/sent)
        ├── automations (approval_required always defaults true)
        ├── automation_runs
        └── audit_events
```

All tables have Row Level Security enforced — policies check `owner_id = auth.uid()` through the `businesses` join. Never disable RLS.

`content_drafts.status` lifecycle: `needs_approval` → `approved` → `scheduled` → `posted` or `sent`. The `draft` status is for manually-created items not yet submitted for approval.

## Supabase client

`src/lib/supabase.ts` exports `supabase` (the typed client) and `isSupabaseConfigured` (boolean). All code that needs Supabase must guard with `if (!isSupabaseConfigured || !supabase)` to support demo mode. Auth functions are in `src/lib/auth.ts`.

## Styling conventions

- All styles are in `src/styles.css` — no CSS modules, no Tailwind.
- CSS custom properties are defined on `:root` (dark navy + cyan palette).
- Layout uses CSS Grid and Flexbox — no utility classes.
- Key design tokens: `--ink`, `--muted`, `--line`, `--panel`, `--cyan`, `--blue`, `--navy`, `--success`.
- Add new component styles at the bottom of `styles.css` using descriptive class names.

## TypeScript conventions

- Strict mode is on — no `any`, no non-null assertions without justification.
- All component props are typed inline as object destructuring parameters (no separate `Props` type unless reused).
- The `Database` type in `src/lib/types.ts` is the Supabase type definition — it drives the typed client.
- `src/` is the only directory compiled by TypeScript (`tsconfig.app.json`).
- `server.mjs` is plain ESM JavaScript — no TypeScript compilation needed.

## Code conventions

- No comments by default. Only add one when the WHY is non-obvious.
- No CSS-in-JS, no styled-components, no inline styles (except where unavoidable).
- Components are plain functions — no class components, no `React.FC`.
- Icons from `lucide-react` — pass `size` and no other props unless needed.
- `LegalShell` is the shared wrapper for all legal/support pages — use it for any new standalone page that needs the header and footer.

## Deployment

```bash
npm run build   # outputs to dist/
```

Push to the connected Vercel project. `vercel.json` handles SPA routing. The API proxy must be hosted separately — it is not included in the Vercel deployment.

## Shopify and Meta app submission pages

The public site doubles as the app store submission package:

- `/privacy` — Privacy Policy (effective May 21, 2026)
- `/terms` — Terms of Service
- `/data-deletion` — Data Deletion Instructions (email `support@taskiflo.com`)
- `/faq` — FAQ
- `/support` — Support + reviewer testing instructions
- `/app-store-assets` — Copy-pasteable values for Shopify and Meta submission forms

Do not change the effective date or support email without updating both the page content and the submission materials.
