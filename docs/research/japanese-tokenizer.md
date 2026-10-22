# Japanese tokenizer for the server

Question: which morphological tokenizer should a SolidStart v2 app use on the server, to give a kana reading for each token of a short generated Japanese sentence and to split that sentence into words? The target is one Node.js serverless function on Vercel Hobby, built by Nitro with the `vercel` preset.

Research date: 2026-10-22.

## Recommendation

Use **`lindera-wasm-ipadic-nodejs`** (IPADIC embedded in the WASM binary), and add it to Nitro `traceDeps`.

Fallback: **`@sglkc/kuromoji`** (or plain `kuromoji`) with `traceDeps: ["@sglkc/kuromoji*"]`. The output is identical to Lindera IPADIC on every test sentence, but it uses about 2x the memory and the projects are not maintained.

Do not use UniDic for readings unless you also need its better lexicon. It uses 3x the memory and 3x the load time of IPADIC, and Lindera's UniDic build has no plain-kana reading field (see "Reading accuracy").

## Candidates

Package facts come from the npm registry (`npm view <pkg>`) and the GitHub API (`gh api repos/<repo>`), read on 2026-10-22.

| Package | Latest | Last publish | Repo last push | Dictionary | Install size | Dict loading |
| --- | --- | --- | --- | --- | --- | --- |
| `kuromoji` | 0.1.2 | 2018-03-19 | 2023-11-12 (`takuyaa/kuromoji.js`) | IPADIC (`mecab-ipadic-2.7.0-20070801`) | 41.3 MB unpacked, `dict/` 18 MB | Filesystem, gzipped `.dat.gz` files, path given at runtime |
| `@sglkc/kuromoji` | 1.1.0 | 2023-09-17 | 2023-09-17 (repo now `miseya/kuromoji.js`) | Same IPADIC | 18.3 MB, `dict/` 19 MB | Filesystem, same as `kuromoji`; uses `fflate` in place of `zlibjs` |
| `@patdx/kuromoji` | 1.0.4 | 2024-11-21 | 2025-04-25 | Same IPADIC | 17.9 MB | ESM build with `./node` and `./browser` exports |
| `kuromoji.js` (f1w3) | 0.1.6 | 2025-01-11 | n/a | Same IPADIC | 19.0 MB | Filesystem |
| `kuromojin` | 3.0.1 | 2025-04-13 | 2025-04-13 | Wrapper on `kuromoji@0.1.2` | 17.7 KB plus `kuromoji` | Adds a tokenizer singleton and LRU cache; no own dictionary |
| `lindera-wasm-ipadic-nodejs` | 2.3.4 | 2026-03-24 | 2026-10-22 (`lindera/lindera`) | IPADIC (`mecab-ipadic-2.7.0-20250920` in current source) | 17.8 MB (one 17.75 MB `.wasm`) | **Embedded** in the `.wasm`; JS glue reads the `.wasm` with `readFileSync(\`${__dirname}/lindera_wasm_bg.wasm\`)` |
| `lindera-wasm-unidic-nodejs` | 2.3.4 | 2026-03-24 | same | UniDic | 54.0 MB | Embedded |
| `lindera-wasm` | 6.2.0 | 2026-09-26 | same | None | 1.9 MB | Web target only. Dictionary is loaded from bytes or downloaded to OPFS at runtime. Not a fit for a Node function without extra work. |
| `sudachi-wasm333` | 1.0.4 | 2026-04-14 | 2026-10-21 | SudachiDict (small by default) | 125.3 MB | Dynamic path or URL; 5 GitHub stars, one maintainer |
| `@hiogawa/sudachi.wasm` | 1.0.1 | 2022-10-10 | n/a | SudachiDict, embedded | 1.3 MB | Stale |
| `mecab-wasm` | 1.0.3 | 2022-05-09 | n/a | IPADIC | 56.9 MB | Stale |

Notes:

- Lindera publishes two naming schemes. The `lindera-wasm-<dict>-nodejs` packages (2.3.4, March 2026) are newer than the `lindera-wasm-nodejs-<dict>` packages (2.0.0, January 2026). Use the first scheme.
- Vibrato (`daac-tools/vibrato`, active) has no npm WASM package (`vibrato-wasm` returns 404).
- The `kuromoji` dictionary is the 2007 IPADIC. Lindera's IPADIC build uses a 2025 repackage of the same 2.7.0 data (`lindera-ipadic/build.rs`). The readings were identical in all tests below.

## Measured load time and memory

Local test on macOS, Node 22.15.0 (not Node 24), one cold process per package. Script: build the tokenizer, then tokenize four sentences.

| Package | Tokenizer build time | Process RSS after build |
| --- | --- | --- |
| `kuromoji` 0.1.2 | 241 ms | 425 MB |
| `@sglkc/kuromoji` 1.1.0 | 223 ms | 430 MB |
| `lindera-wasm-ipadic-nodejs` 2.3.4 | 226 ms | 234 MB |
| `lindera-wasm-unidic-nodejs` 2.3.4 | 769 ms | 693 MB |

No project documents a cold-start time. A Vercel vCPU is slower than a laptop core, so expect higher numbers in production. All four fit in the Hobby memory limit of 2 GB.

## Reading accuracy

Test output (surface/reading):

