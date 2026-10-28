# History: build spec

This spec amends [`v1.md`](v1.md) with **History**. Everything needed to build it is here, and every decision in it is final. Where it changes a v1 rule, this spec wins. The terms in bold are defined in [`CONTEXT.md`](../../CONTEXT.md).

**History** keeps every finished **Exercise** in IndexedDB in this browser. The user can look back at past **Exercises**, see totals overall and per **Grammar point**, and move **History** to another device with a file. The server stays stateless: no server function changes.

Sources: the decision tickets under the map issue [Map: Exercise history](https://github.com/lakardion/wanikani-client/issues/33), and the prototype on the [`prototype/history-screens`](https://github.com/lakardion/wanikani-client/tree/prototype/history-screens) branch, variant A (`prototypes/ui/history.html`).

## Rules

- **History** is on by default. A switch in the settings popover stops recording and keeps the saved records.
- Every finished **Exercise** is recorded: a **Pass**, a fail after the retry, and a **Give up**. An unfinished **Exercise** (a reload, an unused prefetch) is not recorded.
- A WaniKani key change or clear does not touch **History** or its flags.
- No new dependency. The client uses the raw IndexedDB API and `zod`, which the server already uses.

## Record

One record per finished **Exercise**. Decided in [History record shape and export format](https://github.com/lakardion/wanikani-client/issues/36).

```ts
type HistoryRecord = {
  id: string; // crypto.randomUUID(), set at finish
  finishedAt: string; // ISO time of the finish
  outcome: "pass" | "fail" | "give_up";
  exercise: Exercise; // the type from src/server/exercise.ts, as is, furigana included
  attempts: (
    | { answer: string; score: number; feedback: string; pass: boolean }
    | { answer: string; giveUp: true }
  )[];
};
```

- `outcome` is fixed at finish: `pass` when the last graded **Attempt** passed, `give_up` when the last **Attempt** is a **Give up** (a fail then a **Give up** is `give_up`), else `fail`.
- `pass` and `outcome` are stored, so a later change to `PASS_SCORE` does not change past results. Stats read only `outcome`.
- A **Give up** **Attempt** keeps the trimmed answer (`""` or `"?"`).
- The **Grammar point** is stored by `exercise.grammarId` only. An id that is not in `GRAMMAR` shows as the raw id.
- A failed `gradeAnswer` call is not an **Attempt**.

## Storage

**IndexedDB:** database `wanikani-history`, one object store `records` with keyPath `id`, no indexes. Write a small promise helper over the raw API (open, `put`, `getAll`, `clear`). The database version is the schema version (see [Versioning](#versioning)).

**Flags** in localStorage:

| Key                                    | Value                                              | Default          |
| -------------------------------------- | -------------------------------------------------- | ---------------- |
| `wanikani.history.on`                  | `"true"` or `"false"`                              | on               |
| `wanikani.history.warningDismissed`    | `"true"` when the first-open warning was dismissed | absent           |
| `wanikani.history.lastExportAt`        | ISO time of the last export                        | absent ("never") |
| `wanikani.history.reminderDismissedAt` | ISO time of the last × on the export reminder      | absent           |

**Delete history** clears the store, `lastExportAt` and `reminderDismissedAt`. It keeps `on` and `warningDismissed`.

**Stats** are computed from `getAll()` each time the History page opens. Nothing is stored.

## Recording

The loop builds the **Attempts** of the current **Exercise** as the user answers. When the **Exercise** finishes (where the loop goes to the **Explanation**), and `wanikani.history.on` is on, the loop makes the record and calls `put`.

**Write failure:** a failed `put`, including a `QuotaExceededError`, puts the record in a memory queue. Each later write tries the queue first. While the queue is not empty, the [save-failed alert](#loop-additions) shows. A reload loses the queue.

**Persistent storage:** call `navigator.storage.persist()` when the user dismisses the first-open warning. While recording is on and `navigator.storage.persisted()` is false, call it again on each app start and after each recorded **Exercise**. Brave never prompts: it grants or denies silently. Decided in [IndexedDB durability on Brave Android](https://github.com/lakardion/wanikani-client/issues/34).

## Versioning

One schema version, starting at `1`, is shared by the export file and the IndexedDB records. One upgrade chain (`v1→v2→…`), one pure function per step, runs in two places:

- In `onupgradeneeded`, on the stored records.
- On import, on the file records before the merge.

## Export and import

Decided in [File export and import on Brave Android](https://github.com/lakardion/wanikani-client/issues/35) and [History export file format](https://github.com/lakardion/wanikani-client/issues/39).

**File:** one compact JSON document, written with `JSON.stringify(doc)`:

```ts
{ app: 'wanikani-client', kind: 'history', version: 1, exportedAt: string, records: HistoryRecord[] }
```

**Export:** build the document from `getAll()`, make a `Blob` of type `application/json`, and download it with `<a download="wanikani-history-<YYYY-MM-DD>.json">` and an object URL. Revoke the URL after the click. Then set `lastExportAt`. On Android the file goes to the default download location.

**Import:** an `<input type="file" accept=".json,application/json">`. Read with `JSON.parse(await file.text())`, then validate with a zod schema of the envelope and the records.

- The import is all or nothing. Any parse or validation failure imports nothing.
- A `version` newer than the app knows imports nothing.
- An older `version` runs through the upgrade chain.
- Merge by `id`: a record that is already present is kept, and the imported one is skipped. Importing the same file again imports 0.
- An import works while recording is off.

**CSP:** no change. Do not `fetch()` the blob URL or use it in an `<img>`: `'self'` does not match `blob:`.

## Routes

This replaces the v1 rule "There are no other routes".

- `/` is the exercise app.
- `/history` is the History page.
- `/history/:id` is the record detail. An unknown id shows "This Exercise is not in History." and the back button.
- `/explorer` is unchanged.

The router gives the Android back gesture its normal meaning: back from the detail goes to History, and back from History goes to practice.

**The loop survives a visit to History.** Leaving `/` unmounts `ExerciseLoop`, so move its state to module scope, as the **Session** count already is: the step, the current **Exercise**, the answer, the grade, the **Attempts**, and the prefetch. On return, the loop continues from the same step. A call that is in flight when the user leaves finishes and updates that state. Only a reload ends the **Session**.

## Screens

The prototype is variant A, with the stats layout from variant C. Decided in [Sketch the History screens](https://github.com/lakardion/wanikani-client/issues/37). The settings icon stays the app's cog.

### Header

A History icon button sits next to the settings cog and links to `/history`. It shows with or without a WaniKani key, because **History** does not need the key.

### History page

- The header has a back button ("Practice") and an "Export / Import" menu (a popover). The menu shows "Last export: <date> / never", an Export button, an Import button, and one line: "Export saves History to a file. Import adds the Exercises from a file; the ones already here are skipped."
- The import result is a dismissible alert at the top of the page:
  - Success: "Imported N, skipped M (already present)."
  - Invalid file: "This file is not a History export. Nothing was imported." (destructive)
  - Newer version: "This file comes from a newer version of the app. Reload the app, then import again. Nothing was imported." (destructive)
- When recording is off and records exist, a note says "History is off. New Exercises are not recorded."
- Two tabs: **Exercises (N)** and **Stats**.
- With no records, both tabs show an empty state: "No Exercises yet." (or "History is off." when recording is off), and "You can import an export from another device."

### Exercises tab

A flat list, newest first by `finishedAt`. Each row shows the Japanese sentence (one line, truncated), the **Grammar point** pattern, the finish date and time, and an outcome badge: "Pass", "Not passed" or "Gave up". A tap opens `/history/:id`.

### Record detail

A full page with a back button ("History"). Top to bottom:

1. The finish date and time, and the outcome badge.
2. The sentence with furigana, and the reference translation.
3. "Your attempts": each **Attempt** shows its answer (or "(empty)"), then "Pass · score" or "Not passed · score" with the feedback, or "Gave up".
4. The **Explanation**: the breakdown, the **Grammar point** (pattern, meaning, explanation), and the example. Reuse the loop's `Explanation` component.

### Stats tab

- A large pass-rate tile ("P% passed"), and beside it a "N done" tile and a "G gave up" tile.
- "Grammar points, weakest first": one row per **Grammar point** with records. Each row shows the pattern, "P% of N · G gave up", and a bar for the pass rate. Rows sort by pass rate, lowest first; a tie sorts by N, highest first. The rows do not respond to a tap.

Pass rate is `pass` records divided by all records. `fail` and `give_up` both count as not passed.

### Settings popover

A History block below the existing WaniKani block, after an `<hr />`:

- A "Record History" switch, bound to `wanikani.history.on`.
- When the switch is off: "New Exercises are not recorded. The N saved ones stay."
- "N Exercises · Storage: persistent / not persistent" (from `navigator.storage.persisted()`) and "Last export: <date> / never".
- **Delete history**, a destructive button. It is disabled when no records exist. A tap shows an inline confirm step: "Delete N Exercises from this browser? Export first to keep a copy. This cannot be undone." [Cancel] [Delete].

The popover shows only with a WaniKani key, as in v1. Without a key, the toggle and **Delete history** are not reachable; the History page still is.

### Loop additions

- **First-open warning:** an alert above the loop, titled "History is on": "Finished Exercises are saved only in this browser. Clearing site data deletes them. Export from History to keep a copy, or turn History off in settings." A [Got it] button sets `warningDismissed` and calls `persist()`. It shows while recording is on and `warningDismissed` is absent.
- **Save failed:** a dismissible destructive alert above the loop: "This Exercise was not saved to History. The app tries again after the next one." It shows while the write queue is not empty.
- **Export reminder:** one line on the **Explanation** step, above **Next**: "N Exercises since your last export. Export ×". N counts the records with `finishedAt` later than both `lastExportAt` and `reminderDismissedAt` (an absent value counts as the start of time). The line shows when N is 50 or more. Export downloads the file at once, without opening History. × sets `reminderDismissedAt` to now.

## Tests

Vitest units, pure logic only, as in v1:

- The outcome of a list of **Attempts**: a **Pass**, two fails, a **Give up**, a fail then a **Give up**.
- The stats: the totals, the per **Grammar point** rows, the sort order, and an unknown `grammarId`.
- The import: a valid file, a file that is not JSON, a file that fails zod, a newer `version`, and the merge counts on a second import of the same file.
- The export reminder count, with and without `lastExportAt` and `reminderDismissedAt`.

Each build step checks its result on the phone (Brave on Android) on the Vercel deployment. Step 10 tests the full export and import flow on the phone once.

## Build order

The steps continue the v1 build order. Each step deploys and works on its own.

7. **Recording:** the IndexedDB helper, the record, recording at finish, the write queue and the save-failed alert, the first-open warning and `persist()`, and the History block in the settings popover without **Delete history**. Move the loop state to module scope. Tests for the outcome.
8. **History page:** `/history` with the Exercises tab and the empty state, `/history/:id`, and the header button.
9. **Stats:** the Stats tab. Tests for the stats.
10. **Export, import and delete:** the Export / Import menu, the import result alerts, the export reminder, and **Delete history**. Tests for the import and the reminder.

## Known risks

- **Data loss:** the user or the device can delete the browser data: clearing site data, a Brave Shred, Android "Clear storage", uninstalling Brave, or losing the phone. `persist()` does not protect against these. Only an export does. Details: [`indexeddb-durability.md`](https://github.com/lakardion/wanikani-client/blob/research/indexeddb-durability/docs/research/indexeddb-durability.md).
- **No sync:** two devices drift apart until the user exports from one and imports on the other.

## Non-goals

Out of scope for this effort:

- Analytics past the totals: charts over time, streaks.
- A server database, and sync across devices.
- Feeding **History** back into generation, and review scheduling of missed **Exercises**.
