# Shadcn port for Solid on Tailwind v4 and SolidStart v2

Research for lakardion/wanikani-client#11. The target stack is in [`docs/spec/v1.md`](../spec/v1.md) and [`solidstart-vercel.md`](solidstart-vercel.md): SolidStart v2 in SPA mode (`solidStart({ ssr: false })` + `nitro()`), Vite 8, `solid-js` 1.9, Tailwind v4 through `@tailwindcss/vite`, Bun.

All facts come from the project repos on GitHub (source, issues, PRs, commit history), the npm registry, and the live registry endpoints. Read on **2026-10-22**. A local install test on this repo's `package.json`, `tsconfig*.json`, and `vite.config.ts` backs the install steps (§7).

## Bottom line

- **Two real candidates.** [solid-ui](https://github.com/stefan-karger/solid-ui) (solid-ui.com, 1,550 stars) and [shadcn-solid](https://github.com/hngngn/shadcn-solid) (shadcn-solid.netlify.app, 768 stars). Both are copy-in component sets on **Kobalte** for most parts and **corvu** for the drawer. Other ports found on GitHub have fewer than 15 stars (§1).
- **Primitives are compatible.** `@kobalte/core@0.13.14` peers `solid-js ^1.9.8`. `@solidjs/start@2.1.0` peers `solid-js ^1.9.15`. So SolidStart v2 stays on Solid 1.9 and Kobalte 0.13 fits it (§3).
- **solid-ui works with the official `shadcn` CLI on Tailwind v4.** Its registry at `https://www.solid-ui.com/r/<name>.json` serves Tailwind v4 classes. `shadcn@4.22.1 add <url>` installed all v1 components into this repo's setup, and `tsc -b` and `vite build` passed (§7). Its own `solidui-cli` still writes a Tailwind v3 config and fails under Bun (§2).
- **shadcn-solid is Tailwind v4 too, but copy-paste only.** Its owner cancelled the CLI in September 2025. It has no `sheet` component (§2, §4).
- **Neither ships a spinner.** Both ship `skeleton`. A spinner is a few lines (§4).
- **Both are slow now.** solid-ui `main` has one commit since June 2025. The owner waits for Solid 2, but a community `dev` branch and open PRs (#237, #239) are active this month. shadcn-solid's last `main` commit is 2026-02-13 and its PRs are closed to the public (§6).
- **Recommendation:** use **solid-ui components through the official `shadcn` CLI**, with a hand-written `components.json`. Do not use `solidui-cli`. Steps are in §8.

---

## 1. Candidates

|                | solid-ui                                                                             | shadcn-solid                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo           | [stefan-karger/solid-ui](https://github.com/stefan-karger/solid-ui)                  | [hngngn/shadcn-solid](https://github.com/hngngn/shadcn-solid)                                                                                                 |
| Docs           | <https://www.solid-ui.com>                                                           | <https://shadcn-solid.netlify.app> (shadcn-solid.com answers HTTP 429 from a Caddy server; the repo's homepage field and issue #183 point to the Netlify URL) |
| Stars          | 1,550                                                                                | 768                                                                                                                                                           |
| Primitives     | `@kobalte/core`, `@corvu/*` (drawer, calendar, otp-field, resizable), `solid-sonner` | `@kobalte/core`, `@corvu/*` (drawer, calendar, otp-field, resizable)                                                                                          |
| Variant helper | `class-variance-authority`                                                           | `cva@beta` (1.0.0-beta.12)                                                                                                                                    |
| Install        | Official `shadcn` CLI with registry URLs, or `solidui-cli`, or copy                  | Copy-paste only (`npx shadcn-solid` 0.7.7 is from 2025-03-26 and the CLI is cancelled)                                                                        |
| Tailwind v4    | Registry: yes. `solidui-cli init`: no (v3)                                           | Yes (docs install page is v4 CSS-first); UnoCSS variant also offered                                                                                          |

Sources: repo metadata from `GET /repos/<owner>/<repo>`; primitives from `grep` of imports in `apps/docs/src/registry/ui/*.tsx` (shadcn-solid) and `apps/docs/registry.json` (solid-ui); npm versions from `npm view`.

Other ports: `gh search repos "shadcn solid"` lists [vgerbot-libraries/shadcn-solid-components](https://github.com/vgerbot-libraries/shadcn-solid-components) (12 stars), [ptzburn/shadcn-solidjs](https://github.com/ptzburn/shadcn-solidjs) (4), [Prestgg1/shadcn-solid](https://github.com/Prestgg1/shadcn-solid) (1), and others with 0 to 8 stars. None has a docs site or release history worth a bet. Ark UI (`@ark-ui/solid@5.39.3`, active) is a primitives library, not a shadcn port.

## 2. Install path

### solid-ui

Three paths exist:

- **Official `shadcn` CLI with registry URLs (works).** solid-ui publishes a shadcn-schema registry. [`apps/docs/registry.json`](https://github.com/stefan-karger/solid-ui/blob/main/apps/docs/registry.json) uses `$schema: https://ui.shadcn.com/schema/registry.json`, and the built items are live, for example <https://www.solid-ui.com/r/button.json> (HTTP 200). PR #186 "Adding Tailwind V4 & Shadcn Registry" added this. The owner's [solid-ui-shadcn-example](https://github.com/stefan-karger/solid-ui-shadcn-example) shows the setup: a hand-written `components.json` with `tailwind.config: ""` (Tailwind v4 mode) and `~/` aliases, on Tailwind 4.1.
- **`solidui-cli` (do not use).** [`docs/installation/vite.mdx`](<https://github.com/stefan-karger/solid-ui/blob/main/apps/docs/src/routes/(app)/docs/installation/vite.mdx>) still says `npm install -D tailwindcss@3`, and [`docs/cli.mdx`](<https://github.com/stefan-karger/solid-ui/blob/main/apps/docs/src/routes/(app)/docs/cli.mdx>) says `init` "configures `tailwind.config.cjs`". Issue [#227](https://github.com/stefan-karger/solid-ui/issues/227) (open) shows `bunx solidui-cli@latest init` runs `bun add '' tailwindcss-animate ...` and fails with "unrecognised dependency format". Open PR [#238](https://github.com/stefan-karger/solid-ui/pull/238) fixes the empty argument. Open PR [#239](https://github.com/stefan-karger/solid-ui/pull/239) moves `init` to Tailwind v4 and SolidStart 2. Neither is merged.
- **Copy the source** from the docs site or from the registry JSON `files[].content`.

The registry's `css` item (<https://www.solid-ui.com/r/css.json>) adds only the extra tokens (`info`, `success`, `warning`, `error`, `radius`) and Kobalte keyframes. It writes `@custom-variant dark (&:is(.dark *));`. It does not add the base shadcn tokens (`background`, `primary`, ...) and does not add a `cn` util. You add those by hand (§8).

### shadcn-solid

[`content/docs/installation.mdx`](https://github.com/hngngn/shadcn-solid/blob/main/apps/docs/src/content/docs/installation.mdx) gives `npm install cva@beta tailwind-merge tw-animate-css`, a Tailwind v4 `app.css` (`@import "tailwindcss"`, `@import "tw-animate-css"`, `@custom-variant dark (&:is([data-kb-theme="dark"] *))`, `@theme inline`, full oklch tokens), and three lib files (`cva.ts`, `call-handler.ts`, `combine-style.ts`). Each component page says "Copy and paste the following code into your project". No registry JSON is served (`/r/button.json` and `/registry/button.json` return 404). The CLI source left the repo in commit "chore: cancel `CLI`" (2025-09-17). One stale `npx shadcn-solid@latest add` line remains in `data-table.mdx`.

## 3. Primitives and SolidStart v2 compatibility

| Package          | Latest                              | Peer `solid-js` | Notes                                                                               |
| ---------------- | ----------------------------------- | --------------- | ----------------------------------------------------------------------------------- |
| `@kobalte/core`  | 0.13.14 (release commit 2026-09-07) | `^1.9.8`        | `2.0.0-alpha.4` (2026-10-20) peers `solid-js 2.0.0-rc.16`; that line is for Solid 2 |
| `@corvu/drawer`  | 0.2.4                               | `^1.8`          | corvu repo last commit 2026-08-24                                                   |
| `solid-sonner`   | 0.3.2                               | `^1.6.0`        | toast, solid-ui only                                                                |
| `@solidjs/start` | 2.1.0                               | `^1.9.15`       | peers `vite ^8 \|\| ^9`                                                             |
| `solid-js`       | 1.9.17 (`latest`)                   |                 | `next` is 2.0.0-rc.17                                                               |

Source: `npm view <pkg> version peerDependencies dist-tags`.

So the whole set runs on Solid 1.9 under SolidStart v2. The Solid 2 move is a later, separate step for both ports: solid-ui issue [#233](https://github.com/stefan-karger/solid-ui/issues/233) lists Kobalte, solid-sonner and corvu as waiting on Solid 2 branches.

Path alias: the registry files import `~/lib/utils` and `~/components/ui/*`. SolidStart v2 provides `~` as the app root by itself (`dist/config/app-root-alias.js` in `@solidjs/start@2.1.0`). On plain Vite 8, add `resolve.tsconfigPaths: true` (default `false` per Vite's `ResolveOptions` types) and a `paths` entry in tsconfig.

Neither port needs the `@kobalte/tailwindcss` plugin (which peers `tailwindcss ^3.3.3`). The installed solid-ui files use plain `data-[expanded]:` and `data-[closed]:` variants plus `tw-animate-css` classes (`animate-in`, `slide-in-from-right`, ...), not `ui-*` variants.

## 4. v1 components

| Need     | solid-ui (registry name)                                                                  | shadcn-solid (file)            |
| -------- | ----------------------------------------------------------------------------------------- | ------------------------------ |
| Button   | `button` (Kobalte Button)                                                                 | `button.tsx`                   |
| Input    | `text-field` (Kobalte TextField: `TextFieldInput`, `TextFieldLabel`, ...)                 | `text-field.tsx`               |
| Card     | `card`                                                                                    | `card.tsx`                     |
| Popover  | `popover` (Kobalte Popover)                                                               | `popover.tsx`                  |
| Sheet    | `sheet` (Kobalte Dialog, side variants)                                                   | none                           |
| Drawer   | `drawer` (`@corvu/drawer`, swipe to close)                                                | `drawer.tsx` (`@corvu/drawer`) |
| Alert    | `alert`, plus `callout`                                                                   | `alert.tsx`                    |
| Skeleton | `skeleton`                                                                                | `skeleton.tsx`                 |
| Spinner  | none (PR [#237](https://github.com/stefan-karger/solid-ui/pull/237) adds one, not merged) | none                           |
| Badge    | `badge`                                                                                   | `badge.tsx`                    |
| Toast    | `sonner`, `toast`                                                                         | `sonner.tsx`                   |

Sources: solid-ui `apps/docs/public/r/` (55 items) and `registry.json`; shadcn-solid `apps/docs/src/registry/ui/` (46 files).

For a phone-first settings panel, `drawer` (bottom sheet with drag) or `sheet` (side or bottom panel) both fit. solid-ui has both; shadcn-solid has only `drawer`.

## 5. Dark mode and theming

Both ports use Kobalte's color mode. `ColorModeProvider` writes `document.documentElement.dataset.kbTheme` and `style.colorScheme` (`setColorModeDataset` in [`packages/core/src/color-mode/utils.ts`](https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/color-mode/utils.ts)). `ColorModeScript` emits an inline script that sets the same attribute before first paint, from `localStorage` or a cookie, with `system` support through `prefers-color-scheme`.

- The dark variant must match that attribute. solid-ui's own docs CSS uses `@custom-variant dark (&:where(.dark, .dark *, [data-kb-theme=dark], [data-kb-theme=dark] *));` ([`apps/docs/src/styles/app.css`](https://github.com/stefan-karger/solid-ui/blob/main/apps/docs/src/styles/app.css)). The registry `css` item writes only `.dark`, so change it.
- Theme tokens are CSS variables (`--primary`, `--background`, ...) mapped to Tailwind colors in `@theme inline`. A custom palette is a change to the `:root` and `[data-kb-theme="dark"]` blocks only. shadcn-solid's [`theming.mdx`](https://github.com/hngngn/shadcn-solid/blob/main/apps/docs/src/content/docs/theming.mdx) documents the same token list.
- In SPA mode there is no server render, so a script rendered by a component runs late. Put the color-mode script in the HTML shell head to stop a light flash. `ColorModeProvider` alone still sets the attribute on mount.

## 6. Maintenance (as of 2026-10-22)

|                                 | solid-ui                                                                                                                                                                                                               | shadcn-solid                                                                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Last release                    | `solidui-cli@0.7.2`, 2026-01-14                                                                                                                                                                                        | `shadcn-solid@0.7.7`, 2025-03-26                                                                                                                       |
| `main` commits since 2025-06-01 | 1                                                                                                                                                                                                                      | 68 (2 in 2026; last 2026-02-13)                                                                                                                        |
| Other activity                  | `dev` branch: 32 commits since 2025-06-01, last 2026-02-23. Open PRs #237 (all components for shadcn v4, updated 2026-10-21) and #239 (SolidStart 2 + Tailwind v4 CLI, updated 2026-10-22) from community contributors | PRs disabled (`has_pull_requests: false`). Owner says "in the middle of a refactor" on issue [#185](https://github.com/hngngn/shadcn-solid/issues/185) |
| Owner statement                 | Issue [#233](https://github.com/stefan-karger/solid-ui/issues/233) "Project is dead?": "nope :) just waiting for solid v2 to drop to fully focus on supporting that"                                                   | none on status                                                                                                                                         |

Because both are copy-in, the app owns the component code after install. Slow upstream mostly costs future fixes, not runtime risk.

## 7. Install test

Run on 2026-10-22 in a scratch copy of this repo's `package.json`, `tsconfig*.json`, `vite.config.ts`, and `src/index.css` (Vite 8.3.5, `solid-js` 1.9, Tailwind 4.3):

1. Wrote `components.json` as in §8 and added `paths: { "~/*": ["./src/*"] }` to the tsconfigs.
2. `npx shadcn@latest add https://www.solid-ui.com/r/{button,text-field,card,popover,sheet,drawer,alert,skeleton,badge}.json --yes` created the 9 files in `src/components/ui/` and added `@kobalte/core@^0.13.14`, `@corvu/drawer@^0.2.4`, `class-variance-authority@^0.7.1`. No `init`, no React packages.
3. `shadcn add https://www.solid-ui.com/r/css.json` appended the extra tokens and keyframes to `src/index.css`.
4. Added `src/lib/utils.ts` (`cn`), `clsx`, `tailwind-merge`, `tw-animate-css`, and the base tokens. A test `App.tsx` used every component inside `ColorModeProvider`.
5. `tsc -b` passed with this repo's strict flags (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`). `vite build` passed. The CSS output has `.bg-primary{background-color:var(--primary)}`, `slide-in-from-right`, and `[data-kb-theme=dark]` rules.

The `shadcn` CLI picks the package manager from the lockfile (it bundles `@antfu/ni`), so in this repo it runs `bun add`.

## Recommendation

Use **solid-ui components, installed with the official `shadcn` CLI from the solid-ui.com registry**:

- It is the only option with a working CLI on Tailwind v4, tested on this stack.
- It has every v1 component except a spinner, and it has both `sheet` and `drawer` for the phone-first settings panel.
- Kobalte 0.13 runs on Solid 1.9, which SolidStart v2 requires.
- Theming is plain CSS variables, so the custom palette is two CSS blocks.

shadcn-solid is a valid fallback (same primitives, same token names). It costs manual copying of each file and has no `sheet`.

## 8. Install steps

Do these after the SolidStart v2 move, or before it on plain Vite with the extra alias step.

1. Add the path alias to `tsconfig.json` and `tsconfig.app.json`:

   ```json
   "compilerOptions": { "paths": { "~/*": ["./src/*"] } }
   ```

   SolidStart v2 resolves `~` itself. On plain Vite 8 only, add `resolve: { tsconfigPaths: true }` to `vite.config.ts`.

2. Create `components.json` at the repo root (no `shadcn init`; `init` scaffolds React):

   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "new-york",
     "rsc": false,
     "tsx": true,
     "tailwind": {
       "config": "",
       "css": "src/index.css",
       "baseColor": "neutral",
       "cssVariables": true,
       "prefix": ""
     },
     "aliases": {
       "components": "~/components",
       "utils": "~/lib/utils",
       "ui": "~/components/ui",
       "lib": "~/lib",
       "hooks": "~/hooks"
     },
     "iconLibrary": "lucide"
   }
   ```

   Set `tailwind.css` to the real global CSS file (SolidStart templates use `src/app.css`).

3. Install the shared packages:

   ```bash
   bun add clsx tailwind-merge
   bun add -d tw-animate-css
   ```

4. Create `src/lib/utils.ts`:

   ```ts
   import type { ClassValue } from "clsx";
   import { clsx } from "clsx";
   import { twMerge } from "tailwind-merge";

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

5. Add the components (the CLI adds `@kobalte/core`, `@corvu/drawer`, `class-variance-authority`):

   ```bash
   bunx shadcn@latest add \
     https://www.solid-ui.com/r/button.json https://www.solid-ui.com/r/text-field.json \
     https://www.solid-ui.com/r/card.json https://www.solid-ui.com/r/popover.json \
     https://www.solid-ui.com/r/sheet.json https://www.solid-ui.com/r/drawer.json \
     https://www.solid-ui.com/r/alert.json https://www.solid-ui.com/r/skeleton.json \
     https://www.solid-ui.com/r/badge.json https://www.solid-ui.com/r/css.json
   ```

6. Edit the global CSS:
   - Add `@import "tw-animate-css";` after `@import "tailwindcss";`.
   - Replace the written dark variant with `@custom-variant dark (&:where([data-kb-theme=dark], [data-kb-theme=dark] *));`.
   - Add the base tokens (`--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, each with `-foreground` where used) in `:root` and `[data-kb-theme="dark"]`, and map each to `--color-*` in `@theme inline`. shadcn-solid's `installation.mdx` has a complete oklch set to start from. Put the custom palette here.

7. Wrap the app in Kobalte's color mode:

   ```tsx
   import type { JSX } from "solid-js";
   import { ColorModeProvider, ColorModeScript, createLocalStorageManager } from "@kobalte/core";

   const storageManager = createLocalStorageManager("theme");

   export function ThemeRoot(props: { children: JSX.Element }) {
     return (
       <>
         <ColorModeScript storageType={storageManager.type} />
         <ColorModeProvider storageManager={storageManager}>{props.children}</ColorModeProvider>
       </>
     );
   }
   ```

   In SPA mode, also put the inline script from Kobalte's `color-mode-script.tsx` in the HTML shell head to stop a flash before mount.

8. Spinner: write a small `spinner.tsx` (an SVG with `animate-spin`). Use `skeleton` for list and card placeholders.

## Open questions surfaced

- solid-ui PRs #237 and #239 may merge soon and change component names (`input` beside `text-field`, a `spinner`). Pin to the files you install; re-pull only on purpose.
- The Solid 2 migration will need Kobalte 2 and a corvu Solid 2 release for both ports. It is out of scope for v1.
