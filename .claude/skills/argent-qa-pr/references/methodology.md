# AI PR Testing Methodology — Expensify App (POC)

How an AI agent should test an Expensify `App` pull request by reproducing its
fixed bug and verifying the fix, end-to-end, on a real running app.

> **Core principle:** The PR's "Tests" section is **not enough**. A test is only
> meaningful if it runs the *actual scenario* the PR addresses, on the *right
> platform/layout*, against the *exact UI element*, and compares **`main` (bug)
> vs the PR branch (fix)**. Reproducing a look-alike flow on the wrong platform
> produces a confident but worthless "pass".

---

## Phase 0 — Triage (decide if it's testable at all)

1. Skip if the PR title contains **`[No QA]`**.
2. Read the PR body. If the steps require **external integrations you cannot set
   up** (QBO/Xero/NetSuite/Sage, Plaid/bank, card issuing, real payments), record
   `NOT_TESTABLE` in `triage-log.md` with the reason. Don't fake it.
3. **Record every triaged PR in `ai-qa-poc/triage-log.md`** — a single table that is
   the home for all triage "marks". For each PR log: PR#, issue#, title, native
   platforms, a **difficulty rating** (🟢 Easy / 🟡 Medium / 🔴 Hard — difficulty to
   *test*, from data/setup/interaction needs, not difficulty to fix), and a **status**
   (`TESTED` / `CANDIDATE` / `NOT_TESTABLE` / `SKIPPED_WEB_ONLY` / `SKIPPED_OTHER`).
   `TESTED` rows link to their `PR-<n>/report.md`. This way skips and not-testables
   are visible with their reason, not silently dropped.

### MVP scope: MOBILE ONLY (Argent covers iOS/Android simulators, NOT web)

Argent drives iOS/Android simulators only — there is **no desktop-browser
automation** in this setup. So scope every candidate by the platforms in the
linked issue's "Platforms reproduced" checkboxes:

- **Mobile-only** (iOS App and/or Android App — native; **mWeb does not count**, it's
  a browser) → **TEST IT** on the simulator.
  - **If BOTH iOS App and Android App are reproduced → test BOTH platforms.** Boot
    the iOS simulator *and* the Android emulator, run the full before/after on each,
    confirm the fix works on both, and include **before/after screenshots for both
    platforms** in the report. Don't generalize from one platform to the other —
    layout, gestures, and native behavior differ. If only one mobile platform is
    checked, test just that one.
- **Web-only** (only Windows: Chrome and/or macOS: Chrome/Safari, or only **mWeb** —
  mWeb is a mobile *browser*, which Argent's native driving can't test) → **SKIP**.
  Record it in `triage-log.md` with status `SKIPPED_WEB_ONLY`.
- **Both mobile and web** (a mobile box AND a desktop box are checked) → **test the
  MOBILE path only**, and put a **prominent disclaimer at the top of the report**:

  > ⚠️ **Tested on mobile (iOS/Android simulator via Argent) only. The web/desktop
  > path was NOT tested.** This bug is also reported on web (Windows Chrome /
  > macOS Chrome-Safari); that platform is out of scope for this Argent-based run.

## Phase 1 — Gather the FULL context (this is where the real signal is)

Do **all** of these before touching the app. Each one changes how/where you test.

1. **PR body** — extract `### Tests`, `### Offline tests`, `### QA Steps`.
2. **Follow every reference in the PR**, especially:
   - the **linked GitHub issue** (the `$ https://github.com/.../issues/<id>` line),
   - the **PROPOSAL** comment link.
   Use `gh issue view <id> --repo Expensify/App --json title,body,labels`.