| Sentence | IPADIC (kuromoji and Lindera, identical) | Lindera UniDic |
| --- | --- | --- |
| 三人で東京スカイツリーに行きました。 | 三/サン 人/ニン で 東京/トウキョウ スカイ ツリー に 行き/イキ まし た | same split; 行き lemma reading イク |
| 昨日、図書館で日本語の本を二冊借りた。 | 図書館/トショカン 日本語/ニホンゴ 二/ニ 冊/サツ | 図書/トショ 館/カン, 日本/**ニッポン** 語/ゴ |
| 国際連合安全保障理事会が開かれた。 | 国際 連合 安全 保障 理事 会 (six tokens) | same split |
| 一人で七時に起きて、八百屋へ行った。 | 一/**イチ** 人/**ニン**, 行っ/イッ | 一人/**ヒトリ**, 行っ/イク (lemma) |
| 三人で行った (via Nitro build) | 行っ/**オコナッ** | not tested |

Findings:

- **Counters.** IPADIC splits a number and a counter into two tokens (三/サン 人/ニン). This gives the right reading for 三人, but gives 一人 as イチニン, which is wrong (ヒトリ). 二人 (フタリ) has the same problem. UniDic has 一人 as one word with reading ヒトリ.
- **Compounds.** Both dictionaries split long compounds such as 国際連合安全保障理事会 into parts. The reading of each part is correct.
- **Ambiguous kanji.** 行った gets イッ in one sentence and オコナッ (行う) in another, with both IPADIC and UniDic. The choice depends on context. A short generated sentence gives little context.
- **UniDic fields in Lindera.** `details[6]` is the lemma reading (行き → イク). `details[9]` is the pronunciation form, which uses long-vowel marks (東京 → トーキョー) and gives を → オ, へ → エ. Neither field is a plain kana reading of the surface form. IPADIC `details[7]` is the plain kana reading of the surface form (トウキョウ, ヲ, ヘ).
- **Kana form.** All readings are katakana. Convert to hiragana in app code if needed (a fixed code-point offset).

Conclusion: no option is fully correct for counters or homographs. If the sentence generator is an LLM, ask it to return readings too, or keep a small override table for counter words (一人, 二人, 一日, 二日, 二十日 and so on).

## Bundling with Nitro (vercel preset)

SolidStart 2.1.0 is the current `latest` on npm. It is a Vite plugin and uses Nitro v3 (`nitro@3.0.260903-beta`) for the server build. Test: a minimal Nitro v3 app with `preset: "vercel"` and one route per tokenizer, built with `nitro build` (rolldown), then run through the built `index.mjs`.

Default build (no extra config):

- Both packages are inlined into `_libs/*.mjs`. The output has no `.wasm` file and no `dict/` folder.
- Lindera then reads `${__dirname}/lindera_wasm_bg.wasm`, which is not in the output. kuromoji reads its dictionary from a path known only at runtime, so a file tracer cannot find it.

Working build:

```ts
import { defineConfig } from "nitro";
export default defineConfig({
  preset: "vercel",
  traceDeps: ["lindera-wasm-ipadic-nodejs", "@sglkc/kuromoji*"],
});
```

- `traceDeps: ["lindera-wasm-ipadic-nodejs"]` is sufficient for Lindera. Nitro traces the `readFileSync` and copies the `.wasm` into `__server.func/node_modules/`. Output size: 18.1 MB.
- kuromoji needs the trailing `*` (Nitro: "`pkg*` for full package trace"), so that `dict/` is copied. Without the `*`, `dict/` is missing. The app must also resolve `dicPath` from the package location, for example `createRequire(import.meta.url).resolve("@sglkc/kuromoji/package.json")`.
- With both packages, the function was 36.4 MB, and both routes returned readings.
- `traceDeps`, `noExternals`, and `traceOpts` are defined in `nitro/dist/types` (see `https://nitro.build/config#tracedeps`).
- For dev mode, the Lindera README tells Vite users to add the package to `optimizeDeps.exclude`. That applies to the web-target `lindera-wasm` package and was not tested with the `-nodejs` package.

## Vercel Hobby limits

Source: `https://vercel.com/docs/functions/limitations`.

- **Bundle size:** 250 MB maximum uncompressed, including layers. Large functions (up to 5 GB) are in beta and need Fluid compute with Active CPU.
- **Memory:** Hobby is 2 GB / 1 vCPU, as both default and maximum. It cannot be changed.
- **Duration:** Hobby is 300 s default and maximum.

Every candidate except the stale or oversized ones fits. Lindera IPADIC uses about 7 % of the bundle limit and about 12 % of the memory limit.

## Sources

- npm registry: `npm view <pkg> version time dist.unpackedSize repository.url`, for every package in the table.
- GitHub API: `takuyaa/kuromoji.js`, `miseya/kuromoji.js`, `patdx/kuromoji.js`, `azu/kuromojin`, `lindera/lindera`, `Benjas333/sudachi-wasm333`, `WorksApplications/sudachi.rs`, `daac-tools/vibrato`.
- Lindera: `lindera-wasm` README (npm), `lindera-wasm-ipadic-nodejs` README and `lindera_wasm.js`, `lindera-ipadic/build.rs` in `lindera/lindera`.
- sudachi-wasm333 README (npm).
- Nitro v3 config types: `nitro/dist/types` in `nitro@3.0.260903-beta`.
- Vercel: `https://vercel.com/docs/functions/limitations`.
- Local measurements and the Nitro build test: run on 2026-10-22 as described above.
