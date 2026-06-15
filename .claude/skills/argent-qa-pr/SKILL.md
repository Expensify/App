---
name: argent-qa-pr
description: Tests an Expensify App PR on mobile by reproducing the bug on `main` and verifying the fix on the PR branch, then posts a before/after report (screenshots AND a before/after GIF+MP4 per branch embedded, PASS/FAIL verdict) as a comment on the PR. Recording a video on each branch is a standard deliverable, not optional. Mobile-native (iOS/Android simulators via Argent) only — skips web/mWeb-only PRs. Use when asked to "test PR #X", "verify PR #X works on mobile", "QA PR #X", or given a PR URL to validate.
allowed-tools: Bash, Read, Write, Edit, Agent
---

# argent-qa-pr

Verify whether an Expensify `App` PR **actually fixes its bug**, on real mobile
devices, by running the issue's repro on **`main` (bug) vs the PR branch (fix)** and
**posting a documented before/after report — screenshots embedded, explicit verdict — as a
comment on the PR**.

This skill **composes** the existing **Argent** device tooling rather than reinventing it:
- the **Argent MCP** tools + skills (`argent-test-ui-flow`, `argent-device-interact`) drive
  the simulator/emulator;
- `argent-screenshot-diff` compares before/after;
- this skill adds the layer they don't: **context gathering, mobile-only triage,
  branch-to-branch before/after orchestration, and the PASS/FAIL verdict.**

> **Core principle:** a PR's `### Tests` section is **not enough**. A test is only
> meaningful if it runs the *actual scenario* the PR fixes, on the *platform the issue
> reproduces on*, against the *exact element*, and compares **`main` vs the PR branch**.
> A look-alike flow on the wrong platform is a confident but worthless "pass".

The full reasoning, the hard-won environment gotchas, and the report format live in
**[`references/methodology.md`](references/methodology.md)** — read it before a run.

## When to use / not use

- **Use** when given a PR number/URL to test or verify on mobile.
- **Not** for: web-only behavior (no native automation here — `SKIPPED_WEB_ONLY`),
  pure unit/type checks, or `[No QA]` PRs.

## Inputs

| Input | Form | Required |
| --- | --- | --- |
| PR | number or URL, e.g. `<number>` / `https://github.com/Expensify/App/pull/<number>` | Yes |
| Platforms override | `ios`, `android`, or both | No (default: derived from the issue) |
| Test account / workspace | the agreed disposable test account | assumed |

## Step 0 — Preflight: get the test bed ready (run FIRST, before triage)

Front-load the slow/blocking setup — **app installed, running, and logged in** on each
in-scope simulator — so the actual test run is never interrupted by a build or the
one-time login. Set up **one device at a time** (log into iOS, then Android); both can stay
**booted** — the constraint during testing is one *app* live on Metro, not co-resident
devices (see "Multi-platform & host limits"). **Login persists across reboots**, so each
device only needs logging in once.

For each target platform (default **both iOS + Android**; or just the in-scope one):