3. **From the linked issue, extract the decisive details the PR body usually omits:**
   - **Platforms reproduced** (the checkbox list: Android App / iOS App / mWeb /
     Windows Chrome / macOS Chrome-Safari). → **This dictates the environment.**
   - **Exact reproduction steps** (often more precise than the PR's "Tests").
   - **Expected Result vs Actual Result** — read literally. They often reference
     **layout concepts** ("super-wide modal", "RHP", "Inbox page", "LHN") that
     only exist on a specific screen width.
   - Version, and any attached screenshots/videos of the bug.
4. **Read the PR code diff** — `gh pr diff <n> --repo Expensify/App` and
   `gh pr view <n> --json files`. The changed files/functions tell you:
   - the **exact component/element** involved (e.g. a fix in
     `ParentNavigationSubtitle.tsx` means the element under test is the
     "From <report> in <workspace>" parent link — *not* some other field that
     looks similar),
   - the **layout/platform conditions** the logic branches on
     (`shouldUseNarrowLayout`, `isSmallScreenWidth`, RHP navigators,
     `SEARCH_FULLSCREEN_NAVIGATOR`, etc.) — these confirm whether it's a
     wide-screen or narrow-screen behavior.

Output of this phase: a short **context brief** = {platforms, exact steps,
expected, actual, exact element, layout condition, files touched}.

## Phase 2 — Choose the right environment (derived from Phase 1, not guessed)

- **Platform:** pick the native simulator(s) from the issue's reproduced platforms —
  iOS App and/or Android App (both, if both are checked). Behavior that only exists
  on wide screens (desktop/tablet layouts) is out of scope; such PRs are `SKIPPED_WEB_ONLY`.
- **How to run:** start Metro first (`npm run start`, see gotchas below), then launch
  and drive the app on the iOS simulator / Android emulator via the device-automation
  tooling (Argent).
- **Account/data:** ensure backend connectivity and the **right data state**
  (e.g. an expense/report must actually exist in the view the steps start from).
  Create disposable test data if needed, on the agreed test account/workspace.
- **Login is autonomous.** A fresh install is logged out; log in with the test account and
  **fetch the emailed code automatically** via the skill's helper
  (`helpers/fetch-magic-code.mjs`, Gmail/IMAP — no human code entry). Full steps in
  **SKILL.md → Step 0**. (`000000` only works on the dev VM; prod/staging use real emailed codes.)
- **Repro hygiene — escalate least-destructive first.** The app should be runnable
  out of the box. If it misbehaves (stuck spinners, "offline", jammed queue, weird
  state), reset in this order:
  1. **Clear cache and restart FIRST** (in-app: Account → Troubleshoot → "Clear cache
     and restart"). This wipes stale Onyx state but **keeps the login session AND the
     "Use Staging Server" toggle** — most weird states are fixed here, non-destructively.
  2. **Only if that doesn't fix it → uninstall + reinstall.** A fresh install wipes the
     whole data container, which **also wipes the login + the staging toggle** — you'll
     drop back to logged out and have to log in again (and re-toggle staging if you use
     it). So it's the heavier fallback, not the first move. Preserve
     the binary and reinstall it:
     ```bash
     APP=$(xcrun simctl get_app_container <udid> <bundleId> app)
     cp -R "$APP" /tmp/app.app && xcrun simctl uninstall <udid> <bundleId>
     xcrun simctl install <udid> /tmp/app.app && xcrun simctl launch <udid> <bundleId>
     ```
  **Only if a fresh reinstall still fails** is it a deeper problem (network/backend/
  edge) — then investigate (see gotchas) and report what makes it untestable.
- **If login hangs, PAUSE and ease off — don't thrash.** A hung `BeginSignIn` under
  heavy automated traffic is most likely **transient rate-limiting**; hammering it makes
  it worse. Reduce request volume, wait a bit, and **retry** — it normally clears (login
  works fine in the app under normal conditions). Don't pivot away on the first spin.

## Phase 3 — Before/after: reproduce on `main`, then verify on the PR branch

This is mandatory — a single-branch result can't prove a fix.

1. **`main` first** — run the exact steps and **capture the bug** (the "Actual
   Result" from the issue). Screenshot every step.
2. **Switch to the PR branch** — `gh pr checkout <n>`.
   - **JS-only** change (most navigation/UI fixes) ⇒ just reload the app (relaunch to
     re-fetch the bundle from Metro); no native rebuild.
   - Native change (ios/android/Podfile/package.json/native deps) ⇒ rebuild.
3. **Re-run the identical steps** on the PR branch and capture the **"Expected
   Result"**. Screenshot every step.
4. **Compare**: did Actual→Expected actually change? That's the verdict.

### Testing both platforms (default: one app live at a time)

Both an iOS simulator **and** an Android emulator can be **booted at once** — that's the
normal setup, works fine here, and is **never** a reason to skip a reported platform. The
limit isn't co-resident *devices*, it's co-resident *app bundles on Metro*: the genuine
failure mode is **two live app bundles on one Metro** — most sharply, **two concurrent full
bundle builds** (both apps reloading right after a branch switch) OOM-crashing Metro (exit
134) even at a 12 GB heap. So run the **app on only one platform at a time**.

The default for a both-platform PR is therefore **sequential within each branch**:

1. On **`main`**: test one platform, then the other — capture BEFORE screenshots for each
   (`ios-main-*.png`, `android-main-*.png`). Only the platform under test runs the app;
   **kill the app on the other but leave its device booted** (terminate, don't shut down):
   - iOS: `xcrun simctl terminate <udid> com.expensify.chat.dev` (sim stays booted)
   - Android: `adb -s <serial> shell am force-stop com.expensify.chat.dev` (emulator stays running)
2. **The branch switch is the barrier** (git + Metro are shared across both devices) — you
   can never have one device on `main` while the other is on the PR branch. Move both to the
   PR branch together with `gh pr checkout <n>`; only the platform under test relaunches /
   rebuilds its bundle.
3. On the **PR branch**: test each platform again for the AFTER screenshots.
4. Synthesize the combined two-platform report.

- Give Metro headroom for a both-platform session: `NODE_OPTIONS="--max-old-space-size=12288"`.
- Health gate before a heavy run: `memory_pressure` free % and `sysctl -n vm.loadavg` — a
  healthy reading with both sims booted (one app live) is normal; treat a problem as a reason
  to **sequence** work, not to drop a platform.

**Exception — true parallel** (a subagent per device, **both apps live at once**) is only
worth it for **light, read-only flows** (search, navigation). Even then, mind the
**shared-account hazard:** both devices use the **same test account**, so two parallel
subagents that **create/edit data** can confound each other. For any data-mutating flow,
drive **sequentially** — or give each device a **distinct, identifiable value** (e.g.
different amounts) and verify only its own delta, or use **separate accounts**.

## Phase 4 — Execute the steps robustly

- Drive the **exact element** identified in Phase 1 (from the issue + diff), not a
  visually similar one.
- Loop **interact → screenshot → verify** for each step and each "Verify…" assertion.
- **Prefer what a real user would do.** Favor genuine interactions — tap, **long-press**,
  double-tap, swipe, scroll, type. Tool helpers (`adb input`, `adb am start`, deep links,
  CDP) are fine as a **fallback to unblock**, but the closer the repro is to the real user
  path the stronger the evidence; if you rely on a shortcut a user couldn't perform, note
  the deviation.
- **When one way to accomplish the goal fails, find another *way to accomplish the same
  goal* — don't just nudge coordinates.** Reason about the user's intent (e.g. "share an
  image into the app") and enumerate alternative routes to the same outcome: a different
  gesture (long-press vs tap), a different entry point, a different app that reaches the same
  screen, a different feature that lands in the same flow. **When you don't know the
  options, search the web** for how a real user does *X* on that platform/app, then try
  them. Only report a blocker once the alternative *ways* are genuinely exhausted.
- **Recognize and report blocker/failure states instead of faking a pass:**
  offline banner, error boundary ("Something went wrong"), stuck loading
  skeletons, wrong layout, missing element. But first run the ladder above — most
  "missing/undrivable element" dead-ends are really "wrong gesture tried once."

## Phase 5 — Document the report & post it as a PR comment

The deliverable is a **comment on the PR** carrying the full before/after report with
**inline screenshots**. GitHub renders comment images only from public URLs — local paths
don't render, base64 data URIs are stripped, and the native drag-drop upload
(`user-attachments`) is browser-cookie-only and **cannot be automated**. So screenshots are
pushed to a small **evidence repo** and embedded via its `raw.githubusercontent.com` URLs.

Flow:
1. Save the per-step screenshots locally under `ai-qa-poc/PR-<n>/screens/` (the upload source),
   named with a platform prefix: `ios-main-2-*.png`, `ios-pr-2-*.png`, `android-main-2-*.png`, …
2. Publish them and capture the base raw URL:
   `BASE=$(bash .claude/skills/argent-qa-pr/helpers/publish-evidence.sh <n> ai-qa-poc/PR-<n>/screens)`.
   The target repo/branch come from `EVIDENCE_REPO`/`EVIDENCE_BRANCH` (process env, else
   `helpers/.env`) — each user sets their **own** public evidence repo there; it's never
   hardcoded in the skill. The active `gh`/git identity needs `contents:write` on that repo
   (a fine-grained PAT or a GitHub App token in CI).
3. **Record a video of the full flow on EACH branch (standard, not optional). Record long, cut later.**
   One screen recording per `main`/PR × platform (1-platform PR → 2 videos; both-platform → 4). Keep the
   recording rolling through the whole session (lead-in → repro → settle) so there's context on each side
   of the repro; don't start/stop around just the key action. `helpers/clip-to-evidence.sh` then emits
   **two artifacts** from one raw: a **tight inline GIF** (just the repro action) and a **longer linked
   MP4** padded to **repro ± `CLIP_CONTEXT_SEC`** (default 20s). Workflow: run it with `--contact <raw>`,
   Read `/tmp/_clip_contact.png`, find the repro window on the normalized timeline, then
   `clip-to-evidence.sh <raw> <out> <gif_start> <gif_dur> 320` (the MP4 auto-pads). Named `android-main`,
   `android-pr`, `ios-main`, `ios-pr`. `adb screenrecord` is slow to init — wait ~4s before the first
   action (`--time-limit` caps the file). The **stills + GIFs** ship inline (stills pin the end-state,
   GIFs make cause→effect legible); the **MP4 link** carries the context. Only skip a branch's video if
   the flow genuinely can't be driven on that platform (say so) — "the bug is static" is not a reason to
   skip; if nothing animates, drive a short flow that exercises the behaviour so the take has real motion.
4. Publish screenshots **and** videos/GIFs and capture the base raw URL (multi-dir, auto-skips `*-raw.*`):
   `BASE=$(bash .claude/skills/argent-qa-pr/helpers/publish-evidence.sh <n> ai-qa-poc/PR-<n>/screens ai-qa-poc/PR-<n>/videos)`.
5. Write `ai-qa-poc/PR-<n>/report.md` (kept as the local source/backup) — embed each screenshot **and
   each branch's GIF** as `![caption]($BASE/<file>.png|.gif)` (the **raw URL**, never a relative path)
   and **link the MP4s** as `[MP4]($BASE/<file>.mp4)` (raw MP4 URLs don't inline-play; GIFs auto-loop).
   Start the body with `<!-- argent-qa-pr -->` and end with a footer noting it's an automated mobile QA run.
6. Post it: `gh pr comment <n> --repo Expensify/App --body-file ai-qa-poc/PR-<n>/report.md`. To **update**
   an existing comment instead of duplicating, PATCH it:
   `gh api --method PATCH repos/Expensify/App/issues/comments/<id> -F body=@ai-qa-poc/PR-<n>/report.md`.
7. Update the `triage-log.md` row to `TESTED` + result and link the posted comment.

The report body must contain:
- **Context**: issue link + summary, PR link, platforms, exact steps,
  Expected vs Actual, files touched + one-line "what the diff does".
- **Environment**: platform/device(s), account/workspace, branch + commit.
- **Before (`main`)**: numbered steps, ending in the bug.
- **After (PR branch)**: same steps, ending in the fix.
- **Per platform when testing more than one.** If both iOS and Android are in
  scope, give each its **own Before/After section** with its own screenshots
  (don't reuse one platform's shots for the other), and a per-platform verdict.
  Name screenshots with a platform prefix: `ios-main-2-*.png`, `ios-pr-2-*.png`,
  `android-main-2-*.png`, `android-pr-2-*.png`.
- **One directory per PR.** Layout (the methodology itself lives in the skill at
  `.claude/skills/argent-qa-pr/references/methodology.md`; `ai-qa-poc/` holds only the local
  source/backup — the published artifact is the PR comment):
  ```
  ai-qa-poc/
    triage-log.md
    PR-<number>/
      report.md     # exact body posted to the PR (images = raw evidence-repo URLs)
      screens/      # upload source: ios-main-2-*.png, ios-pr-2-*.png, android-main-2-*.png, …
  ```
- **Embed screenshots inline** with Markdown image syntax — `![caption]($BASE/<file>.png)` using
  the **raw evidence-repo URL** from `publish-evidence.sh` (step 2 above), **never a relative
  `screens/<file>.png` path** — relative paths render in a local file but show as broken images in
  the GitHub comment, which is the actual deliverable.
- **Verdict**: PASS/FAIL with the explicit Actual→Expected delta, plus any caveats.

---

## Anti-patterns (do not do these)

1. **Wrong platform / platform substitution.** Testing a bug on a platform/layout where it
   can't appear (e.g. a wide-screen "super-wide modal"/RHP bug on a narrow phone) yields a
   meaningless "pass". Pick the platform from the issue's reproduced checkboxes — and test
   **exactly** those. **Never substitute the other native platform** because it's already
   booted, faster, or because the fix "is just shared JS": an Android-reported bug is tested
   on **Android**. Both sims can run at once, so there is no resource excuse. If the reported
   platform truly can't be run, mark it `NOT_TESTABLE` — don't pass it off on another platform.
2. **Look-alike element.** Acting on an element that merely resembles the one in the
   issue (different element ⇒ different behavior). Confirm the exact element from the
   issue + the code diff.
3. **Single branch.** Testing only `main` or only the PR branch — no before/after
   means nothing is actually validated.
4. **Trusting the PR "Tests" alone** without the linked issue's platform +
   Expected/Actual context.
5. **Faking a pass** when the real scenario wasn't reproduced.

## Expensify-specific environment gotchas (observed)

- **Android emulator (hard-won, this host):**
  - **Boot:** argent `boot-device` may fail (`-gpu auto` → `exited code 1`; corrupt AVD
    snapshots). Workaround: **manual cold boot** —
    `~/Library/Android/sdk/emulator/emulator -avd <name> -no-snapshot -no-boot-anim -gpu swiftshader_indirect -memory 6144 &`
    then `adb wait-for-device`, wait for `getprop sys.boot_completed = 1`,
    `adb reverse tcp:8081 tcp:8081`. argent's `list-devices`/`describe`/gestures then attach
    to the running `emulator-<port>` fine.
  - **`-memory 6144` is essential.** At the AVD default (~2 GB) the *guest's*
    `lowmemorykiller` OOM-kills the heavy dev build mid-run (`thrashing 343%`, app silently
    dies → drops to launcher). Host RAM is usually not the problem; the **guest** allocation is.
  - **Driving the UI:** `adb input` is more reliable than argent gestures on a
    software-rendered emulator. Plain taps on cross-app surfaces (e.g. a Google Photos
    thumbnail) often **don't register**; a **long-press via `adb shell input swipe X Y X Y 1000`**
    (same point, 1 s hold) does. Read coordinates with argent `describe` (normalized) but
    **multiply by the real pixel size** (`adb shell wm size`) for `adb input` taps.
  - **Native share repro:** drive the **real** flow (gallery → long-press → Share →
    "New Expensify Dev" → Share tab). A synthetic `adb am start -a SEND` reaches
    `FileIntentHandler` but `copyUriToStorage` returns null for an `am`-injected MediaStore
    URI (no real URI grant), so the share object is never persisted → "No data found".
  - Screenshots: `adb exec-out screencap -p > x.png` then downscale for viewing
    (`sips -Z 1100 x.png --out x-s.png`) — full-res Android frames exceed the image read limit.

- **Metro OOM:** the bundle is large; start Metro with a bigger heap or it crashes
  with `JavaScript heap out of memory`:
  `NODE_OPTIONS="--max-old-space-size=8192" npm run start`. **Testing both iOS and
  Android off one Metro roughly doubles memory** — bump to `--max-old-space-size=12288`
  or Metro can crash mid-session (exit 134 / SIGABRT) and both apps lose their bundle server.
- **Dev build hits production** by default (no `.env`). Cloudflare returns **403**
  to requests with a missing/`node` User-Agent, but the app's own requests carry a
  real UA and get 200 — so a bare host-side `curl` is misleading; reproduce network
  calls **inside the app runtime** (Metro CDP) to judge real connectivity.
- **Stuck `SequentialQueue`:** poisoned optimistic writes (`RequestMoney`/
  `SubmitReport`/`OpenReport`) that fail (403/499/666) and retry can deadlock the
  queue; reads (`Search`) block behind them → Spend > Expenses hangs forever and
  the state **survives relaunches** (persisted in Onyx). Fix: Account → Troubleshoot
  → **Clear cache and restart**.
- **Login can transiently hang under heavy automated traffic — but it is NOT a wall.**
  Login normally works in the app (real emailed magic code). Under heavy automated request
  volume `BeginSignIn` can hang (Continue spins; logs show
  `[Network] Making API request - BeginSignIn` with no "Finished") — most likely transient
  rate-limiting that clears on its own. **Remedy: wait and retry**, and ease off request
  volume. Three easy-to-make wrong conclusions to avoid: (1) a bare host-side `node`/`curl`
  probe of `POST .../api?command=BeginSignIn` returns `403 cf-mitigated: challenge`, but
  that's just Cloudflare challenging a *non-browser* client — **not representative of the
  app** (the app's requests log in fine), so never conclude the app is "walled" from it;
  (2) magic code `000000` works **only** on the local dev VM — production and staging both
  use real emailed codes; (3) **staging shares the production database** (same data — not
  a clean sandbox), so it's effectively the same as production for testing.
- **Inspecting app internals:** connect to Metro CDP (`ws` to
  `http://localhost:8081/json/list`) and `Runtime.evaluate` to read console logs /
  run fetches in the app's own context — invaluable for telling "offline" apart from
  "request failing" apart from "queue stuck".

---

## Recipes / unblockers (hard-won — reach for these before declaring a wall)

- **Feasibility pre-check (do FIRST — saves whole runs). Goal: detect setup early so you can
  *prepare* it, not just bail.** Use **deterministic** signals: (1) read the issue
  `Precondition`/`Prerequisite`; (2) `grep -rn "isBetaEnabled" src/pages/<feature>` — the changed
  screen's *entry point* is often beta-gated; (3) once the app is up, probe the account (one CDP
  call) and compare its `betas`/workspaces against what the repro needs. **Don't use a deep-link 404
  as a gate test** — a failed deep link is ambiguous (navigation-not-ready on cold boot, wrong
  route/scheme/domain, bad param), so it's an *unblocker*, not a diagnostic. Then split setup into
  **surmountable** (prepare it) vs **real blocker** (`NOT_TESTABLE`):
  - Surmountable: *fresh account / onboarding* → `+tag` alias (below); *missing data* → create it
    in-app; *UI-gating beta* → Onyx override (below); *gated/hard screen* → deep link (below); *web
    precondition* → do it in a browser, verify on mobile.
  - Real blocker (stop): live external integrations (accounting/bank/Plaid/card/payments) or a beta
    that gates **backend** behavior (a client override won't change server responses).

- **Fresh account in any state via a `+tag` alias (NOT a blocker).** Sign up / log in with
  `<testinbox>+pr<n>@gmail.com` — Expensify treats `+tag` as a distinct account, but Gmail delivers
  the validation/magic-code email to the **base inbox**, which `fetch-magic-code.mjs` reads (it
  strips the tag for IMAP login). Entering the magic code validates the account, so onboarding /
  validated-account / new-user states are all reproducible. Use a **distinct tag per
  platform/branch** to avoid the shared-account hazard.

- **Read account state via Metro CDP.** Onyx is exposed at `globalThis.Onyx`.
  `debugger-evaluate` doesn't await promises, so stash-then-read:
  ```js
  // call 1: (function(){ globalThis.__x='p'; globalThis.Onyx.get('betas').then(b=>{globalThis.__x=b;}); return 'ok'; })()
  // call 2: JSON.stringify(globalThis.__x)
  ```
  Note: with both an iOS sim and Android emulator on one Metro, CDP attaches to whichever app is
  connected. To target the other, **terminate the app you don't want** (e.g.
  `xcrun simctl terminate <udid> com.expensify.chat.dev`) so only your target stays on Metro.

- **Enable a missing beta client-side (for UI/navigation-only bugs).** When the repro's entry is
  gated by a beta the account lacks, and the fix is pure client-side render/nav logic, you can
  surface the entry by injecting the beta into Onyx — applied **identically to both branches**, and
  noted as a deviation in the report:
  ```js
  // after reading current betas into globalThis.__x (above):
  (function(){var b=globalThis.__x; if(!b.includes('workspaceRoomsPage')) globalThis.Onyx.set('betas', b.concat(['workspaceRoomsPage'])); return 'done';})()
  ```
  Betas come from the server on `OpenApp`, so re-inject after a reload/branch-switch.

- **Reach a hard-to-navigate / gated screen via deep link (UNBLOCKER, not a diagnostic).** Find the
  route in `src/ROUTES.ts`, get the id from logs (`adb logcat -d | grep -aoiE '"policyID":"[A-F0-9]+"'`),
  then: `adb shell am start -a android.intent.action.VIEW -d "https://staging.new.expensify.com/<route>" com.expensify.chat.dev`
  (delivers to the running app). Best **after** you've enabled any required beta. Don't read a 404
  ("Hmm… it's not here") as proof of a beta gate — it's ambiguous (it also happens when the link
  arrives before navigation is ready on a cold boot, or the route/scheme/domain/param is wrong);
  confirm gating with the `isBetaEnabled` grep + account `betas` instead.

- **Metro OOM (the bundle is huge).** Symptoms: app shows "Unable to load script" / JS thread
  `SIGABRT`; `grep -i heap /tmp/metro-qa.log` shows V8 GC frames. Fix: kill Metro
  (`pkill -9 -f "react-native start"`) and restart with a big heap + reset cache:
  `NODE_OPTIONS="--max-old-space-size=12288" npm run start -- --reset-cache &`. Then `adb reverse
  tcp:8081 tcp:8081` and relaunch the app.

- **Slow Android cold boots are NORMAL — don't panic or nuke the login.** On this host the dev build
  routinely takes **2–3 min** to get past the green splash (heavy bundle + Onyx migrations; logcat
  shows `BootsplashVisibleOnyxMigrations` then `useSidebarOrderedReports building reportsToDisplay`).
  The clock advancing + JS logs ticking = it's progressing, just slow. **Wait it out**; only treat it
  as broken if logcat shows a `SIGABRT`/`Unable to load script` (→ Metro OOM, above) or it's clearly
  idle for minutes. `adb shell pm clear` / reinstall (which wipes the login) is a LAST resort, not a
  reaction to a slow boot.

- **Android magic-code login is flaky — the field corrupts injected keys.** The 6-box code field
  drops/duplicates `adb`/IME input and ignores backspace under the emulator's floating Gboard.
  **Fix that worked: force-stop + relaunch the app** (`adb shell am force-stop …; monkey -p … 1`) to
  reset the keyboard state, then type the code once into the fresh field. For normal text fields,
  input is usually fine but **verify the field value** (re-dump uiautomator) and **append missing
  chars** rather than retype; **never `input keycombination 113 29` (CTRL+A)** — it can switch apps.

- **Screen recording → inline GIF + linked context MP4.** GitHub renders a GIF inline from a raw URL
  and auto-loops it; it will NOT inline-play a raw/blob MP4 (only its cookie-auth drag-drop upload does).
  So record the whole flow, then `helpers/clip-to-evidence.sh` makes a **tight looping GIF** (embed
  inline, just the repro action) + a **longer MP4** padded to repro ± `CLIP_CONTEXT_SEC` (default 20s,
  link it). Pick the window with `clip-to-evidence.sh --contact <raw>` (reads on the normalized timeline).
  `adb screenrecord` is slow to init — wait ~4s after starting it before the first action (start gets
  clipped otherwise); 180s max per file. **iOS `recordVideo` is variable-frame-rate** so a GIF of a
  static screen flickers and raw seeks drift — the helper CFR-normalizes (30fps) before clipping, so read
  window timestamps off the normalized clip, not the raw.

---

## Checklist (paste into the agent prompt)

- [ ] PR is not `[No QA]` and is testable locally (no unavailable integrations).
- [ ] **Platform scope (MVP): mobile box checked?** Web-only → SKIP. Both → mobile + disclaimer.
- [ ] Read PR body + **opened the linked issue** + read the **PROPOSAL**.
- [ ] Extracted **platforms reproduced**, exact steps, **Expected vs Actual**.
- [ ] Read the **code diff**; identified the **exact element** and **layout condition**.
- [ ] Chose the simulator(s) to **match the reproduced native platform(s)**.
- [ ] Reproduced the bug on **`main`** with per-step screenshots.
- [ ] `gh pr checkout <n>`; reloaded (or rebuilt if native).
- [ ] Re-ran identical steps on the **PR branch**; per-step screenshots.
- [ ] Wrote the **before/after report** with an explicit verdict + caveats.
