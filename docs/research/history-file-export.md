# History file export and import on Brave Android and desktop

Research for lakardion/wanikani-client#35 (map #33). The question: how does the user export **History** to a JSON file and import it again in Brave on Android and in a desktop browser? What does the production CSP in `src/middleware.ts` allow?

Sources are first-party: the W3C CSP spec, MDN (pages and `@mdn/browser-compat-data` 8.1.7, 2026-10-22), Chromium source, Chrome Help, and the Brave issue tracker. Read on **2026-10-24**. Brave is Chromium-based, so Chromium behavior applies unless a Brave source says otherwise. Nothing here was tested on a device.

## Bottom line

- **Export: use `<a download>` with a `Blob` object URL.** It works in Chrome Android since 18 and in all desktop browsers. On Android the file goes to the default download location. The user finds it in the Files app or on the browser Downloads page (§1).
- **No CSP change is needed.** CSP fetch directives do not cover a download navigation. `blob:` matters only if the app loads a blob as an image, script, or `fetch` target, and this flow does none of that. Reading the picked file with `file.text()` makes no request (§4).
- **Import: use `<input type="file" accept=".json,application/json">`.** On Android, Chromium opens the system picker. The user can pick from Downloads or from a cloud provider such as Drive. Validate the content in code, because `accept` is only a hint (§3).
- **Web Share with files cannot send a `.json` file.** Chromium allows only a fixed list of types, and JSON is not on it. A `.txt` file with `text/plain` is allowed. Firefox does not support file share at all (§2).
- **The File System Access API is not an option.** Brave turns it off by default (§5).
- **Recommendation:** one **Export** button that downloads `wanikani-history-<date>.json`, and one **Import** button with a file input. Skip Web Share. If the owner later wants "send to Drive" in one tap, add a Share button that shares the same data as a `.txt` file, and accept `.txt` on import.

---

## 1. Export with `<a download>` and a Blob URL

Pattern: build a `Blob` of type `application/json`, call `URL.createObjectURL(blob)`, set it as the `href` of an `<a download="name.json">`, call `click()`, then `URL.revokeObjectURL(url)`.

