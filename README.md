# omega-next

Large-scale Next.js 16 storefront with a **Backend-for-Frontend (BFF)** layer fronting **Contentful** (CMS) and **SAP Commerce** (PIM/cart). Architected for many domains, many teams, and long-lived schemas.

## Layered architecture

```
         ┌──────────────────────────────────────┐
Browser ─►   /api/bff/*  (Route Handlers)        │
         │   • zod validation, requestId, logs   │
         │   • uniform error envelope            │
         └──────────────┬───────────────────────┘
                        ▼
              server/domains/<domain>/         use-cases, DTO mapping, schemas
                        │
                        ▼
              server/adapters/<system>/        Contentful / OCC clients,
                                              raw upstream types only
```

The frontend depends only on `@/contracts/*`. Domains depend on adapters. Adapters know about upstream systems but never about contracts. Contracts are the wire format — change them deliberately.

## Folder layout

```
src/
├─ app/
│  ├─ (storefront)/                    # route groups for marketing/PDP/PLP — add as needed
│  ├─ api/
│  │  ├─ bff/                          # public BFF endpoints (typed, validated)
│  │  │  ├─ products/route.ts          # GET /api/bff/products
│  │  │  ├─ products/[code]/route.ts   # GET /api/bff/products/[code]
│  │  │  ├─ content/[slug]/route.ts    # GET /api/bff/content/[slug]
│  │  │  └─ health/route.ts
│  │  └─ webhooks/                     # cache invalidation hooks
│  │     ├─ contentful/route.ts
│  │     └─ sap-commerce/route.ts
│  ├─ layout.tsx
│  └─ page.tsx
│
├─ contracts/                          # ⭐ public BFF contract — types only, no runtime deps
│  ├─ product.ts
│  ├─ content.ts
│  └─ error.ts
│
├─ server/                             # server-only code (guarded with `import "server-only"`)
│  ├─ domains/                         # ⭐ business domains — co-located service/mapper/schema
│  │  ├─ product/
│  │  │  ├─ product.service.ts         # use-cases (getByCode, search…)
│  │  │  ├─ product.mapper.ts          # OCC → contract DTO
│  │  │  └─ product.schema.ts          # zod request schemas
│  │  └─ content/
│  │     ├─ content.service.ts
│  │     ├─ content.mapper.ts
│  │     └─ content.schema.ts
│  ├─ adapters/                        # ⭐ upstream I/O, swappable
│  │  ├─ sap-commerce/
│  │  │  ├─ occ.client.ts              # OAuth, fetch, retry on 401
│  │  │  └─ occ.types.ts               # raw OCC shapes (internal)
│  │  └─ contentful/
│  │     └─ contentful.client.ts
│  ├─ http/
│  │  └─ handler.ts                    # withBff() wrapper — validation, requestId, errors
│  ├─ cache/
│  │  └─ tags.ts                       # cacheTags vocabulary for revalidateTag()
│  ├─ observability/
│  │  └─ logger.ts                     # JSON structured logger w/ child bindings
│  ├─ config/
│  │  └─ env.ts                        # zod-validated process.env
│  └─ errors.ts                        # BffError, ValidationError, NotFoundError, UpstreamError
│
├─ features/                           # ⭐ frontend features (UI + hooks per domain)
│  └─ product/
│     └─ components/ProductCard.tsx
│
├─ components/ui/                      # generic primitives (Skeleton, Button…)
└─ lib/
   └─ bff-client.ts                    # typed fetcher around /api/bff
```

## Conventions

- **Frontend never imports from `@/server/*`.** It imports types from `@/contracts/*` and uses `@/lib/bff-client`.
- **Domains never import from other domains' internals.** If two domains share logic, lift it to a sibling under `server/` or expose it via a service.
- **Adapters never import contracts.** They speak raw upstream types; mapping is the domain's job.
- **All routes use `withBff(schemas, handler)`.** Routes don't read `request.json()` or call `NextResponse.json` directly.
- **Cache tags come from `cacheTags`.** Never write inline tag strings.
- **Errors throw `BffError` subclasses** — `withBff` maps them to a uniform envelope.

## Adding a new BFF endpoint

1. Add types to `src/contracts/<domain>.ts` (or extend an existing file).
2. Add a service function in `src/server/domains/<domain>/<domain>.service.ts`.
3. Add a zod request schema in `<domain>.schema.ts`.
4. Add the route file under `src/app/api/bff/...` — three lines using `withBff`.
5. Add a method on `bff` in `src/lib/bff-client.ts`.

## Setup

```powershell
Copy-Item .env.example .env.local
# fill in Contentful + SAP Commerce credentials, then:
npm install
npm run dev
```

Sanity-check: <http://localhost:3000/api/bff/health>

## BFF endpoints

| Method | Path                                                            | Source        |
| ------ | --------------------------------------------------------------- | ------------- |
| GET    | `/api/bff/health`                                               | —             |
| GET    | `/api/bff/products?q=&category=&page=&pageSize=&sort=`          | SAP Commerce  |
| GET    | `/api/bff/products/[code]`                                      | SAP Commerce  |
| GET    | `/api/bff/content/[slug]`                                       | Contentful    |
| POST   | `/api/webhooks/contentful`                                      | Contentful    |
| POST   | `/api/webhooks/sap-commerce`                                    | SAP Commerce  |

## Caching & invalidation

Every upstream fetch is tagged using `cacheTags.*` and has a TTL. To invalidate from a webhook:

```ts
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/server/cache/tags";

revalidateTag(cacheTags.product("apparel-100"));
```

Webhook secrets — set `CONTENTFUL_WEBHOOK_SECRET` and `SAP_COMMERCE_WEBHOOK_SECRET` and configure the upstream system to send `x-webhook-secret`.

## Calling the BFF

```tsx
// Server component — uses bff-client over HTTP for a uniform contract.
import { bff } from "@/lib/bff-client";

export default async function PDP({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const product = await bff.getProduct(code);
  return <pre>{JSON.stringify(product, null, 2)}</pre>;
}
```

For server components in the same Next.js process you may also call domain services directly (e.g. `import { getProductByCode } from "@/server/domains/product/product.service"`) and skip the HTTP hop. Use the BFF client when you want a single uniform contract everywhere (microfrontends, mobile apps, server-component fetches with consistent caching headers).

## Scripts

- `npm run dev` — local dev (Turbopack)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint
