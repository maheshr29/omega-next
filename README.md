# omega-next

Three-folder commerce monorepo:

- **`frontend/`** — Next.js 16 storefront. Atomic-design components, SWR-ready, Tailwind. Talks to the backend over HTTP (no upstream credentials live here).
- **`backend/`** — Node Hono service. Owns every third-party integration (SAP Commerce, Contentful, …). One folder per vendor with the same internal shape: `routes/ apis/ mappers/ schemas/ interfaces/ utils/`.
- **`types/`** — TypeScript-only shared contracts (`Product`, `PageContent`, `HomePage`, etc.). No `package.json`. Consumed via `tsconfig.paths`: `@Types/*` in backend, `@shared/types/*` in frontend.

No workspace tooling — each app installs and deploys independently.

## Repository layout

```
omega-next/
├─ frontend/                              # Next.js 16 storefront
│  └─ src/
│     ├─ app/                             # App Router pages, layouts
│     ├─ components/                      # ⭐ atomic design
│     │  ├─ atoms/        (Skeleton)
│     │  ├─ molecules/    (ProductCard)
│     │  ├─ organisms/    (Header, Footer, HomeHero, FeaturedProducts, …)
│     │  └─ pages/        (Home/sectionMap, …)
│     ├─ lib/api/bff/                     # typed HTTP client → backend
│     ├─ instrumentation.ts
│     └─ middleware.ts                    # x-request-id propagation
├─ backend/                               # Node Hono service
│  ├─ src/
│  │  ├─ server.ts                        # local dev entry (Node listener on :4000)
│  │  ├─ app.ts                           # Hono app wiring (CORS, request-id, routes)
│  │  ├─ commerce-sap/                    # SAP Commerce vendor (routes/apis/mappers/schemas/interfaces/utils)
│  │  ├─ content-contentful/              # Contentful vendor (same shape)
│  │  ├─ webhooks/                        # contentful + sap-commerce signature-verified receivers
│  │  ├─ http/with-bff.ts                 # zod validation + structured logging wrapper
│  │  ├─ cache/{tags,store}.ts            # tag vocabulary + in-memory invalidation
│  │  ├─ observability/logger.ts          # JSON structured logger
│  │  ├─ config/env.ts                    # zod-validated env
│  │  ├─ lib/webhook.ts                   # signature verification
│  │  ├─ errors.ts                        # BffError hierarchy
│  │  └─ middlewares/                     # request-id, request-logger, error-handler, cache-control
│  └─ api/[[...route]].ts                 # Vercel serverless catch-all (wraps the Hono app)
└─ types/                                 # shared TS types — no package.json
   ├─ product/   content/   header/   footer/
   ├─ helpSection/   heroBanner/   industrySection/
   ├─ featuredProductsSection/   homePage/
   └─ error/
```

## Boundary rules

- **Frontend never imports from `backend/`** — only `@shared/types/*` crosses the boundary. The BFF client at `frontend/src/lib/api/bff/` is the only path to backend data.
- **Backend never imports from `frontend/`** — same.
- **Vendor folders inside backend may import each other** — e.g. a commerce route can call into `Content-contentful/apis/...` if a domain needs both upstream systems. The hard boundary is `frontend/`↔`backend/`, not inside `backend/`.
- **Adapter clients (`utils/occ-client.ts`, `utils/contentful-client.ts`) never import shared types.** They return raw upstream shapes from `interfaces/`. Mappers translate to `@Types/*`.

## Local development

```powershell
# One-time install per folder
cd frontend; npm install
cd ..\backend; npm install

# Run both (two terminals)
cd backend;  npm run dev     # http://localhost:4000 — Hono + tsx watch
cd frontend; npm run dev     # http://localhost:3000 — Next.js
```

Health check: <http://localhost:4000/health>
Sample BFF call: <http://localhost:4000/bff/homepage>

### Environment files

| File | Purpose |
| --- | --- |
| `frontend/.env.local` | `NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:4000` plus any `NEXT_PUBLIC_*` |
| `backend/.env` | All upstream credentials — Contentful (space, tokens, entry id), SAP Commerce (OAuth + base URL), webhook secrets. `dotenv` loads this in dev. |

See `frontend/.env.example` and `backend/.env.example` for the full list.

## BFF endpoints

| Method | Path | Source |
| --- | --- | --- |
| GET  | `/health` | — |
| GET  | `/bff/homepage` | Contentful |
| GET  | `/bff/content/:slug` | Contentful |
| GET  | `/bff/products?q=&category=&page=&pageSize=&sort=` | SAP Commerce |
| GET  | `/bff/products/:code` | SAP Commerce |
| POST | `/webhooks/contentful` | Contentful (signed) |
| POST | `/webhooks/sap-commerce` | SAP Commerce (signed) |

All read endpoints return `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` so Vercel's edge cache (or any CDN) holds responses between invocations. Webhook handlers invalidate via `cacheTags.*` + `purgeTag()`.

## Deployment (Vercel, two projects)

| Vercel project | Root directory | Framework |
| --- | --- | --- |
| `omega-next-frontend` | `frontend/` | Next.js (auto-detected) |
| `omega-next-backend`  | `backend/`  | Other (custom) — uses `api/[[...route]].ts` |

The backend is deployed as a serverless function: Vercel uses `backend/api/[[...route]].ts` as the entry, which wraps the Hono `app` via `hono/vercel`. The local `server.ts` (the Node listener) is ignored by Vercel.

GitHub Actions (`.github/workflows/ci.yml`) runs `verify` (lint + typecheck + build) for both apps on every PR, and on push to `main` runs the `deploy` matrix job which uses the Vercel CLI to ship each app to Production. Required repo secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_FRONTEND_PROJECT_ID`, `VERCEL_BACKEND_PROJECT_ID`.

### Custom domains

- Production frontend: `omega.com`
- Production backend: `api.omega.com`

After domains are mapped in Vercel, set `ALLOWED_ORIGINS=https://omega.com` on the backend Production env so CORS only accepts the storefront origin.

### Webhook URLs

After the first prod deploy, repoint:

- Contentful → `https://api.omega.com/webhooks/contentful`
- SAP Commerce → `https://api.omega.com/webhooks/sap-commerce`

Both must send `x-webhook-secret: <CONTENTFUL_WEBHOOK_SECRET / SAP_COMMERCE_WEBHOOK_SECRET>` (constant-time compared in `backend/src/lib/webhook.ts`).

## Adding a new BFF endpoint

1. Define the response type in `types/<domain>/index.ts`.
2. Pick the vendor folder (e.g. `backend/src/commerce-sap/` for SAP-sourced).
3. Add a Zod schema in `<vendor>/schemas/<name>.ts`.
4. Add the service in `<vendor>/apis/<name>.ts` (calls the adapter, maps via `<vendor>/mappers/<name>.ts`).
5. Add the Hono route in `<vendor>/routes/<name>.ts` using `withBff()` — three lines.
6. Mount the route in `backend/src/app.ts`.
7. Add a method on the frontend BFF client in `frontend/src/lib/api/bff/<name>.ts` and re-export from `index.ts`.

## Adding a new third-party integration

Copy a vendor folder (`backend/src/commerce-sap/` or `content-contentful/`) and rename. The internal shape (`routes/ apis/ mappers/ schemas/ interfaces/ errors/ utils/`) is the same for every vendor — no folder-layout decisions needed.

## Scripts

Each app has the same script names:

| Script | What it does |
| --- | --- |
| `npm run dev`        | local dev server (Next.js / Hono via tsx watch) |
| `npm run build`      | production build |
| `npm run start`      | run the production build |
| `npm run lint`       | ESLint |
| `npm run typecheck`  | `tsc --noEmit` |
| `npm run format`     | Prettier write |
| `npm run format:check` | Prettier check |

## Caching & invalidation

In-memory `CacheStore` (`backend/src/cache/store.ts`) holds upstream responses by key with a tag index. Webhook handlers call `purgeTag(cacheTags.product(code))` — the store removes every entry with that tag. The in-memory store does NOT survive across Vercel serverless invocations; the edge `Cache-Control` headers are the primary cross-invocation cache. Promote `CacheStore` to Upstash Redis when hit-rate matters.