1. **Metro running?** `lsof -iTCP:8081 -sTCP:LISTEN -n -P` — else start it:
   `NODE_OPTIONS="--max-old-space-size=8192" npm run start &` (12288 only if you must
   drive both at once — usually don't).
2. **Boot the device** (skip if already booted):
   - iOS: pick an iPhone from `xcrun simctl list devices available`; `xcrun simctl boot <udid>`.
   - Android: `~/Library/Android/sdk/emulator/emulator -avd <name> &`; `adb wait-for-device`;
     wait for `getprop sys.boot_completed = 1`; `adb reverse tcp:8081 tcp:8081`.
3. **App installed?** else install (first time is a slow Rock build):
   - check: `xcrun simctl listapps <udid> | grep com.expensify.chat.dev` /
     `adb shell pm list packages | grep expensify`
   - install: `npm run ios-standalone` / `npm run android-standalone`.
4. **Launch + verify state:** open the app, screenshot, and determine whether it's on
   **Home (logged in)** or the **login screen**.
5. **If logged out → log in (autonomous via the email helper):**
   - Enter the test account email → Continue (via Argent).
   - **Fetch the magic code automatically** instead of asking a human — run the vendored
     reader, which reads it from the test Gmail inbox over IMAP and prints just the code:
     ```bash
     # first run only: (cd .claude/skills/argent-qa-pr/helpers && npm install)
     node .claude/skills/argent-qa-pr/helpers/fetch-magic-code.mjs --timeout 90
     ```
     (Credentials come from `helpers/.env` — gitignored — so no Keychain prompt; see
     `helpers/README.md`.) Type the printed 6-digit code into the sim's code field → logged
     in, **no human**. The **session then persists** across runs.
   - **Fallback:** if the helper isn't set up (no App Password yet) or errors, ask the
     human for the emailed code once.
   - `000000` does **not** work here — that's dev-VM-only; production and staging both use
     real emailed codes (which is exactly what the helper reads).
   - If Continue **hangs** (rare — only seen under heavy automated traffic, likely
     transient rate-limiting), **wait and retry**. It is **not** a hard wall, so don't
     pivot away on the first spin. (A bare host-side `curl`/`node` probe of
     `BeginSignIn` returns a Cloudflare `403 cf-mitigated: challenge`, but that challenges
     a *non-browser* client and is **not representative of the app** — ignore it.)
   - Either backend is fine: **production or staging** (staging shares the prod DB — same
     data — so it's effectively equivalent; we keep the sim on staging via the "Use
     Staging Server" Test Preferences toggle).
   - Do **not** proceed until the app is at **Home, logged in**.
   - ⚠️ For resets prefer **"Clear cache and restart"** (keeps the login). A full
     **reinstall wipes the login** (and the staging toggle) → you'd have to log in again.
6. **Preflight gate:** Metro up **and** each in-scope device has the app installed and is
   logged in. Only then continue to Phase 0. (If a device can't be made ready — build
   fails, login blocked with no human/staging available — report that and stop; don't
   half-run.)

## Process (summary — full detail in `references/methodology.md`)

**Phase 0 — Triage & scope.** Skip `[No QA]`. Resolve the **linked issue** and read its
**`## Platforms:` checkboxes**. Decide status and record a row in `ai-qa-poc/triage-log.md`
with a 🟢/🟡/🔴 difficulty-to-test rating:
- mobile-native reproduced → `CANDIDATE` → test it;
- **web/mWeb only → `SKIPPED_WEB_ONLY`** (Argent can't drive browsers; mWeb is a browser);
- needs a **live external integration you can't stand up locally** (accounting QBO/Xero/NetSuite/
  Sage/Certinia, bank/Plaid, card issuing, real payments) → `NOT_TESTABLE`. (Note: a *fresh account*,
  *onboarding state*, *OldDot web signup*, *missing data/room/workspace*, or a *UI-gating beta* are
  **not** blockers — they're surmountable setup; see **Phase 1.5**.)
- WIP/revert/chore → `SKIPPED_OTHER`.
- **If both iOS App and Android App are checked → test BOTH.**

**Phase 1 — Gather full context.** PR body (`### Tests`/`### Offline tests`/`### QA`) **plus**
the linked issue (exact repro, **Expected vs Actual**, platforms) **plus** the **code diff**
(`gh pr diff <n>`) to pin the **exact element** and any layout/platform condition. **Also read the
issue's `Precondition`/`Prerequisite` lines** — they reveal setup walls the Platforms checkboxes
hide (e.g. "Sign up via staging.expensify.com" = OldDot signup + fresh account; "Account has at
least one workspace / be an admin / has a room" = data/role setup).

**Phase 1.5 — Feasibility pre-check (identify setup EARLY, then prepare it — don't just bail).**
The point isn't to list blockers; it's to surface what the repro needs *before* a long run and
**prepare the surmountable stuff**. Two prior "easy" PRs each burned a run hitting setup we could
have prepped up front. Cheap checks first:
- read the issue `Precondition`/`Prerequisite`;
- **`grep -rn "isBetaEnabled" src/pages/<feature>`** to find the entry screen's beta gate (e.g. the
  "Go to room" list was gated by `CONST.BETAS.WORKSPACE_ROOMS_PAGE`);
- once the app is up, **probe the account**: `globalThis.Onyx.get('betas')` + the workspace list via
  `debugger-evaluate`, and compare against what the repro needs.

(These are deterministic. *Don't* rely on a deep-link 404 as a "is it gated?" test — a failed deep
link is ambiguous: it can also be navigation-not-ready-on-cold-boot, or a wrong route/scheme/domain.
Deep links are an **unblocker** to *reach* a screen, not a feasibility diagnostic.) Then classify:

- **Surmountable → prepare it, then test (NOT a blocker):**
  - *Fresh account / onboarding state* → use a **`+tag` alias** of the test inbox
    (`…+pr<n>@gmail.com`); the magic-code helper reads its code from the base inbox.
  - *Account/data state* (a workspace, a room, an expense, a report) → **create it** in-app first.
  - *UI/navigation behind a beta the account lacks* → **client-side Onyx beta override** (apply to
    both branches, note the deviation).
  - *Hard-to-navigate / gated entry screen* → **deep link** to its route.
  - *Web precondition* (e.g. OldDot signup) → do it in a **browser**; only the *verification* must
    be on mobile.
- **Genuinely `NOT_TESTABLE` locally (real blockers):** live external integrations you can't stand
  up — accounting (QBO/Xero/NetSuite/Sage/Certinia), bank/Plaid, card issuing, real payments — or a
  beta that gates **backend** behavior (a client override won't change server responses). Say so and
  stop; don't half-run.

Recipes for every "prepare it" item (with exact commands) are in `references/methodology.md` →
"Recipes / unblockers".

**Phase 2 — Environment.** Start Metro; bring up the target simulator(s) via Argent; ensure
the right account/data state (create disposable test data if the flow needs it). If the app
misbehaves, **"Clear cache and restart" first** (it keeps the login + staging toggle);
**reinstall only if that fails** — a reinstall wipes the login. If connectivity/auth still
fails after that, **pause & probe**, don't thrash.

**Phase 3 — Before/after (mandatory).** Reproduce on **`main`** (capture the bug) → `gh pr
checkout <n>` → reload (JS-only) or rebuild (native) → re-run the identical steps on the **PR
branch** (capture the fixed behavior). The branch switch is a **barrier**: git + Metro are
shared, so never have one device on `main` while another is on the PR branch.

**Phase 4 — Execute robustly.** Drive the **exact element**; loop interact→screenshot→verify;
**recognize and report blocker states** (offline, error boundary, stuck skeletons, wrong
layout) instead of faking a pass.

**Phase 5 — Report → post as a PR comment.** Build the before/after report and **post it as
a comment on the PR**, with screenshots **and a before/after GIF per branch** embedded inline
(record a video on each branch — see step 3, it's a standard deliverable). Because GitHub renders comment images
only from public URLs (local paths and base64 don't render, and the native drag-drop upload is
browser-cookie-only — not automatable), screenshots are first pushed to an **evidence repo** and
embedded via its `raw.githubusercontent.com` URLs. Steps:

1. **Save screenshots locally** under `ai-qa-poc/PR-<n>/screens/` (named `ios-main-*`,
   `ios-pr-*`, `android-main-*`, `android-pr-*` — the upload source).
2. **Publish them** and get the base raw URL:
   ```bash
   BASE=$(bash .claude/skills/argent-qa-pr/helpers/publish-evidence.sh <n> ai-qa-poc/PR-<n>/screens)
   # BASE e.g. https://raw.githubusercontent.com/<your-evidence-repo>/main/PR-<n>
   ```
   (Target repo/branch come from `EVIDENCE_REPO`/`EVIDENCE_BRANCH` — process env, else
   `helpers/.env` — each user sets their **own** evidence repo there; it's never hardcoded.
   The auth identity needs `contents:write` on that repo.)
3. **Record a video of the full flow on EACH branch — this is a standard deliverable, not optional.**
   Capture **one recording per `main`/PR × platform** (so a 1-platform PR yields 2 videos: `*-main-*`
   and `*-pr-*`; a both-platform PR yields 4), each showing the **whole repro flow** end-to-end
   (navigate → act → result), started **after the app is at the ready state**. Every run ships the
   **before/after stills AND the before/after GIFs+MP4s** — the stills pin the decisive end-state, the
   GIFs make the cause→effect legible (you just did X and Y happened).
   **RECORD LONG, CUT LATER — two artifacts per branch, different lengths:** keep the recording rolling
   through the *whole* session (lead-in nav → repro → settle), don't start/stop around just the key tap.
   Then the helper emits **two** things from that one raw: a **tight inline GIF** (just the repro action,
   ~6–10s) and a **longer linked MP4** that keeps **~20s of context on each side of the repro**
   (`repro ± CLIP_CONTEXT_SEC`, default 20s). The GIF is the inline preview (a 40s GIF is 5–10 MB and
   won't load inline); the MP4 is *linked* and carries the context so a reviewer sees the repro in situ,
   not an isolated 10s snippet. **If the relevant state is largely static** (nothing animates), don't film
   a frozen screen — drive a short flow that *exercises* the behaviour so the take has real motion, and
   repeat it if needed for natural length.
   ```bash
   # Android raw capture (screenrecord is slow to init — wait ~4s before the first action; --time-limit caps it):
   adb shell screenrecord --bit-rate 8000000 --time-limit 60 /sdcard/c.mp4 &   # run the WHOLE flow …
   adb shell pkill -INT screenrecord; adb pull /sdcard/c.mp4 ai-qa-poc/PR-<n>/videos/android-main-raw.mp4
   # iOS: xcrun simctl io <udid> recordVideo --codec h264 <raw> &  … then  pkill -INT -f "simctl io.*recordVideo"
   #
   # 1) Pick the repro window on the NORMALIZED timeline (iOS recordVideo is VFR — see note below):
   bash .claude/skills/argent-qa-pr/helpers/clip-to-evidence.sh --contact ai-qa-poc/PR-<n>/videos/android-main-raw.mp4
   #    → Read /tmp/_clip_contact.png, find where the repro action happens (e.g. 13s..21s).
   # 2) Emit GIF (tight action) + MP4 (auto-padded to ±20s of context) from that one raw:
   bash .claude/skills/argent-qa-pr/helpers/clip-to-evidence.sh \
     ai-qa-poc/PR-<n>/videos/android-main-raw.mp4 ai-qa-poc/PR-<n>/videos/android-main 13 8 320
   ```
   This writes `android-main.mp4` (~40s, repro + ~20s context each side) + `android-main.gif` (the tight
   action loop); repeat for `android-pr-*` (and `ios-*` if in scope). **GIFs embed inline and auto-loop in
   a comment; raw/blob MP4 URLs do NOT play inline** — so embed the GIF and *link* the MP4 with a caption
   noting its length + that it's the repro with lead-in/aftermath context.
   - ⚠️ **iOS `recordVideo` writes VARIABLE frame rate** — on a static screen it captures almost no frames,
     so a naive GIF of a settled "after" state is a ~7-frame flicker and raw `-ss` seeks are off. The helper
     **CFR-normalizes** the raw (30fps) before clipping, which fixes both — but it means you must read the
     window timestamps off the **normalized** clip (`--contact` / `/tmp/_clip_norm.mp4`), not the raw.
   - The only case to skip a branch's video is a genuine impossibility (e.g. the flow can't be driven on
     that platform) — say so in the report; "the bug is static, stills are enough" is **not** a reason to
     skip. When the bug *is* motion/flicker, the GIF is the primary evidence, not a supplement.
   - **The clip MUST show the whole repro THROUGH the final confirmation** (the settled result that
     proves it works / doesn't work) — not just up to the last tap. **Verify the last frame** before
     publishing: `ffmpeg -sseof -0.1 -i <gif> -frames:v 1 /tmp/last.png` and look at it. A mid-animation
     end frame = re-do. Don't claim "full quality" for the MP4 — `clip-to-evidence.sh` compresses it
     (≈540px, crf 28); caption it like "▶️ Full video — ~40s, repro with lead-in & aftermath (compressed)".
   - **`adb screenrecord` can DIE at a navigation surface-change** (e.g. backing out of a full-screen
     RHP/detail to a list) — it stops ~1s into the transition, so the settled result never lands in the
     file (don't rely on `--time-limit` or a post-tap hold). It's flaky (sometimes survives). If a clip
     cuts at the nav: record/screenshot the **settled result separately** and concatenate — e.g. grab a
     full-res still of the result (`adb exec-out screencap`), make a 3.5s clip from it
     (`ffmpeg -loop 1 -t 3.5 -i result.png -vf scale=W:H,fps=24 -pix_fmt yuv420p B.mp4`), then
     `ffmpeg -i flow.mp4 -i B.mp4 -filter_complex "[0:v]scale=W:H,fps=24,setsar=1[a];[1:v]scale=W:H,fps=24,setsar=1[b];[a][b]concat=n=2:v=1[o]" -map "[o]" full.mp4`,
     and clip `full.mp4`. Use a **versioned filename** (`android-pr-v2.gif`) when replacing an already-posted
     asset — GitHub caches comment images by URL, so overwriting the same name shows the stale one.
4. **Write the report** to `ai-qa-poc/PR-<n>/report.md` (kept as the local source-of-truth and
   backup) with context, environment, a per-platform **Before/After** section, and a **PASS/FAIL
   verdict** + caveats. Embed each screenshot/GIF with its **raw URL** — `![caption]($BASE/<file>.png|.gif)`
   — *not* a relative path; link MP4s as `[MP4]($BASE/<file>.mp4)`. Lead the body with a marker
   line `<!-- argent-qa-pr -->` and a footer noting it's an automated mobile QA run.
   - Publish videos/gifs too: `publish-evidence.sh <n> ai-qa-poc/PR-<n>/screens ai-qa-poc/PR-<n>/videos`
     (multi-dir; auto-skips `*-raw.*`). For inline video *players*, the only path is the human
     drag-dropping the compressed MP4s into the comment (cookie-auth upload) — offer this.
5. **Post the PR comment** from that file. To **update** instead of duplicate, PATCH the existing
   comment: `gh api --method PATCH repos/Expensify/App/issues/comments/<id> -F body=@ai-qa-poc/PR-<n>/report.md`
   (the `<id>` is the trailing number in the comment's `#issuecomment-<id>` URL). First post:
   ```bash
   gh pr comment <n> --repo Expensify/App --body-file ai-qa-poc/PR-<n>/report.md
   ```
6. **Update the triage-log** row to `TESTED` + result, linking the posted comment URL.

## Multi-platform & host limits (read before a both-platform run)

- **Keep both simulators booted; run the app on only ONE at a time.** Having an iOS sim
  *and* an Android emulator **both booted** is fine and expected — do **not** shut one down
  to bring up the other, and never skip the reported platform for "resource" reasons. The
  rule is about the **app/Metro**, not the device: only the platform **currently under test**
  should have the Expensify app running and connected to Metro.
- **When you switch platforms, kill the app on the one you're leaving — but leave its
  emulator running (idle, no app).** Terminate the app so Metro is only ever serving **one
  bundle** at a time:
  - iOS: `xcrun simctl terminate <udid> com.expensify.chat.dev` (the sim stays booted).
  - Android: `adb -s <serial> shell am force-stop com.expensify.chat.dev` (the emulator stays running).
- **Why:** the real failure mode isn't two booted devices — it's **two live app bundles on
  one Metro** (especially two concurrent full bundle builds after a branch switch, which can
  OOM-crash Metro). One app resident at a time keeps Metro to a single bundle and avoids it.
- Give Metro adequate heap: `NODE_OPTIONS="--max-old-space-size=12288"`. Quick health gate
  before a heavy run: `memory_pressure` (free %) and `sysctl -n vm.loadavg` — but a healthy
  reading with both sims booted is the norm, not a reason to drop a platform.
- True parallel (a subagent per device, both apps live) is only for **light read-only
  flows**; for heavier or data-mutating flows drive **sequentially**, one app live at a time.
- **Shared-account hazard:** both devices share one test account — for data-mutating flows
  give each device a **distinct value** and verify only its own delta (or use separate
  accounts), else results confound.

## Hard rules (the expensive lessons — never skip)

1. **Mobile-native only.** Web/mWeb → `SKIPPED_WEB_ONLY`. Don't mis-test a wide-screen
   (desktop/RHP) bug on a phone.
2. **Always test on the platform(s) the issue actually reproduces on — no substitutions.**
   Read the issue's `## Platforms` checkboxes and test **exactly those** native platforms:
   Android-only → test **Android**; iOS-only → test **iOS**; both → test **both** (separate
   Before/After + screenshots each). **Never swap in the other platform because it's already
   booted or easier**, even when the fix is "shared JS" — boot the reported platform and run
   it there. (Both sims can be resident at once, so there's no resource excuse to skip one —
   see "Multi-platform & host limits".) If the reported platform genuinely cannot be run
   (build fails, integration unavailable), say so and mark it `NOT_TESTABLE` — do not pass it
   off on a different platform and call it tested.
3. **Always before/after** (`main` vs PR) — a single branch validates nothing.
4. **Drive the exact element** from the issue + diff, not a look-alike.
5. **Prefer what a real user would do; reach the scenario the way a user/tester would.**
   Favor genuine interactions — tap, **long-press**, double-tap, swipe, scroll, type. You
   *may* use tool-level helpers (`adb input`, and even `adb am start` / deep links / CDP)
   when they unblock you, but treat them as a **fallback, not the default**: the closer the
   repro is to the real user path, the stronger the evidence. A result that only works via a
   shortcut a user couldn't perform is weak — note the deviation if you rely on one.
6. **When one way to accomplish the goal fails, find another *way to accomplish the same
   goal* — don't just retry micro-variations of the same gesture.** Reason about the user's
   intent (e.g. "share an image into the app"), and if the obvious path is blocked,
   enumerate **alternative routes to the same outcome**: a different gesture (e.g.
   long-press instead of tap), a different entry point, a different app that reaches the same
   screen, a different feature that lands in the same flow. **When you don't know what
   options exist, search the web** for how a real user does *X* on that platform/app, then
   try the options you find. Apply this generically to any blocked step — only report a
   blocker once you've actually exhausted the alternative *ways*, not just nudged coordinates.
7. **Never fake a pass.** Report blockers and how far you got; verify the app is actually
   running the PR's JS before declaring a result.

## Outputs

**Primary output: a comment on the PR** — the before/after report with inline screenshots **and
before/after GIFs** and the PASS/FAIL verdict. Local artifacts are the source/backup that produce it:

```
ai-qa-poc/
  triage-log.md                 # one row per PR triaged (status + difficulty + comment link)
  PR-<number>/
    report.md                   # exact body posted to the PR (images = raw evidence-repo URLs)
    screens/                    # upload source: ios-main-*, ios-pr-*, android-main-*, android-pr-*
    videos/                     # standard: one recording per branch×platform — *-raw.mp4 (local),
                                #   <name>.mp4 (compressed, linked), <name>.gif (inline). e.g.
                                #   android-main.gif/.mp4 + android-pr.gif/.mp4

evidence repo (per-user, set via EVIDENCE_REPO in helpers/.env):
  PR-<number>/                  # screenshots + GIFs (inline) + compressed MP4s, over raw.githubusercontent.com
```

## References

- **[`references/methodology.md`](references/methodology.md)** — full phased methodology,
  anti-patterns, report format, Expensify environment gotchas, and **Recipes / unblockers**
  (feasibility pre-check, `+tag` fresh accounts, Onyx beta override, deep-link entry, Metro OOM
  recovery, Android magic-code/keyboard fixes, screen-recording → inline GIF).
- **Helpers** (`helpers/`, see `helpers/README.md`): `fetch-magic-code.mjs` (autonomous login),
  `publish-evidence.sh` (push screenshots/GIFs/MP4s → evidence repo, multi-dir),
  `clip-to-evidence.sh` (raw recording → compressed MP4 + looping GIF).
- Drives devices via the **Argent MCP** tooling (`argent-test-ui-flow`,
  `argent-device-interact`, `argent-screenshot-diff`, `argent-create-flow`). Sibling skill
  `agent-device-evidence` captures MP4/screenshot *evidence* of a flow (no branch
  comparison) — use it when you only need artifacts, this skill when you need a **verdict**.

## CI note

Keep every run **autonomous and non-interactive** (no mid-run prompts) so the same logic
ports to a headless GitHub Action later — the stated end goal if the POC proves out.
