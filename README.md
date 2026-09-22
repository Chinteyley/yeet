# yeet

last click owns the page. no accounts. no money. just a name on a throne until someone else yeets.

## run locally

```bash
npm install
npm run dev -- --port 43147
```

open [http://127.0.0.1:43147](http://127.0.0.1:43147).

local throne state is a file under `.data/` unless you attach redis.

## production store

preferred (and required on vercel) store is **upstash redis** (`@upstash/redis`).

set these on the vercel project for `yeet` (marketplace injects them if you run `vercel integration add upstash`):

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

the older `KV_REST_API_URL` / `KV_REST_API_TOKEN` names also work.

**production fails closed** without those credentials. there is no baked-in public json-bin fallback. a misconfigured deploy returns `503` on claims and an empty throne rather than writing to a world-writable url.

`YEET_JSON_URL` is an explicit local / self-host opt-in only. it is ignored on vercel. do not point production at a public json bin.

after cutting over, rotate or empty the old public json bin so leftover throne json is not sitting on a writable url. do that from your own ops session; this repo no longer knows that url.

## claim controls

throne claims stay public by default. the site posts to `/api/throne` and anyone can yeet.

optional env:

- `YEET_CLAIM_TOKEN` — if set, `POST /api/throne` requires it (`x-yeet-claim-token` or `Authorization: Bearer`). if unset, no secret is invented and the public game keeps working. leave this unset on the live yeet. do not put the token in a `NEXT_PUBLIC_*` var.
- `YEET_ALLOWED_ORIGINS` — extra allowed `Origin` values (comma-separated). the request host, `https://yeet.ctey.dev`, and `VERCEL_URL` are always allowed.

origin rule for mutations: a present `Origin` must match that allowlist. a **missing** `Origin` is not treated as allow. only `Sec-Fetch-Site` of `same-origin`, `same-site`, or `none` is accepted without `Origin`. cross-site and opaque non-browser posts without those headers are rejected.

rate limit: `20` claims / `60s` per client ip. redis/upstash is the control on vercel. an in-memory bucket exists only for local runs without redis. do not treat in-memory limits as the production control.

## domain

prefer `yeet.ctey.dev` if the `ctey.dev` zone is already on vercel (same pattern as `neko.ctey.dev` and `pocket-no.ctey.dev`). otherwise the `*.vercel.app` url is the live app.

```bash
vercel domains add yeet.ctey.dev yeet
```

if vercel does not manage dns for `ctey.dev`, add a cname:

```
yeet  CNAME  cname.vercel-dns.com
```
