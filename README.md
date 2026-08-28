# yeet

last click owns the page. no accounts. no money. just a name on a throne until someone else yeets.

## run locally

```bash
npm install
npm run dev -- --port 43147
```

open [http://127.0.0.1:43147](http://127.0.0.1:43147).

## production store

vercel kv is gone. preferred store is **upstash redis** (`@upstash/redis`).

set these on the vercel project (marketplace injects them if you run `vercel integration add upstash`):

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

the older `KV_REST_API_URL` / `KV_REST_API_TOKEN` names also work.

until redis is attached, production uses a durable http json bin (`YEET_JSON_URL`, default baked in). every visitor still sees the same throne.

## domain

prefer `yeet.ctey.dev` if the `ctey.dev` zone is already on vercel (same pattern as `neko.ctey.dev` and `pocket-no.ctey.dev`). otherwise the `*.vercel.app` url is the live app.

```bash
vercel domains add yeet.ctey.dev yeet
```

if vercel does not manage dns for `ctey.dev`, add a cname:

```
yeet  CNAME  cname.vercel-dns.com
```