- **Support.** `<a download>` is in Chrome Android since 18, Chrome desktop since 14, Firefox since 20, Safari since 10.1, Safari iOS since 13. Since Chrome 65, `<a download>` does not work cross-origin. A `blob:` URL that the page creates is same-origin, so this does not apply ([MDN BCD `html.elements.a.download`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#download)).
- **Revoke.** "To release an object URL, call `revokeObjectURL()`" ([MDN `URL.createObjectURL()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static)). Revoke after the click, for example in a `setTimeout`, so the download can start first.
- **Where the file goes on Android.** Chrome Help says the file "will be saved in your default download location". It also says: "To find all the files that you've downloaded to your device, open the Files app". The browser menu has a **Downloads** page where the user can open, share, rename, or delete the file ([Chrome Help, Android](https://support.google.com/chrome/answer/95759?hl=en&co=GENIE.Platform%3DAndroid)). Brave Android uses the same Chromium download stack. From the Downloads page the user can share the file to Drive or to another app.
- **Desktop.** The browser saves to its download folder or asks for a location, per the user's settings.

## 2. Web Share API with files

- **Rules.** `navigator.share()` needs a secure context, transient activation (a click), and the `web-share` Permissions Policy. It throws `NotAllowedError` when "a file share is being blocked due to security considerations", and `AbortError` when the user cancels. MDN says "always test with `navigator.canShare()`" ([MDN `Navigator.share()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)). The app sends no `Permissions-Policy` header, so the default allowlist (`self`) applies.
- **Support for `files`.** Chrome Android 76+, Chrome desktop 89+, Edge 81+, Safari 14+. Firefox and Firefox Android: no ([MDN BCD `api.Navigator.share.data_files_parameter`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share#browser_compatibility)). Before Chrome 128, desktop `share()` worked only on ChromeOS and Windows.
- **Brave.** The Brave tracker shows `navigator.share()` turned off only in Tor windows ([brave-browser#48770](https://github.com/brave/brave-browser/issues/48770), [#47726](https://github.com/brave/brave-browser/issues/47726)). Normal Brave windows keep the Chromium behavior.
- **Allowed file types.** Chromium accepts only a fixed list: PDF, some audio, image, and video types, and the text types `css`, `csv`, `html`, and `txt` (`text/plain`). **`json` / `application/json` is not on the list** ([Chromium `webshare/FILE_TYPES.md`](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/modules/webshare/FILE_TYPES.md)). Limits: at most 10 files and 50 MB per file (`kMaxSharedFileCount`, `kMaxSharedFileBytes` in [`share_service_impl.h`](https://chromium.googlesource.com/chromium/src/+/main/chrome/browser/webshare/share_service_impl.h)).

**Consequence:** to share, the app must name the file `.txt` with type `text/plain`. `canShare({ files })` returns false for a `.json` file. The download path already lets the user share from the Downloads page, so Web Share is optional.

## 3. Import with `<input type="file">`

- **`accept` is a hint.** "The `accept` attribute doesn't validate the types of the selected files ... it provides hints for browsers" ([MDN `<input type="file">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file)). The app must parse the file and validate its shape before the merge.
- **Android picker.** Chromium on Android sends an Android intent (`ACTION_GET_CONTENT` with `CATEGORY_OPENABLE`) through a chooser. The system picker lists local storage, Downloads, and installed document providers such as Drive ([Chromium `SelectFileDialog.java`](https://chromium.googlesource.com/chromium/src/+/main/ui/android/java/src/org/chromium/ui/base/SelectFileDialog.java)).
- **How `accept` maps on Android** (same file):
  - Each extension becomes a MIME type through Android `MimeTypeMap`. An unknown extension becomes `application/octet-stream`, and then the picker shows all files.
  - The MIME types go into `EXTRA_MIME_TYPES`, so the picker greys out files of other types.
  - With an empty `accept`, Chromium treats the input as accepting images, video, and audio. It then adds camera, camcorder, and sound recorder entries to the chooser. A non-empty `accept` such as `.json,application/json` keeps them out.
- **Risk.** If a provider reports a `.json` file with a different MIME type, the picker can grey it out. If that occurs on the device, widen `accept` (for example add `text/plain`) or remove it.
- **Read.** `await input.files[0].text()` and then `JSON.parse`. This reads local data and makes no network request.

## 4. CSP in `src/middleware.ts`

Production policy: `default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' https://api.wanikani.com; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`.

- **`'self'` does not match `blob:`.** The matching algorithm says: "If url's scheme is "blob", return "Does Not Match"" ([CSP3 §6.7.2.8](https://w3c.github.io/webappsec-csp/#match-url-to-source-expression)). Thus `fetch(blobUrl)` (`connect-src`) or `<img src="blob:...">` (`img-src`) is blocked under this policy.
- **Downloads are not covered.** The fetch directives cover subresource requests: `img-src` covers "requests whose destination is "image"", and `connect-src` covers `fetch`/XHR/WebSocket. The only navigation directives are `form-action` and `frame-ancestors`. CSP3 has no `navigate-to` directive. A click on `<a download href="blob:...">` is a download navigation, so the policy does not block it ([CSP3 §6.1, §6.4](https://w3c.github.io/webappsec-csp/)).
- **Web Share and file inputs** are not CSP features. `navigator.share()` is gated only by the `web-share` Permissions Policy (§2).

**Consequence:** the recommended flow needs no CSP change. Do not `fetch()` the blob URL or show it in an `<img>`. If a later feature needs that, add `blob:` to the matching directive.

## 5. File System Access API (`showSaveFilePicker`)

Chrome Android supports `showSaveFilePicker` and `showOpenFilePicker` since 132. Firefox and Safari do not ([MDN BCD `api.Window.showSaveFilePicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker)). Brave turns the API off by default. It is available only behind a flag ([brave-browser#18979](https://github.com/brave/brave-browser/issues/18979), [#29411](https://github.com/brave/brave-browser/issues/29411), [#57564](https://github.com/brave/brave-browser/issues/57564) "file-system-access apis on android?", open). Do not use it.

## Open points

- Test the full flow on the owner's phone: download, find in Files, move to another device, pick in the import dialog. Check that the `accept` filter does not grey out the file when it comes from Drive.
