# Google SSO with a single-user allowlist on SolidStart v2

Research for lakardion/wanikani-client#3. Builds on `docs/research/solidstart-vercel.md` (branch `research/solidstart-vercel`): the app uses **SolidStart v2** (`@solidjs/start` 2.0.x, `solidStart()` + `nitro()` Vite plugins, Nitro `vercel` preset, Node 24) with no database. Every claim cites a primary source. Registry facts checked 2026-10-10.

## Bottom line

- **Hand-roll the OAuth flow.** It is about 80 lines across two API routes and one helper. It uses only Node's `crypto`, `fetch`, and SolidStart's own `useSession`. No auth dependency is needed.
- **Arctic is no longer an option.** Its author deprecated it on npm in July 2026 and points users to copy-paste example code instead (§1).
- **Auth.js and Better Auth are heavier than the problem.** The Auth.js SolidStart adapter is "experimental" and still peers on the pre-1.0 `solid-start` package. Better Auth works without a database but brings many dependencies and its own cookie set for a one-user gate (§1).
- **Session:** one `useSession` cookie (h3 iron seal: encrypted + signed, `Secure; HttpOnly; SameSite=Lax; Path=/` by default). It also holds the short-lived OAuth `state` and PKCE verifier during login, so there is only one cookie mechanism (§2).
- **Gate:** one `requireOwner()` call at the top of every `"use server"` function is the security boundary. Middleware redirects page loads to `/login` for UX only. The SolidStart docs say not to rely on middleware alone (§3).
- **Allowlist:** an `ALLOWED_EMAIL` env var, compared with the ID token's `email` only when `email_verified` is `true`. A non-allowed account gets no session and lands on `/login?error=not-allowed` with a "use another account" link (§4).
- **Google setup:** one "Web application" OAuth client, scopes `openid email`. Redirect URIs must match exactly and cannot use wildcards, so per-commit Vercel preview URLs cannot sign in. Register production + localhost, and add a branch URL only when a preview needs a login (§5).

---

## 1. Library options

| Option                                                        | Current state                                                                                                                                                                                                                                                                               | Fit for one provider, one user                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Hand-rolled OAuth 2.0 + PKCE**                              | Uses Web/Node built-ins only                                                                                                                                                                                                                                                                | Best fit. Two routes, one token request, no dependency.                                                         |
| **Arctic** (`arctic@3.7.0`)                                   | **Deprecated on npm** ("Package no longer supported"). Last release 2025-05-21. README: "Arctic was deprecated on July 2026."                                                                                                                                                               | Do not adopt.                                                                                                   |
| **Auth.js** (`@auth/core@0.41.3`, `@auth/solid-start@0.19.3`) | SolidStart integration listed as "Experimental release". `@auth/solid-start` peers on `solid-start ^0.2.14` (the pre-1.0 package), not `@solidjs/start`. The community `@solid-mediakit/auth@3.1.3` peers on `@solidjs/start ^1` + `vinxi` (v1 only). Auth.js "is now part of Better Auth". | Poor fit for v2.                                                                                                |
| **Better Auth** (`better-auth@1.7.7`)                         | Maintained. Has a `better-auth/solid-start` handler. Turns on stateless mode when no database is configured.                                                                                                                                                                                | Works, but large for this: zod, kysely, jose and more. Uses several cookies. The allowlist needs a custom hook. |

Sources:

- Arctic deprecation: npm registry `npm view arctic` (`deprecated` field, release times); README at <https://github.com/pilcrowonpaper/arctic>; announcement at <https://pilcrowonpaper.com/blog/18>. The author says OAuth 2.0 "is a poor layer to abstract" and keeps only `@oslojs/encoding` maintained. `@oslojs/crypto` and `@oslojs/jwt` carry the same npm deprecation.
- Replacement example code (0BSD licensed, free to copy): <https://github.com/pilcrowonpaper/arctic/tree/main/code> (`authorization_request-pkce.ts`, `authorization_code_exchange-pkce.ts`). It uses Google's endpoints as its example. It calls `Uint8Array.prototype.toHex/toBase64`, which it says need Node 25. On Vercel's Node 24, use `Buffer#toString("base64url")` / `crypto.randomBytes` instead.
- Auth.js integration status: <https://authjs.dev/getting-started/integrations>. Peer ranges: `npm view @auth/solid-start peerDependencies`, `npm view @solid-mediakit/auth peerDependencies`.
- Better Auth stateless mode: <https://better-auth.com/docs/concepts/session-management> ("the server never queries a database to validate sessions"; caveat: "you can't invalidate session easily"). SolidStart handler: <https://www.better-auth.com/docs/integrations/solid-start>. Hook-based email restriction example: <https://better-auth.com/docs/concepts/hooks>.

