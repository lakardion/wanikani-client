# IndexedDB durability on Brave Android

Research for lakardion/wanikani-client#34 (map #33). Question: how durable is a few-MB **History** in IndexedDB for this app in Brave on Android, and which data-loss mitigations does the spec need? Every claim cites a primary source. Research date: 2026-10-24. Brave and Chromium source was read on `main` on that date.

## Bottom line

- **Quota is not a risk.** A Chromium origin can use up to 60% of total disk. A few MB is far below that (§1).
- **The browser rarely evicts data by itself.** Chromium evicts best-effort data only under storage pressure, least-recently-used origin first, and the whole origin at once. A persistent origin is skipped (§1).
- **`navigator.storage.persist()` never prompts in Brave.** Brave uses Chromium's decision code unchanged. It grants silently when the site is an installed web app or one of the top 10 "important sites" (engagement, bookmark, home-screen launch, notification permission). Otherwise it denies silently. It also denies if the site's cookies are session-only (§2).
- **Add to home screen on Brave Android makes a plain shortcut, not a WebAPK.** So the "installed web app" auto-grant does not apply. Launching from the shortcut still adds engagement and a home-screen signal (§2, §4).
- **Brave's data-clearing features are all off by default on Android.** "Clear data on exit", Shred auto-clear, and "Forget me when I close this site" all default to off. If the owner turns one on, it deletes **History**, and `persist()` does not protect against it (§3).
- **The real risks are user actions and device events.** These are clearing site data, a manual Shred, Android "Clear storage" for Brave, uninstalling Brave, or losing the phone. No browser API protects against them. Only an export does.

### Recommended mitigations for the spec

1. **Request persistence, silently.** Call `navigator.storage.persist()` after a user gesture (for example when the user dismisses the first-open warning). On each later app start, if `navigator.storage.persisted()` is `false`, call `persist()` again. It is free and never prompts. A grant can come later, as engagement grows (§2).
2. **Show the status.** In the settings popover, show whether storage is persistent. This tells the owner if the browser can still evict **History** under storage pressure.
3. **Add an export reminder.** Persistence does not protect against the risks above. Show the date of the last export and a nudge when there are many new records since then. The export file is the only backup.
4. **Catch quota errors on write.** A `QuotaExceededError` is very unlikely at this size. Do not lose the in-memory record silently if it occurs.
5. **No need** for quota checks with `navigator.storage.estimate()`, a notification-permission request to win persistence, or an install flow.

---

## 1. Quota and eviction in Chromium

**Quota.** "In browsers based on the Chromium open-source project, including Chrome and Edge, an origin can store up to 60% of the total disk size in both persistent and best-effort modes." Chrome as a whole uses "at most 80% of the total disk size." Source: MDN, <https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria>. web.dev states the same numbers: <https://web.dev/articles/storage-for-the-web>.

A **History** of a few MB (about 2–3 KB per record) uses a tiny part of this on any phone.

**Best-effort vs persistent.** From the MDN page above:

- Best-effort (the default) "persists as long as the origin is below its quota, the device has enough storage space, and the user doesn't choose to delete the data via their browser's settings."
- Persistent data "is only evicted, or deleted, if the user chooses to, by using their browser's settings."

**Eviction.** Under storage pressure, browsers use an LRU policy: "The data from the least recently used origin is deleted." This "skips over origins that have been granted data persistence." Eviction is all-or-nothing per origin: "all of its data, not parts of it, is deleted at the same time." Proactive (time-based) eviction "happens only in Safari." Overall, "data is very rarely deleted by the browser." Source: MDN page above.

So on Brave Android, a best-effort **History** is at risk only when the phone runs low on disk and this app is the least recently used origin. A persistent **History** is not at risk from eviction.

## 2. What `navigator.storage.persist()` does in Brave

**No prompt.** "Safari and most Chromium-based browsers, such as Chrome or Edge, automatically approve or deny the request based on the user's history of interaction with the site and do not show any prompts to the user." (MDN page above). web.dev: Chromium browsers "automatically handle the permission request, and do not show any prompts to the user". A denied request "can be requested again later and will be evaluated using the same heuristics." It advises to call it from a user gesture, not on page load. Source: <https://web.dev/articles/persistent-storage>.

**Chromium's decision code.** `PersistentStoragePermissionContext::DecidePermission` in <https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/browser/storage/persistent_storage_permission_context.cc> does this, in order:

1. Deny if the requesting frame is not the top-level origin.
2. Deny if the origin's cookies are session-only or full cookie access is not allowed ("Don't grant durable for session-only storage, since it won't be persisted anyway").
3. Grant if the registrable domain has an installed web app (`GetInstalledRegisterableDomains`).
4. Grant if the registrable domain is in the top 10 of `GetImportantRegisterableDomains` (`kMaxImportantResults = 10`).
5. Otherwise deny. Every branch is final (`is_final = true`) and has no prompt.

