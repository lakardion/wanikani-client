# History export file format

Research for lakardion/wanikani-client#39 (map #33). The question: which file format should the **History** export use? The candidates are JSON, CSV, TOML, JSON Lines (NDJSON), and YAML. The records are nested. The import parses the file in Brave on Android, validates it with zod, and writes it to IndexedDB. The file carries a schema version. It is a few MB at most.

Sources are first-party: RFC 8259 (JSON), RFC 4180 (CSV), the TOML v1.0.0 spec, the JSON Lines spec, the W3C File API, the WHATWG Encoding spec, MDN, and the npm registry. Read on **2026-10-24**. The sizes and parser checks below come from a Node 24 script. It built 1000 records with the decided shape: an **Exercise** with 12 furigana segments, 10 breakdown words, an example, and two attempts. Each record is about 2 KiB as compact JSON. Parser bundle sizes come from an esbuild minified browser bundle. Nothing here was tested on a device.

## Bottom line

- **Use JSON:** one document, `{ app: "wanikani-client", kind: "history", version: 1, exportedAt, records: [...] }`. Write it with `JSON.stringify(doc)`. Read it with `JSON.parse(await file.text())`. Then validate it with zod.
- **It costs no dependency.** `JSON.parse` and `JSON.stringify` are built in and Baseline since 2015 (§1).
- **The round trip is exact** for this shape: strings, numbers, booleans, arrays, and objects. Optional `ruby` keys stay absent (§1).
- **A cut or appended file always fails.** Any truncation of the document throws a `SyntaxError`, because the outer `}` is missing. Two documents joined into one file also throw (§1).
- **The other formats lose on at least one criterion.** CSV has no nesting (§2). JSON Lines does not detect a file cut at a line boundary (§3). TOML has no null and needs a dependency (§4). YAML is the largest dependency and has alias limits (§5).
- **Write compact JSON.** Indented JSON is 2.1 times larger (about 4 KiB per record). A desktop editor can format compact JSON in one step. To make the file easy to read by hand, change the call to `JSON.stringify(doc, null, 2)`. Nothing else changes.

## Comparison

Measured on 1000 records. "Parser" is the size of the browser bundle, minified, then gzip.

| Format | Parser | Nested round trip | Hand edit | File size | Cut or appended file |
| --- | --- | --- | --- | --- | --- |
| JSON (compact) | built in | exact | one long line; format it first | 1981 KiB | always detected |
| JSON (indent 2) | built in | exact | easy | 4233 KiB | always detected |
| JSON Lines | built in, plus a line split | exact | one record per line | 1981 KiB | cut at a line end: **not detected** |
| TOML | `smol-toml` 1.9.1: 16 KiB, 6 KiB gzip | exact here; **no null** | verbose at depth 3 | 3032 KiB | cut before a `[[records]]`: **not detected** |
| YAML | `yaml` 2.9.1: 101 KiB, 31 KiB gzip | exact here | easy, but indentation matters | 2482 KiB | cut before a record: **not detected** |
| CSV | `papaparse` 5.7.0: 19 KiB, 7 KiB gzip | **no nesting** | easy only when flat | n/a | not detected |

---

## 1. JSON