## 2. Session strategy on Vercel serverless

SolidStart v2 re-exports h3 v2 helpers from `@solidjs/start/http` (server-only). The 2.0.6 package exports `useSession`, `getSession`, `updateSession`, `clearSession`, `sealSession`, `getCookie`, `setCookie`, `deleteCookie`, `getQuery`, `getRequestURL` (checked in `dist/http/http.d.ts` of `@solidjs/start@2.0.6`). `@solidjs/start@2.0.6` depends on `h3 ^2.0.1-rc.26`.

Facts from the h3 source (<https://github.com/h3js/h3/blob/main/src/utils/session.ts>, `src/utils/internal/session.ts`):

- The session lives entirely in the cookie, sealed with iron-crypto (encrypted + signed). There is no server store, so it is stateless and works on any serverless function.
- `password` "Must be at least 32 characters" and should come from a random source, e.g. `crypto.randomBytes(32).toString("base64")`, because "a stolen cookie can be brute-forced offline".
- Default cookie: `{ path: "/", secure: true, httpOnly: true, sameSite: "lax" }`. Default name: `h3`.
- `maxAge` is an absolute lifetime in seconds. `idleTimeout` gives a sliding lifetime. Neither has a default, so set `maxAge` explicitly.

SolidStart's v2 session page shows the same API, a private `SESSION_SECRET` env var, and `secure` set only in production: <https://docs.solidjs.com/solid-start/v2/advanced/session>.

**`SameSite=Lax` works for the callback.** Google returns the user with a top-level `GET` navigation, and browsers send Lax cookies on top-level `GET` navigations. So the same session cookie can carry `state` + `codeVerifier` from `/auth/login` to `/auth/callback`.

**Env vars** (all server-only, never `VITE_`-prefixed; see the prior research §3):

| Var                    | Value                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | From the OAuth client                                                  |
| `GOOGLE_CLIENT_SECRET` | From the OAuth client                                                  |
| `SESSION_SECRET`       | `openssl rand -base64 32` (≥32 chars). Rotating it signs everyone out. |
| `ALLOWED_EMAIL`        | The owner's Google address                                             |

Set them per environment in Vercel (Production / Preview / Development); `vercel env pull` brings them to local dev. Source: <https://vercel.com/docs/environment-variables>.

## 3. Gating routes and server functions

The SolidStart v2 docs are explicit:

- Middleware: "Do not rely on middleware alone for authorization." Client-side navigation can reuse data and server functions without a page request, so check auth "near each protected query, action, or API route." Source: <https://docs.solidjs.com/solid-start/v2/advanced/middleware>.
- Register middleware with `solidStart({ middleware: "./src/middleware/index.ts" })`. Use `createMiddleware` from `@solidjs/start/middleware`. Return a `Response` (or `redirect()` from `@solidjs/router`) before `next()` to stop the chain. Same source.
- Server functions: check the user inside the function and return `null` or throw. Routes: check in the data query and `throw redirect("/login")`, with `createAsync(..., { deferStream: true })` so the redirect happens before streaming starts. Source: <https://docs.solidjs.com/solid-start/v2/advanced/auth>.

Recommended layout for this app:

1. **`requireOwner()`** in `src/lib/auth.ts`: reads the session and throws a 401 `Response` if `session.data.email !== ALLOWED_EMAIL`. Call it on the first line of every `"use server"` function (the LLM generate and grade calls). This is the real security boundary.
2. **Middleware** for page `GET`s: if there is no session, redirect to `/login`. It skips `/login` and `/auth/*`. This gives the redirect on first load in one place. It is a UX layer, not the boundary.
3. No per-route `query` guard is needed. The app's only server data is the LLM calls, and they are already guarded. The WaniKani data is fetched in the browser with the client-side key.

The `deferStream` caveat from the prior research §4 does not apply here: login and logout happen in API routes, not in streamed SSR.

## 4. Allowlist mechanics and failure UX

**Env var over config constant.** Both are one line. The env var keeps the owner's address out of a public repo, and it can differ per Vercel environment. The check is `email_verified === true && email.toLowerCase() === ALLOWED_EMAIL.toLowerCase()`.

**Claims to trust** (Google OIDC docs, <https://developers.google.com/identity/openid-connect/openid-connect>):

- `email_verified`: "True if the user's email address has been verified". Reject when it is false.
- `sub` is the stable identifier: "Always use the `sub` field as it is unique to a Google Account even if the user changes their email address." The `email` "may not be unique to this account and could change over time." For a single owner with a Gmail address, the email check is enough. Pinning `sub` instead (an `ALLOWED_SUB` env var) is the stricter variant.
- `hd`: "Don't rely on this UI optimization to control who can access your app." Not needed here.

**ID token validation.** The code exchange goes straight to `https://oauth2.googleapis.com/token` over HTTPS. Google says that in this case "you can be confident that the token you receive really comes from Google and is valid", and that you must validate ID tokens "unless you know that they came directly from Google". So the callback can decode the JWT payload (base64url of the middle segment) without fetching JWKS. Still check `aud === GOOGLE_CLIENT_ID`. Same source.

**CSRF and code injection.** Send `state` (Google: "Optional, but strongly recommended") and PKCE `S256` (listed in Google's discovery document under `code_challenge_methods_supported`, <https://accounts.google.com/.well-known/openid-configuration>). Google's parameter table also marks `nonce` as required, but the same page describes it as applying "when present". `nonce` adds nothing over PKCE + `state` in the code flow, but it costs one line, so send it and compare it to keep to Google's table.

**Failure UX for a non-allowed account:**

- Do not write `email` to the session. Clear the temporary `state`/verifier.
- Redirect to `/login?error=not-allowed`. The page shows "This Google account does not have access" and a sign-in button.
- Always send `prompt=select_account` so Google shows the account chooser: "The authorization server prompts the user to select a user account." This lets the owner pick the right account on a browser with several Google accounts. Optionally send `login_hint=<ALLOWED_EMAIL>` to preselect it; the value "can be either an email address or the `sub` string". Same source.

## 5. Google Cloud setup

In the Google Cloud console (Google Auth Platform):

1. Create a project. Set **Audience** to **External**. **Internal** needs a Google Cloud Organization, which a personal Gmail account does not have.
2. Request only `openid` and `email`. These are basic profile scopes. Google's help page says that for apps that request "a subset of the following: name, email address, and user profile", users "are not required to be on the trusted user list" and "their authorizations will not expire after 7 days". So the app can stay in **Testing** or be published **In production** with no verification. Testing does **not** restrict which accounts can sign in for these scopes, so the app's allowlist is the only gate. Source: <https://support.google.com/cloud/answer/15549945>.
3. Create an OAuth client of type **Web application**. JavaScript origins are not needed for a server-side flow. Add **Authorized redirect URIs**:
   - `https://<production-domain>/auth/callback`
   - `http://localhost:<dev-port>/auth/callback`
4. Put the client ID and secret into Vercel env vars (§2).

**Redirect URI rules** (<https://developers.google.com/identity/protocols/oauth2/web-server>, <https://developers.google.com/identity/openid-connect/openid-connect>):

- Must "exactly match one of the authorized redirect values", including scheme, case, and trailing `/`. A mismatch gives `redirect_uri_mismatch`.
- HTTPS only, except localhost. No raw IPs except localhost. No wildcards (`*`), fragments, userinfo, or path traversal. The host TLD must be on the public suffix list (`vercel.app` is).

**Preview deployments.** Vercel gives each commit `<project>-<unique-hash>-<scope>.vercel.app` (new every push) and each branch `<project>-git-<branch>-<scope>.vercel.app` (it "won't change if you push new commits"). Source: <https://vercel.com/docs/deployments/generated-urls>. Since Google allows no wildcards:

- Per-commit URLs can never sign in.
- A branch URL can sign in after you add its exact callback to the OAuth client. Do this only for a branch that needs a working preview.
- On any other preview, `requireOwner()` fails closed (401). The app is still safe, but its LLM features do not work there.
- Build the `redirect_uri` from the request origin (`getRequestURL()`). Google rejects any origin that is not registered, so a spoofed `Host` header cannot redirect the code elsewhere.

Previews also sit behind Vercel's own **Standard Protection** if it is enabled. Standard Protection "protects all deployments except production domains", and Vercel Authentication is available on all plans: <https://vercel.com/docs/deployment-protection>. Since 2026-09-09, Vercel Authentication can also protect **production** at no cost on every plan, but new projects do not get it automatically: <https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan>.

## 6. Sketch

Approximate shape for the spec, not tested code. Routes are SolidStart API routes (`export function GET`).

```ts
/** src/lib/auth.ts */
import { useSession } from "@solidjs/start/http";

type AuthSession = { email?: string; state?: string; verifier?: string; nonce?: string };

export const authSession = () =>
  useSession<AuthSession>({
    name: "auth",
    password: process.env.SESSION_SECRET!,
    maxAge: 60 * 60 * 24 * 30,
    cookie: { secure: process.env.NODE_ENV === "production" },
  });

/** Call first in every "use server" function. */
export async function requireOwner() {
  const s = await authSession();
  if (s.data.email !== process.env.ALLOWED_EMAIL!.toLowerCase())
    throw new Response("Unauthorized", { status: 401 });
}
```

```ts
/** src/routes/auth/login.ts */
import { createHash, randomBytes } from "node:crypto";
import { getRequestURL } from "@solidjs/start/http";
import { authSession } from "~/lib/auth";

export async function GET() {
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const nonce = randomBytes(16).toString("base64url");
  await (await authSession()).update({ state, verifier, nonce });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: new URL("/auth/callback", getRequestURL()).href,
    scope: "openid email",
    state,
    nonce,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return Response.redirect(url, 302);
}
```

```ts
/** src/routes/auth/callback.ts */
import { getQuery, getRequestURL } from "@solidjs/start/http";
import { authSession } from "~/lib/auth";

export async function GET() {
  const { code, state } = getQuery();
  const session = await authSession();
  const { state: expected, verifier, nonce } = session.data;
  await session.update({ state: undefined, verifier: undefined, nonce: undefined });
  const fail = (e: string) => Response.redirect(new URL(`/login?error=${e}`, getRequestURL()), 302);
  if (!code || !verifier || state !== expected) return fail("invalid-state");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: String(code),
      code_verifier: verifier,
      redirect_uri: new URL("/auth/callback", getRequestURL()).href,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) return fail("token");

  /** Signature check is skipped: the token came directly from Google's token endpoint over TLS. */
  const { id_token } = await res.json();
  const claims = JSON.parse(Buffer.from(id_token.split(".")[1], "base64url").toString());
  const email = String(claims.email ?? "").toLowerCase();
  const ok =
    claims.aud === process.env.GOOGLE_CLIENT_ID &&
    claims.nonce === nonce &&
    claims.email_verified === true &&
    email === process.env.ALLOWED_EMAIL!.toLowerCase();
  if (!ok) return fail("not-allowed");

  await session.update({ email });
  return Response.redirect(new URL("/", getRequestURL()), 302);
}
```

Logout: a `POST /auth/logout` route that calls `session.clear()` and redirects to `/login`.

Unverified details to confirm while building:

- Whether `Response.redirect` keeps the `Set-Cookie` that `session.update` queued on the h3 event in SolidStart v2 API routes. If it does not, return `redirect()` from `@solidjs/router`, or build `new Response(null, { status: 302, headers: { Location } })`.
- The dev server port for the localhost redirect URI.
</content>

</invoke>