**Important sites.** `ImportantSitesUtil::GetImportantRegisterableDomains` in <https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/browser/engagement/important_sites_util.cc> collects domains that have any of these:

- site engagement at least `MEDIUM`,
- a home-screen launch (`installed_bonus > 0`, reason `HOME_SCREEN`),
- notification permission granted,
- persistent storage already granted,
- a bookmark (top 5 bookmarks by engagement).

It sorts them by reason weight, then engagement. The weights are notifications 16, home screen 8, bookmarks 4, persistent 2, engagement 1 (`GetScoreForReason`). Only the top 10 count.

**Engagement numbers.** From <https://chromium.googlesource.com/chromium/src/+/refs/heads/main/components/site_engagement/content/site_engagement_score.cc>: the `MEDIUM` boundary is 15 points, a site can earn at most 15 points per day, and scores decay over time. A launch from a home-screen shortcut adds 5 bonus points for 10 days (`kMaxDaysSinceShortcutLaunch = 10`, `web_app_installed_points = 5`). Daily use of the app reaches `MEDIUM` in a few days.

**Installed web apps on Android.** `GetOriginsWithInstalledWebApps` in <https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/browser/webapps/installable/installable_utils.cc> returns only WebAPKs or TWAs on Android (`ShortcutHelper::GetOriginsWithInstalledWebApksOrTwas()`).

**Brave changes nothing here.** A code search of `brave/brave-core` finds no override of the persistent-storage permission context, the important-sites util, or `PERSISTENT_STORAGE`. So Brave uses the Chromium logic above. (GitHub code search can miss files. This is strong evidence, not proof.)

**What this means for the app.** The owner uses the app often, so it will likely enter the top 10 within days. A home-screen launch adds weight 8, which beats bookmark-only and engagement-only sites. The risk is that the owner's other high-engagement sites and sites with notification permission outrank it. The app cannot know in advance. It can only call `persist()` and read `persisted()`.

## 3. Brave features that clear site data

All defaults below are from `brave/brave-core` source.

| Feature | What it clears | Default on Android | Source |
| --- | --- | --- | --- |
| **Clear data on exit** (Settings > Brave Shields & privacy) | On the next cold start, clears history, **site data**, and cache for all time | Off (`readBoolean(BRAVE_CLEAR_ON_EXIT, false)`) | `android/java/org/chromium/chrome/browser/app/BraveActivity.java` |
| **Shred, auto mode** (per site or global: never, last tab closed, app exit) | The site's data when the trigger fires | Never (`AutoShredSetting` default `AutoShredMode::NEVER`). The Shred feature is on by default on Android, so the manual Shred button exists. | `components/brave_shields/core/common/brave_shields_settings_values.h`, `shields_settings.mojom`, `components/brave_shields/core/common/features.cc` |
| **Forget me when I close this site** (forget first-party storage) | First-party storage after the site is closed | Off (`kBraveForgetFirstPartyStorageByDefault` = `false`). On Android the toggle is hidden when Shred is on, and Shred replaces it. | `chromium_src/net/base/features.cc`, `android/java/org/chromium/chrome/browser/privacy/settings/BravePrivacySettings.java` |
| **Shields cookie control** | Blocks cross-site cookies by default | `BLOCK_THIRD_PARTY`. First-party IndexedDB is not affected. | `brave_shields_settings_values.h` |

Brave's help center documents "Clear data on exit" at <https://support.brave.app/hc/en-us/articles/360054509991-How-do-I-manage-Cookies-and-Site-data-in-Brave-on-Android> (the page blocks automated fetches, so the facts above come from source).

None of these features asks about persistent storage. Each one deletes **History** if the owner turns it on, or taps the manual Shred button on the app's site. If a setting makes the site's cookies session-only, `persist()` is also denied (§2, step 2).

## 4. Does adding the app to the home screen help?

- Brave Android has no WebAPK support. "Add to home screen" makes a shortcut with a Brave badge. The open issue <https://github.com/brave/brave-browser/issues/7357> ("Investigate WebAPK's support on Brave", open since 2018, still active in 2026) tracks this. So the installed-web-app grant in §2 step 3 does not apply.
- A home-screen launch still counts. Chromium records a launch from a home-screen shortcut with `SetLastShortcutLaunchTime`, which gives the `HOME_SCREEN` reason and 5 engagement points for 10 days (§2). The launch hook is in `chrome/browser/android/metrics/launch_metrics.cc` (<https://chromium.googlesource.com/chromium/src/+/e9b1018/chrome/browser/android/metrics/launch_metrics.cc>, older revision; this research did not check that Brave's shortcut launches reach it).
- It does not change quota, eviction rules, or Brave's clearing features.

So the spec does not need an install flow. "Add to home screen" is an optional tip that may help `persist()` succeed.
