# Linting with oxlint and formatting with oxfmt

This note covers the setup of oxlint (linter) and oxfmt (formatter) from the oxc project for this repo. The stack is SolidStart v2 in SPA mode, `solid-js` 1.9, TypeScript ~6.0, Vite 8, Tailwind v4 through `@tailwindcss/vite`, vitest 5, Bun 1.3, and Node 24. The repo has `.ts`, `.tsx`, `.md`, `.json` files and one `.css` file (`src/index.css`). It has no CI and no lint or format config yet.

All facts come from the oxc docs (oxc.rs and their source in [oxc-project/website](https://github.com/oxc-project/website)), the [oxc](https://github.com/oxc-project/oxc) and [tsgolint](https://github.com/oxc-project/tsgolint) repos, the [eslint-plugin-solid](https://github.com/solidjs-community/eslint-plugin-solid) repo, the npm registry (`npm view`), and the action repos on GitHub. Read on **2026-10-28**. A local install test in this repo backs the counts in §7. The test was reverted.

## Bottom line

- **Versions.** `oxlint` 1.90.0 (stable since 2025-06), `oxfmt` 0.75.0 (**beta** since 2026-02-24), `oxlint-tsgolint` 7.0.2005 (stable since 2026-07-22), `eslint-plugin-solid` 0.18.1 (§1, §2).
- **oxfmt covers every file type here natively.** `.ts`, `.tsx`, `.json`, `.md` and `.css` are all formatted by the Rust engine. No bundled Prettier, no Node fallback (§1).
- **Tailwind class sorting is built in.** It is off by default. Turn it on with `sortTailwindcss` and point `stylesheet` at `src/index.css` (Tailwind v4). It sorts custom theme classes such as `bg-primary` correctly (§1, §7).
- **oxlint has no native Solid rules.** Load `eslint-plugin-solid` through `jsPlugins`. JS plugins are **alpha** in oxlint, but the Solid plugin documents oxlint support and tests against it. All the rules used in §8 ran in this repo (§3).
- **Do not enable the `react` plugin.** It is for React. Use `typescript`, `unicorn`, `oxc`, `import`, `jsx-a11y`, `vitest`, plus the Solid JS plugin. For `jsx-a11y`, map `for` as the label attribute, because Solid uses `for`, not `htmlFor` (§2, §7).
- **Type-aware linting works on this TS 6 repo.** tsgolint ships its own TypeScript 7 compiler. The docs say "TypeScript 7.0+ is required", but in practice the tsconfig must only be TS 7 compatible, and this repo's tsconfig is. Leave it off for now. Most of its findings here are noise (27 `no-unsafe-type-assertion` warnings), and `tsc -b` stays the type check (§2, §7).
- **No `eslint-config-prettier` step.** oxlint turns on only `correctness` rules by default. Its few whitespace rules are in the `style` category, which is off (§4).
- **Local test.** With the config in §8, oxlint reports **20 problems (3 errors, 17 warnings)**. oxfmt would change **40 of the repo's tracked files** (§7).
- **Nothing contradicts the choice.** oxfmt formats all file types in the repo and sorts Tailwind classes. Two things to know: oxfmt is still beta (0.x), and the Solid rules depend on oxlint's alpha JS plugin layer.

---

## 1. oxfmt

| Item | Fact | Source |
| --- | --- | --- |
| Version | 0.75.0 (`latest`), published 2026-10-27 | `npm view oxfmt` |
| Status | Beta. "We are excited to announce that Oxfmt has reached beta." (2026-02-24). Alpha was 2025-12-01. No stable post exists. | [blog/2026-02-24-oxfmt-beta.md](https://github.com/oxc-project/website/blob/main/src/blog/2026-02-24-oxfmt-beta.md), blog index |
| Prettier parity | "Oxfmt now passes 100% of Prettier's JavaScript and TypeScript conformance tests." Remaining differences are listed as "Known divergences". | beta post; [formatter overview](https://oxc.rs/docs/guide/usage/formatter.html) |
| Prettier plugins | "Not supported." Tailwind sorting, import sorting and `package.json` sorting are built in instead. | [unsupported features](https://oxc.rs/docs/guide/usage/formatter/unsupported-features.html) |

**File types.** The [language support page](https://oxc.rs/docs/guide/usage/formatter/language-support.html) lists these as native (Rust, no Node): JS/JSX, TS/TSX (`.ts`, `.tsx`, `.d.ts`), JSON/JSONC/JSON5, CSS/SCSS/Less, GraphQL, TOML, YAML, Markdown (`.md`). HTML, Vue, Svelte, Astro and MDX go to a bundled Prettier. So every file type in this repo is native.

**Config.** oxfmt looks upward from each file for `.oxfmtrc.json`, `.oxfmtrc.jsonc`, `oxfmt.config.ts` or `oxfmt.config.mts`. Only one per directory. `oxfmt --init` writes a starter file. The schema is at `./node_modules/oxfmt/configuration_schema.json` ([config](https://oxc.rs/docs/guide/usage/formatter/config.html)).

Key options and defaults ([generated config reference](https://github.com/oxc-project/website/blob/main/src/docs/guide/usage/formatter/generated-config.md)):

- `printWidth`: 100 (Prettier uses 80).
- `semi`: true. `singleQuote`: false. `trailingComma`: `"all"`. `tabWidth`: 2.
- `proseWrap`: `"preserve"`. Markdown prose is not rewrapped.
- `sortPackageJson`: **on** by default. `sortImports`: off.
- `ignorePatterns`: gitignore-style globs, relative to the config file.
- `.editorconfig` values fill unset fields.

**Ignore files.** oxfmt reads `ignorePatterns`, `.gitignore` (current and parent directories, plus `.git/info/exclude`, not the global gitignore), and `.prettierignore`. It always skips `.git`, `node_modules` and lock files ([ignore files](https://oxc.rs/docs/guide/usage/formatter/ignore-files.html)). `bun.lock` was not touched in the local test.

**Tailwind sorting.** Option `sortTailwindcss`, "Uses the same algorithm as prettier-plugin-tailwindcss". Default: disabled. Sub-options ([reference](https://github.com/oxc-project/website/blob/main/src/docs/guide/usage/formatter/generated-config.md#sorttailwindcss)):

- `stylesheet`: "Path to your Tailwind CSS stylesheet (v4)", relative to the oxfmt config. Default is Tailwind's own `theme.css`, which does not know this repo's `--color-*` tokens.
- `functions`: function names whose string arguments are sorted, exact match only (for example `cn`, `cva`, `clsx`).
- `attributes`: extra attributes beyond `class` and `className`. Solid uses `class`, so no change is needed.
- `config`: for Tailwind v3 only. Not needed.

**Check mode.** `oxfmt --check` checks without writing and exits non-zero on differences. `oxfmt --list-different` lists the files. With no path, oxfmt runs on the current directory (`oxfmt --help`).

## 2. oxlint

| Item | Fact | Source |
| --- | --- | --- |
| Version | 1.90.0 (`latest`), published 2026-10-27. Optional peer `oxlint-tsgolint >=7.0.2005`. | `npm view oxlint` |
| Status | Stable since 2025-06-10 | [blog/2025-06-10-oxlint-stable.md](https://github.com/oxc-project/website/blob/main/src/blog/2025-06-10-oxlint-stable.md) |
| Rules | 872 built-in rules. 111 on by default. | `oxlint --rules -f json` |

**Config file.** oxlint looks for `.oxlintrc.json`, `.oxlintrc.jsonc`, `oxlint.config.ts` or `oxlint.config.mts` in the working directory. `.oxlintrc.json` allows comments. The TS form needs the Node-based `oxlint` package and Node 22.18+ or 24+ ([config](https://oxc.rs/docs/guide/usage/linter/config.html)). Both work here. The JSON form is enough and matches the eslint-plugin-solid docs.

**Categories.** `correctness` is on by default. Others: `suspicious`, `pedantic`, `perf`, `style`, `restriction`, `nursery` ([config](https://oxc.rs/docs/guide/usage/linter/config.html#enable-groups-of-rules-with-categories)).

**Plugins.** Default plugins: `eslint`, `typescript`, `unicorn`, `oxc`. Off by default: `react`, `react-perf`, `nextjs`, `import`, `jsdoc`, `jsx-a11y`, `node`, `promise`, `jest`, `vitest`, `vue`. Setting `plugins` "overwrites the default plugin set", so list all of them ([plugins](https://oxc.rs/docs/guide/usage/linter/plugins.html)). For this repo:

- `typescript`, `unicorn`, `oxc`: keep (defaults).
- `import`: useful. Its `no-unassigned-import` flags `import './index.css'`, so allow `**/*.css`.
- `jsx-a11y`: useful, as Solid JSX uses DOM attribute names. `label-has-associated-control` checks `htmlFor` by default. oxlint reads `settings["jsx-a11y"].attributes.for` to change that ([rule source](https://github.com/oxc-project/oxc/blob/main/crates/oxc_linter/src/rules/jsx_a11y/label_has_associated_control.rs)). Set it to `["for"]`.
- `vitest`: the repo has four `*.test.ts` files under `src/lib`.
- `react`: **wrong for Solid.** It covers eslint-plugin-react, react-hooks, react-refresh and the React Compiler rules. They assume React semantics (hooks, re-renders).

**Ignore files.** oxlint follows `.gitignore` during directory traversal (not the global gitignore), `.eslintignore`, and `ignorePatterns` ([ignore files](https://github.com/oxc-project/website/blob/main/src/docs/guide/usage/linter/ignore-files.md)). This repo's `.gitignore` does not list `.claude/`. Agent worktrees in `.claude/worktrees/` are linted and formatted unless you ignore them (§7).

**Type-aware linting.** Provided by `oxlint-tsgolint` (7.0.2005), which runs rules on `typescript-go`. Turn it on with `--type-aware` or `options.typeAware: true`. `--type-check` (experimental) also reports compiler errors and "can replace a separate `tsc --noEmit` step" ([type-aware](https://github.com/oxc-project/website/blob/main/src/docs/guide/usage/linter/type-aware.md)). Status: tsgolint "is stable" ([README](https://github.com/oxc-project/tsgolint#status)), since the [2026-07-22 post](https://github.com/oxc-project/website/blob/main/src/blog/2026-07-22-type-aware-linting-stable.md). 59 of 61 typescript-eslint type-aware rules exist.

TypeScript 6: the docs say "TypeScript **7.0+** is required" and that options deprecated in 6.0 or removed in 7.0 (for example `baseUrl`) must go first. tsgolint bundles TypeScript 7.0.2 (its version `7.0.2005` encodes that), so the installed `typescript` 6 package is not used. This repo's tsconfigs use `paths` without `baseUrl`. In the local test, `--type-aware --type-check` ran in under 2 s and reported zero compiler errors in `src/`, which matches `tsc -b` (§7). The build still uses TS 6 `tsc`, so keep `tsc -b` as the type check.

## 3. Solid rules

**Native rules: none.** The 872 built-in rules come from the scopes `eslint`, `unicorn`, `typescript`, `react`, `vitest`, `jest`, `vue`, `jsx_a11y`, `import`, `oxc`, `jsdoc`, `nextjs`, `promise`, `node`, `react_perf`. No rule has "solid" in its name (`oxlint --rules -f json`). The feature request [oxc#13894](https://github.com/oxc-project/oxc/issues/13894) "support my favorite plugin: eslint-plugin-solid" was closed on 2025-11-21 by its author: "js plugins is pretty close to working". So the answer is the JS plugin path, not a port.

**JS plugins.** "JS plugins are currently in alpha, and remain under active development." They target the ESLint v9 plugin API. Not supported: custom parsers and rules that need type information. Language server support exists, so the VS Code extension shows these rules ([js-plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)). Config: list the package under `jsPlugins` and turn on rules under `rules` (`solid/<rule>`).

**History of eslint-plugin-solid on oxlint:**

- oxlint 1.25 (2025-11-03): community report lists all rules as passing ([discussion #14862](https://github.com/oxc-project/oxc/discussions/14862)).
- oxlint 1.29 (2025-11-19): a real project hit `context.markVariableAsUsed not implemented yet` (`solid/jsx-uses-vars`) and `sourceCode.getTokenBefore not implemented yet` (`solid/reactivity`) (same discussion).
- Both are now in oxlint: `SourceCode#getTokenBefore()` (#15956) and `sourceCode.markVariableAsUsed` (#20357) ([CHANGELOG](https://github.com/oxc-project/oxc/blob/main/apps/oxlint/CHANGELOG.md)). An older `getSourceCode()` failure was fixed in #15606 ([oxc#15567](https://github.com/oxc-project/oxc/issues/15567)).
- The plugin side: its README has an "Oxlint" section. It says the rules "are AST-based, so they run under Oxlint's JS plugin support without modification". The repo keeps a [`test/.oxlintrc.json`](https://github.com/solidjs-community/eslint-plugin-solid/blob/main/test/.oxlintrc.json). Issue [#206](https://github.com/solidjs-community/eslint-plugin-solid/issues/206) (closed 2026-08-27) answers: "the plugin works under Oxlint's `jsPlugins` as of v0.15.0".
- The plugin is active: 0.16.0 to 0.18.1 between 2026-08-27 and 2026-10-04. It peers `eslint ^9 || ^10` and `typescript >=4.8.4` (`npm view`). Bun installs `eslint` as a peer, but oxlint does not run it.

**Local result (oxlint 1.90.0, eslint-plugin-solid 0.18.1).** All 16 rules of the plugin's `recommended` set for Solid 1.x loaded and ran with no runtime errors. `solid/reactivity` reported 4 real-looking findings in `src/components/form/ArrayInput.tsx` and `BooleanInput.tsx` (props read outside a tracked scope). `solid/jsx-uses-vars` worked: no component used only in JSX was reported as unused.

Do not turn on the Solid 2.0 rules (`removed-api`, `no-single-arg-create-effect`, and others) or `settings.solid.version: 2`. The repo is on Solid 1.9.

**Recommendation.** Use eslint-plugin-solid through `jsPlugins` with the 1.x recommended rules (§8). The risk is the alpha label on JS plugins. If an oxlint update breaks a Solid rule, the failure is a crash or a missed report, not a wrong fix. Pin both versions and update them together.

## 4. Conflicts with the formatter

No `eslint-config-prettier` step is needed. The oxfmt migration guide recommends `eslint-config-prettier` only "if you intend to continue using ESLint" ([migrate from Prettier](https://github.com/oxc-project/website/blob/main/src/docs/guide/usage/formatter/migrate-from-prettier.md)). For oxlint it says nothing.

oxlint has no layout rules like `indent`, `semi`, `quotes` or `max-len`. A scan of `oxlint --rules -f json` for layout-like names finds only these, all in the `style` category:

- `eslint/curly`, `eslint/arrow-body-style`
- `unicorn/empty-brace-spaces`, `unicorn/switch-case-braces`
- `react/jsx-curly-brace-presence`, `react/self-closing-comp`
- `vitest/padding-around-*` and `jest/padding-around-*`

`style` is off by default and the config in §8 does not turn it on. Of these, `unicorn/empty-brace-spaces` and the `padding-around-*` rules are whitespace rules, so they can clash with oxfmt. Leave `style` off, or turn those three off if you enable `style` later. `solid/self-closing-comp` is a JSX shape rule that oxfmt does not touch, so no clash.

## 5. Editor

One VS Code extension covers both tools: `oxc.oxc-vscode` (Marketplace and Open VSX). It runs `oxlint --lsp` and `oxfmt --lsp` from the project's `node_modules`, so both packages must be installed locally ([linter editors](https://oxc.rs/docs/guide/usage/linter/editors.html), [formatter editors](https://oxc.rs/docs/guide/usage/formatter/editors.html)). Settings:

```json
{
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": { "source.fixAll.oxc": "always" }
}
```

`"oxc.typeAware": true` turns on type-aware rules in the editor. If it is unset, the root config's `options.typeAware` applies.

## 6. GitHub Actions

Current releases (GitHub `releases/latest`):

| Action | Latest | Notes |
| --- | --- | --- |
| `actions/checkout` | v7.0.1 (2026-07-20) | input `persist-credentials` exists |
| `oven-sh/setup-bun` | v2.2.0 (2026-03-14) | inputs `bun-version`, `bun-version-file`. With neither, it reads `packageManager`, then `engines.bun`, then uses `latest` ([README](https://github.com/oven-sh/setup-bun#usage)) |
| `actions/setup-node` | v7.1.0 (2026-10-08) | input `node-version-file` exists |

This repo's `package.json` has no `packageManager` field, so pin `bun-version` in the workflow. `ubuntu-24.04` ships Node 22.23.3 ([runner image readme](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md)). The repo pins Node 24 in `.node-version`, and `bun run` starts `#!/usr/bin/env node` binaries (`tsc`, `vitest`, `oxlint`) with Node. So add `setup-node` with `node-version-file`.

oxlint detects GitHub Actions and writes error annotations by itself ([linter CI](https://github.com/oxc-project/website/blob/main/src/docs/guide/usage/linter/ci.md)). The oxc docs advise pinning actions to a commit SHA, not a tag.

## 7. Local test

Run on 2026-10-28 in this repo with Bun 1.3.14 and Node 24.22.1:

1. `bun add -d oxlint@1.90.0 oxfmt@0.75.0 oxlint-tsgolint@7.0.2005 eslint-plugin-solid@0.18.1` (98 packages, `eslint` among them as a peer).
2. Without a config, `oxlint` linted `.claude/worktrees/*` too. This is why `ignorePatterns` has `.claude/**`.
3. **oxlint** with the `.oxlintrc.json` from §8: **20 problems, 3 errors, 17 warnings.**
   - Errors: `jsx-a11y/heading-has-content` ×2 (`src/components/ui/card.tsx`, `alert.tsx`). These wrappers pass children through `{...others}`, so the rule cannot see content. This is a false positive, so the §8 config turns it off for `src/components/ui/**`. Then `eslint/no-unused-vars` ×1 (`catch (e)` in `public/color-mode.js`).
   - Warnings: `unicorn/consistent-function-scoping` ×5, `unicorn/no-array-sort` ×4 (3 in `prototypes/`), `solid/reactivity` ×4, `import/no-named-as-default-member` ×4 (`src/components/ui/drawer.tsx`).
   - Before the `for` label setting, `jsx-a11y/label-has-associated-control` gave 2 false errors on `<label for=...>`. Before the CSS allow, `import/no-unassigned-import` flagged `import './index.css'`.
   - With the override, 18 problems remain (1 error). Fix the `catch (e)` to make `bun run lint` pass.
4. **Type-aware** (`--type-aware`): 55 problems (8 errors, 47 warnings), in 1.9 s. New: `typescript/no-unsafe-type-assertion` ×27, `restrict-template-expressions` ×4, `no-unnecessary-type-assertion` ×2, `no-base-to-string` ×1. `--type-check` added compiler errors only in `prototypes/exercise-prompts/` (no tsconfig there, so no Node types). It found none in `src/`, and `tsc -b` passed.
5. **oxfmt** with the `.oxfmtrc.json` from §8: **40 tracked files would change**: 14 `.tsx`, 13 `.ts`, 9 `.md`, 3 `.json` (`components.json`, `package.json`, `tsconfig.json`), 1 `.css`. With all defaults (double quotes, semicolons, width 100): 61 files.
   - `.md` changes are table column padding. Prose is not rewrapped (`proseWrap: "preserve"`).
   - `.css` changes are quote style (`"tailwindcss"` to `'tailwindcss'`).
   - `package.json` changes come from `sortPackageJson`.
   - The 7 shadcn files in `src/components/ui/` use double quotes, and the rest of `src/` uses single quotes. The config follows the majority (25 files single quotes, 0 files with semicolons).
   - Tailwind check: `<div class="p-4 flex text-zinc-500 bg-primary">` became `class="flex bg-primary p-4 text-zinc-500"`, and `cn("p-4 flex bg-primary")` was sorted too. Sorting added no extra changed files.
6. Reverted: restored `package.json` and `bun.lock` byte for byte, deleted both config files, and reinstalled `node_modules` with `bun install --frozen-lockfile`. `git status` shows only the changes that were there before.

## 8. Recommended setup

**devDependencies** (`bun add -d`):

```bash
bun add -d oxlint@^1.90.0 oxfmt@^0.75.0 eslint-plugin-solid@^0.18.1
```

Add `oxlint-tsgolint@^7.0.2005` only when you turn on type-aware linting. Since oxfmt is 0.x and JS plugins are alpha, a lockfile pin is the real pin. Update with intent.

**`.oxlintrc.json`:**

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "import", "jsx-a11y", "vitest"],
  "jsPlugins": ["eslint-plugin-solid"],
  "categories": { "correctness": "error", "suspicious": "warn" },
  "env": { "browser": true, "node": true },
  "settings": { "jsx-a11y": { "attributes": { "for": ["for"] } } },
  "ignorePatterns": [".claude/**"],
  "rules": {
    "import/no-unassigned-import": ["warn", { "allow": ["**/*.css"] }],
    "solid/components-return-once": "warn",
    "solid/event-handlers": "warn",
    "solid/imports": "warn",
    "solid/jsx-no-duplicate-props": "error",
    "solid/jsx-no-script-url": "error",
    "solid/jsx-no-undef": "error",
    "solid/jsx-uses-vars": "error",
    "solid/no-destructure": "error",
    "solid/no-innerhtml": "error",
    "solid/no-react-deps": "warn",
    "solid/no-react-specific-props": "warn",
    "solid/no-unknown-namespaces": "error",
    "solid/prefer-for": "error",
    "solid/reactivity": "warn",
    "solid/self-closing-comp": "warn",
    "solid/style-prop": "warn"
  },
  "overrides": [
    {
      "files": ["src/components/ui/**"],
      "rules": { "jsx-a11y/heading-has-content": "off" }
    }
  ]
}
```

The `solid/*` list is the plugin's `recommended` set for Solid 1.x (README rules table, ✔ column), with the severities from its oxlint test config. The test run in §7 did not include the `overrides` block. Its count with the override is computed from the same findings.

**`.oxfmtrc.json`:**

```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "semi": false,
  "singleQuote": true,
  "printWidth": 120,
  "sortTailwindcss": {
    "stylesheet": "./src/index.css",
    "functions": ["cn", "cva", "clsx"]
  },
  "ignorePatterns": [".claude/**"]
}
```

`semi` and `singleQuote` match most of `src/`. `printWidth: 120` is a choice: `src/` has 99 lines over 100 characters and 39 over 120. Drop it to take the default of 100 and more line breaks.

**`package.json` scripts:**

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt",
    "format:check": "oxfmt --check"
  }
}
```

oxfmt sorts `package.json` keys on its first run (`sortPackageJson`), so the order of the scripts may change.

**`.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
      - uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.3.14
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run format:check
      - run: bunx tsc -b
      - run: bun run test
```

`bun run test` runs `vitest run` (existing script). `bunx tsc -b` runs the type check alone. The `build` script would also run `vite build`.

**First run order:** add the files, run `bun run format` once and commit it alone, then fix the `catch (e)` in `public/color-mode.js` so `bun run lint` exits 0. Add the format commit SHA to `.git-blame-ignore-revs`, as the oxfmt migration guide suggests.

## Open questions surfaced

- `prototypes/exercise-prompts/` is a separate Bun package with its own `package.json` and no tsconfig. It is linted and formatted with the app (3 lint warnings, 7 changed files). Add `prototypes/**` to both `ignorePatterns` if it is throwaway code.
- `.claude/` is not in `.gitignore`. Adding `.claude/worktrees/` there would cover both tools and make the `ignorePatterns` entries unnecessary.
- Type-aware linting: turn it on later with `oxlint-tsgolint` and `options.typeAware`. Consider turning off `typescript/no-unsafe-type-assertion` first, because the Kobalte wrappers cast props on purpose.
