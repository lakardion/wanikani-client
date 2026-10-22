# SolidStart on Vercel: deployment and server-function facts

Research for lakardion/wanikani-client#2. All claims cite primary sources (SolidJS docs, Nitro/Vinxi/H3 docs and source, Vercel docs, npm registry). Researched against the repo as of `main` (SolidJS 1.9-era SPA: `vite@^8`, `vite-plugin-solid@^2.11`, `@tailwindcss/vite@^4`, Bun).

## Bottom line

- **Headline correction to the ticket's framing:** SolidStart **2.0.2** is now the latest stable (`@solidjs/start@latest`, published 2026-08-19). The "1.x" line tops out at **1.3.2**. v2 is a different architecture: a plain Vite plugin (`solidStart()`) plus a deployment plugin (`nitro()`), requiring **Vite 8 or 9** and **Node 24+** — both of which match this repo's current tooling (Vite 8, Vercel's default Node 24.x). v1 is Vinxi-based and pinned to **Vite 6 internally**, so the repo's `vite.config.ts` cannot be reused there.
- On Vercel, either version builds through **Nitro's `vercel` preset**, which emits a **Build Output API v3** bundle (`.vercel/output`) with **one serverless function** (`functions/__fallback.func`) that serves SSR, server functions, and API routes together — server functions do **not** become separate Vercel functions.
- The Hobby (free) tier comfortably fits this app: 1M function invocations/month, 300s max function duration, 4.5 MB request/response payload cap, 64 KB env vars. Two caveats worth knowing: Hobby is **non-commercial use only**, and LLM streaming responses hold a function open for their whole duration.
- Sessions for the Google-SSO gate are fully supported: `useSession` issues an **encrypted, signed, stateless cookie** — no database or external store required on serverless.

---

## 1. Nitro/Vinxi `vercel` preset: config, build output, detection

### SolidStart v1 (Vinxi)

Config lives in `app.config.ts` via `defineConfig` from `@solidjs/start/config`; the deployment target is set under the Nitro-backed `server` option:

```ts
// app.config.ts
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "vercel",
  },
});
```

Source: <https://docs.solidjs.com/solid-start/v1/reference/config/define-config> (lists `vercel` and `vercel-edge` presets and notes that some providers auto-detect, otherwise the preset must be set explicitly).

Nitro is a **zero-config provider** for Vercel: it auto-detects the Vercel CI environment and selects the `vercel` preset without configuration, or it can be forced with `NITRO_PRESET=vercel` / `SERVER_PRESET=vercel`. Sources: <https://nitro.build/deploy> ("Zero-Config Providers"), <https://nitro.build/deploy/providers/vercel>.

**Build output (Nitro v2 `vercel` preset):** emits a Vercel **Build Output API v3** bundle —

- `.vercel/output/functions/__fallback.func` — a single Node serverless function containing the whole Nitro server (extra per-route `.func` symlinks only appear for ISR route rules)
- `.vercel/output/static/` — static assets
- `config.json` with routes; deployable directly via `vercel deploy --prebuilt`

Source: preset definition in <https://github.com/nitrojs/nitro/blob/v2/src/presets/vercel/preset.ts> (`output.dir: "{{ rootDir }}/.vercel/output"`, `serverDir: ".../functions/__fallback.func"`, comment linking <https://vercel.com/docs/build-output-api/v3>).

### SolidStart v2 (Nitro v3 via Vite plugin)

Config moves back to `vite.config.ts`; `app.config.ts` is gone:

```ts
// vite.config.ts
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";

export default defineConfig({
  plugins: [solidStart(), nitro()],
  nitro: {
    preset: "vercel", // optional; Vercel is zero-config detected
  },
});
```

Sources: <https://docs.solidjs.com/solid-start/v2/guides/deployment-plugins>, <https://docs.solidjs.com/solid-start/v2/reference/entrypoints/vite-config>. The Nitro v3 Vercel provider page confirms zero-config deployment and adds v3-only options: per-route function overrides via `vercel.functionRules` (e.g. `maxDuration`, `memory`, `regions` per route pattern), Bun runtime (`vercel.functions.runtime: "bun1.x"`), CDN-level proxy offloading, cron and queues integration. Source: <https://nitro.build/deploy/providers/vercel>.

**Vercel-side detection:** Vercel's supported-framework list includes a **"SolidStart (v1)"** framework preset (auto-detected from project dependencies), so a v1 repo needs no manual build settings. Source: <https://vercel.com/docs/frameworks> (framework list with SolidStart v0/v1 entries and one-click templates). For v2, detection rides on the Nitro integration, which Vercel documents as zero-configuration: <https://vercel.com/docs/frameworks/backend/nitro>.

## 2. How server functions and API routes map to Vercel serverless functions

**Server functions (`"use server"`)** are compiled into RPC calls, not into standalone endpoints: the client stub `POST`s to an internal URL carrying a `server-action` header that identifies the function; a server-side handler (`handleServerAction`) dispatches it. Sources: <https://github.com/nksaraf/vinxi/blob/main/packages/vinxi-server-functions/client-runtime.js> and <https://github.com/nksaraf/vinxi/blob/main/packages/vinxi-server-functions/server-handler.js>. (In v1.3.x the compilation is done by `@tanstack/server-functions-plugin`, per `@solidjs/start@1.3.2`'s dependency list: <https://www.npmjs.com/package/@solidjs/start/v/1.3.2>.) Solid's own docs describe them as functions that "run exclusively on the server" and can be used as query fetchers / inside actions: <https://docs.solidjs.com/solid-start/v1/building-your-application/data-fetching>, <https://docs.solidjs.com/solid-start/v1/building-your-application/data-mutation>.

**Consequence for Vercel:** because the whole Nitro server is bundled into the single `__fallback.func` (see §1), every server-function RPC and every API route executes **inside that one serverless function**. You do not get one Vercel function per server function; invocations of SSR pages, `"use server"` calls, and API routes all count against the same function's limits and usage.

**API routes** are files under `src/routes/` (conventionally `src/routes/api/`) exporting handlers named after HTTP methods (`GET`, `POST`, …), receiving an `APIEvent` (`request`, `params`, internal `fetch`) and returning JSON or a `Response`. The docs explicitly call out "webhooks or auth callback handlers for OAuth" as a use case — relevant for the Google SSO callback. Source: <https://docs.solidjs.com/solid-start/v1/building-your-application/api-routes>. Note (Nitro v3 caveat, v2-only): the Nitro `/api` *server directory* convention isn't compatible with Vercel — use `routes/api/`, which is what SolidStart does anyway. Source: <https://nitro.build/deploy/providers/vercel>.

## 3. Free-tier (Hobby) limits that matter

From <https://vercel.com/docs/limits> and <https://vercel.com/docs/functions/limitations>:

| Limit | Hobby value | Relevance here |
| --- | --- | --- |
| Function invocations | 1M / month (usage summary) | Far above a single-user playground's needs |
| Active CPU / provisioned memory | 4 CPU-hrs and 360 GB-hrs / month | Fine for proxied LLM calls (CPU pauses during I/O wait under Fluid compute) |
| Max function duration | **300s default and max** (Fluid compute). Legacy projects deployed before 2025-04-23 without Fluid: 10s default, 60s max | LLM completions must fit in 300s including streaming; a streamed response holds the invocation open for its full duration |
| Max function memory | 2 GB | Ample |
| Request/response payload | **4.5 MB** per body; over-limit returns `413 FUNCTION_PAYLOAD_TOO_LARGE` | Caps very large LLM prompts/responses; relevant if big WaniKani payloads are ever sent through a server function |
| Env vars | 64 KB total per deployment (also per-variable max), up to 1000 per environment; scoped to Production/Preview/Development | Where `LLM_API_KEY` and `SESSION_SECRET` live |
| Fast Data Transfer | 100 GB / month | Non-issue |
| Deployments / builds | 100 deployments/day, 1 concurrent build | Non-issue |
| Commercial use | **Hobby is restricted to non-commercial, personal use** (<https://vercel.com/docs/plans/hobby>) | Confirm the project's usage qualifies |

Sources for the rows: invocations/CPU/memory/transfer — <https://vercel.com/docs/limits> ("Usage summary"); duration, memory, 4.5 MB payload, 413 error — <https://vercel.com/docs/functions/limitations>; env var size/count — <https://vercel.com/docs/environment-variables> and <https://vercel.com/docs/limits#environment-variables>.

**Env var handling:** set via dashboard/CLI (`vercel env pull` for local dev), scoped per environment, applied only to new deployments, encrypted at rest; safe for sensitive tokens. Source: <https://vercel.com/docs/environment-variables>. Vercel exposes framework-specific system env vars to SolidStart as `VITE_VERCEL_*` (e.g. `VITE_VERCEL_ENV`, `VITE_VERCEL_URL`, git metadata) at build and runtime. Source: <https://vercel.com/docs/environment-variables/framework-environment-variables>. Server-only secrets (the LLM key, session password) should be plain unprefixed vars read via `process.env` inside server functions only — never `VITE_`-prefixed, since Vite statically inlines those into the client bundle (this is Vite behavior, see <https://vite.dev/config/env-variables>; the SolidStart session docs likewise stress keeping the session password in a private env var: <https://docs.solidjs.com/solid-start/v1/advanced/session>).

## 4. Session/cookie support on Vercel serverless (Google SSO gate)

Fully supported, with no database:

- SolidStart exposes session helpers from `vinxi/http` (v1) / `@solidjs/start/http` (v2): `useSession`, `getSession`, `updateSession`, `clearSession`, usable only in server contexts (server functions, API routes). Source: <https://docs.solidjs.com/solid-start/v1/advanced/session>.
- `useSession` stores session data **encrypted and signed inside the cookie itself** (sealed with a password of ≥32 characters) and sets it via a `Set-Cookie` header — there is no server-side session store, so the mechanism is inherently stateless and works identically on serverless. Sources: <https://docs.solidjs.com/solid-start/v1/advanced/session>, <https://github.com/h3js/h3/blob/main/docs/4.examples/handle-session.md> (h3 is the underlying HTTP layer; the password "seals every session cookie"; ≥32-char random secret from an env var).
- For the SSO flow: put the OAuth callback in an API route (docs-sanctioned pattern, §2), verify the allowlisted email, then `session.update({ email })`; gate subsequent requests by reading `session.data` in server functions or middleware. `create-solid` ships `with-auth` / `with-authjs` templates for reference: <https://docs.solidjs.com/solid-start/v1/getting-started>.
- **Gotcha:** once SSR streaming begins, headers (including `Set-Cookie`) are already sent — session mutations/redirects inside server functions can then fail with `Cannot set headers after they are sent`. The documented fix is `createAsync(..., { deferStream: true })` for header-modifying queries. Source: <https://docs.solidjs.com/solid-start/v1/building-your-application/data-fetching>.

## 5. Migration surface from the current Vite SPA

Current repo state: `index.html` with `<div id="root">` + `src/index.tsx` calling `render(() => <App />, root)`; `vite.config.ts` with `solid()` + `tailwindcss()` plugins; app code in `src/App.tsx`, `src/components/`, `src/lib/`, `src/state.ts`, `src/index.css` (Tailwind 4 import).

**Carries over unchanged (both v1 and v2):** all Solid components, the `wanikani-sdk` usage in `src/lib/client.ts` (stays client-side; only the LLM-key logic moves into server functions), and the Tailwind 4 setup — `@tailwindcss/vite` supports Vite ^5.2/^6/^7/^8 across its 4.x releases (<https://www.npmjs.com/package/@tailwindcss/vite>), so it works both inside Vinxi's Vite 6 (v1, via the `vite` option in `app.config.ts`) and directly on the repo's Vite 8 (v2, as a normal plugin in `vite.config.ts`).

**Entry points — v1:** `index.html` and `src/index.tsx` are deleted and replaced by `src/app.tsx` (root shell with `<FileRoutes>`), `src/entry-client.tsx` (`mount(() => <StartClient />, ...)`), and `src/entry-server.tsx` (`createHandler(...)`); routes move to `src/routes/` file-based routing. Source: <https://docs.solidjs.com/solid-start/v1/getting-started> ("Project files"). `vite.config.ts` is replaced by `app.config.ts`; Vite plugins go under the `vite` option, which can be a function per Vinxi router (`server` / `client` / `server-function`). Source: <https://docs.solidjs.com/solid-start/v1/reference/config/define-config>.

**Entry points — v2:** `vite.config.ts` **stays** (add `solidStart()` + `nitro()`); routing is the same file-based `src/routes/` model with the same entry files. v2 requires **Vite 8 or 9** and **Node ≥24**. Sources: <https://docs.solidjs.com/solid-start/v2/getting-started>, <https://docs.solidjs.com/solid-start/v2/reference/entrypoints/vite-config>.

This repo is a single-screen playground with no client routing, so the routing migration is trivial: one `src/routes/index.tsx` holding today's `App`. The WaniKani API key stays in client-side code (`src/lib/storage.ts` / `ApiKeyBar.tsx` unchanged); only the LLM call moves behind a `"use server"` function.

## 6. SolidStart version currency and tooling gotchas

- **Latest stable: `@solidjs/start@2.0.2`** (2026-08-19); `latest` dist-tag points to 2.x. v1 line: latest **1.3.2**. Source: <https://www.npmjs.com/package/@solidjs/start?activeTab=versions> (dist-tags `latest: 2.0.2`; v1 releases end at 1.3.2). The docs site now maintains parallel `solid-start/v1` and `solid-start/v2` sections: <https://docs.solidjs.com/solid-start/v1>, <https://docs.solidjs.com/solid-start/v2>.
- **Solid 1.9 compatibility:** v2 lists `solid-js@^1.9.14` among its own dependencies and peers on `@solidjs/router >=0.16 <2` — it does **not** require Solid 2.0. Source: <https://www.npmjs.com/package/@solidjs/start/v/2.0.2>. The repo's `solid-js@^1.9.12` carries over; latest published is 1.9.15 (<https://www.npmjs.com/package/solid-js>).
- **Vite-era gotchas:**
  - v1's Vinxi stack internally depends on `vite@^6.4.1` and `nitropack@^2` (per `vinxi@0.5.11`: <https://www.npmjs.com/package/vinxi/v/0.5.11>). Vinxi drives the build itself, so the repo's Vite 8 install is unused by a v1 app — but nothing in the v1 toolchain can consume the current `vite.config.ts`; config must be re-expressed in `app.config.ts`. v2 peers on `vite ^8 || ^9` directly, matching this repo.
  - v2 requires **Node ≥24** locally and in CI (<https://docs.solidjs.com/solid-start/v2/getting-started>); Vercel's default Node.js version for new projects is **24.x** (<https://vercel.com/docs/functions/runtimes/node-js/node-js-versions>), so no override needed.
  - Serialization: v1 defaults server-function payloads to Seroval `js` mode, which uses `eval` on the client and needs `unsafe-eval` in any CSP; `json` mode is the CSP-safe option (and the v2 default). Set `serialization: { mode: "json" }` if a CSP is planned. Source: <https://docs.solidjs.com/solid-start/v1/reference/config/define-config#serialization>.
  - Streaming/headers caveat for sessions — see §4.
- **Bun as package manager:** supported both locally (v1 runs `bun create solid`; docs list bun commands throughout) and on Vercel, which detects `bun.lock`/`bun.lockb` and runs `bun install` (Bun ≥1.2 for text lockfiles). Source: <https://vercel.com/docs/package-managers>. The Bun *runtime* for functions is also available via `vercel.functions.runtime: "bun1.x"` in Nitro config, but the default Node runtime is fine.

**Recommendation for this repo:** migrate directly to **SolidStart v2** (`solidStart()` + `nitro()` in the existing `vite.config.ts`). It preserves the current config file, matches the repo's Vite 8, keeps Solid 1.9, defaults to the CSP-safe serializer, and deploys to Vercel via Nitro's zero-config `vercel` preset — avoiding a second migration off Vinxi/Vite 6 later. If the ticket's v1 constraint is deliberate (maturity, template ecosystem), everything in §§1–5 still applies as written.