- **Parser.** `JSON.parse` throws a `SyntaxError` "if the string to parse is not valid JSON". It is Baseline, "available across browsers since July 2015" ([MDN `JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)). No dependency.
- **Round trip.** The record shape uses only strings, numbers, booleans, arrays, and objects. JSON has all of them. The script parsed the stringified 1000 records back to an equal value. `JSON.stringify` omits keys with the value `undefined`. Thus an optional `ruby` that is not set stays absent, and zod `.optional()` accepts it.
- **Encoding.** JSON text between systems "MUST be encoded using UTF-8". Parsers "MAY ignore the presence of a byte order mark rather than treating it as an error" ([RFC 8259 §8.1](https://www.rfc-editor.org/rfc/rfc8259#section-8.1)). `JSON.parse` does not ignore it: in the script, `JSON.parse('﻿{}')` throws. This is not a problem on import, because `Blob.text()` runs "UTF-8 decode" ([File API](https://w3c.github.io/FileAPI/#dom-blob-text)). UTF-8 decode removes a leading BOM: "If buffer is 0xEF 0xBB 0xBF, then read three bytes from ioQueue. (Do nothing with those bytes.)" ([Encoding §6](https://encoding.spec.whatwg.org/#utf-8-decode)). A file saved by a desktop editor with a BOM still imports.
- **Duplicate keys.** "The names within an object SHOULD be unique" ([RFC 8259 §4](https://www.rfc-editor.org/rfc/rfc8259#section-4)). A hand edit can add a duplicate key. The parse still succeeds, and zod validates the result. This is acceptable.
- **Cut or appended file.** The file is one object, so every proper prefix is missing its last `}`. In the script, a file cut at half throws "Unexpected end of JSON input". A file cut by one character throws "Expected ',' or '}'". Two documents in one file throw "Unexpected non-whitespace character after JSON". The import needs no extra check for this.
- **Version.** Parse once. Read `{ app, kind, version }` with a small zod schema. Run the upgrade chain from that version. Then validate the full document with the current schema.
- **Media type.** `application/json` ([RFC 8259 §11](https://www.rfc-editor.org/rfc/rfc8259#section-11)). This matches the `accept=".json,application/json"` already decided for the file input.

## 2. CSV

RFC 4180 defines only records, an optional header, and fields. "Each record is located on a separate line". Fields that hold commas, quotes, or line breaks "should be enclosed in double-quotes" ([RFC 4180 §2](https://www.rfc-editor.org/rfc/rfc4180#section-2)). It has no nesting and no data types: every field is text. The RFC "does not specify an Internet standard of any kind".

The `attempts`, `breakdown`, and `furigana` arrays do not fit in rows. The options are a JSON string inside a cell, or several linked CSV files. Both lose the hand-edit gain and add a parser (`papaparse`, 19 KiB minified). CSV also carries no place for the version and other file metadata. Reject it.

## 3. JSON Lines (NDJSON)

The spec: UTF-8, "a byte order mark (U+FEFF) must NOT be included", each line is one valid JSON value, and lines end with `\n`. A final line end is "strongly recommended but not required". The extension is `.jsonl`. The media type `application/jsonl` "is not yet standardized" ([jsonlines.org](https://jsonlines.org/)).

- **Gains.** No dependency: split on `\n`, then `JSON.parse` each line. One record per line is easy to scan. Files join by concatenation.
- **Losses.**
  - The version must go in a first header line. That is an app convention, not part of the format.
  - A file cut at a line end parses as a valid, shorter file. In the script, a file cut after line 500 parsed with no error. To detect this, the app must add a record count or a trailer line.
  - A file cut in the middle of a line, or two files joined, are detected only by app checks: a bad last line, or a second header line.
  - Concatenation is not useful here. The import already merges with `put`.
  - `.jsonl` has no standard media type, so the `accept` filter on Android is less certain.
- **Size.** Same as compact JSON (1981 KiB).

The streaming gain of JSON Lines does not matter for a few MB. Reject it.

## 4. TOML

- **No null.** TOML "is designed to map unambiguously to a hash table". "Values must have one of the following types", and null is not on the list ([TOML v1.0.0](https://toml.io/en/v1.0.0)). In the script, `smol-toml` `stringify({ a: null, b: 1 })` wrote `b = 1` and dropped `a` with no error. The current shape has no null. A later version that adds a nullable field would lose data with no error.
- **Nesting.** Arrays of tables use `[[records]]`, `[[records.exercise.breakdown]]`, and so on. The round trip of the test shape was exact. But the nested paths make the file 1.5 times larger than compact JSON (3032 KiB) and hard to read at three levels.
- **Parser.** A dependency: `smol-toml` 1.9.1, 16 KiB minified, 6 KiB gzip ([npm](https://www.npmjs.com/package/smol-toml)).
- **Cut file.** A file cut before a `[[records]]` header parsed with no error.

Reject it.

## 5. YAML

- **Parser.** A dependency: `yaml` 2.9.1, 101 KiB minified, 31 KiB gzip ([npm](https://www.npmjs.com/package/yaml)). This is the largest option.
- **Aliases.** `stringify` writes anchors and aliases when two records hold the same object reference. On `parse`, the library then threw "Excessive alias count indicates a resource exhaustion attack" for 1000 records. Records read from IndexedDB are separate copies, so this does not occur on export. It is a trap if the code changes.
- **Cut file.** A file cut before a record parsed with no error.
- **Size.** 2482 KiB, 1.25 times compact JSON.

YAML is easy to read, but it has more risk than gain here. Reject it.

## Open points

- Compact or indented: compact is the recommendation. If the owner wants to edit files by hand on the phone, use `JSON.stringify(doc, null, 2)` and accept a file about twice as large.
