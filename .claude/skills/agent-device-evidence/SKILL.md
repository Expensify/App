---
name: agent-device-evidence
description: Records iOS/Android native MP4 evidence for test/repro flows extracted from an Expensify GitHub PR or issue. Use when the user asks to "record the flow for PR #X", "capture mobile evidence for issue #Y", or "produce screenshots/videos for <PR or issue URL>". Mobile-native only - declines mWeb and Desktop.
allowed-tools: Bash(agent-device *) Bash(gh pr view *) Bash(gh issue view *) Bash(mkdir -p *) Bash(file *) Bash(test *) Bash(date *) Read Write
---

# agent-device-evidence

Records `iOS: Native` and `Android: Native` MP4 evidence for the test or repro steps declared in an Expensify GitHub **PR or issue**. The source of truth is the test/repro steps themselves, not the surrounding code or context - the skill works equally well on a PR's `### Tests` section, an issue's `## Action Performed:` block, or any future Markdown body where steps are clearly authored.

Specializes the [`agent-device`](../agent-device/SKILL.md) skill: delegates device lifecycle (bundle ID, Metro, device pick, session, open) to its [Bring-up](../agent-device/SKILL.md#bring-up), then captures one artifact per declared flow per platform, writes a JSON manifest, and surfaces local file paths.

The skill is **autonomous and non-interactive**. It never pauses for user input mid-run. All inputs are provided at invocation time; all failures surface as structured errors with exit codes.

HybridApp-only (the parent skill's pre-flight enforces this). Standalone (non-HybridApp) builds are out of scope - production mobile evidence runs against HybridApp.

## Scope

**In scope:** `iOS: Native` (iOS Simulator), `Android: Native` (Android Emulator), HybridApp dev build only. Inputs may come from PRs or issues - the skill does not gate on code changes.

**Out of scope:** `Android: mWeb Chrome`, `iOS: mWeb Safari`, `iOS: mWeb Chrome`, `Windows: Chrome`, `MacOS: Chrome / Safari`. Decline with `EXIT 4` and point to a browser-driver skill (`playwright-app-testing`). Standalone (non-HybridApp) builds. Decline with `EXIT 7 BRING_UP_FAILED` per the parent skill's gate.

## Inputs

| Input | Source | Required |
| --- | --- | --- |
| Source URL (PR or issue) | First positional arg, e.g. `https://github.com/Expensify/App/pull/89475` or `.../issues/89855` | Yes |
| `--platforms ios,android` | Flag | No (default: derived) |
| `-e KEY=VALUE` step-param overrides | Repeatable | No |

Bare numbers are rejected (PRs and issues share the GitHub number namespace; the URL path is the safe disambiguator). No interactive prompts.

## Triage gates (run in order, before any device work)

1. **Detect source kind** from the URL: `/pull/N` → PR, `/issues/N` → issue. Anything else → exit `8 BAD_INPUT`.
2. **Fetch the source body**:
   - PR: `gh pr view <num> --json title,body`
   - Issue: `gh issue view <num> --json title,body,labels`
3. **Platform resolution** - in priority order:
   1. `--platforms` arg (CSV, wins all).
   2. **PR source**: explicit prose markers in title or `### Tests` body - `iOS only`, `Android only`, `On iOS:`, `On Android:`.
   3. **Issue source**: the `## Platforms:` checkbox list. Filled boxes denote where the bug reproduces; restrict to the matching native platforms.
   4. Default: both `ios` and `android`.

   Aliases: `iOS: Native` ≡ `iOS: App` (both → `ios`); `Android: Native` ≡ `Android: App` (both → `android`). All mWeb / Windows / MacOS variants are out of scope.

   If the only platforms matched are out of scope (e.g. an issue checks only `MacOS: Chrome / Safari`), **exit `4 PLATFORM_UNSUPPORTED`**.
4. **Steps parsing** - extract the steps section and produce a flow list (see below). If the flow list is empty, **exit `3 NO_FLOWS`**.

## Steps parsing

See [`references/steps-parsing.md`](references/steps-parsing.md).

## Phase 1 cache

Simple map: flow steps → `.ad` script. If the steps haven't changed, reuse the cached script and skip the warm-up.

- Path: `~/.cache/agent-device-evidence/.ad-cache/<fingerprint>.ad`
- Fingerprint: `sha256(precondition + json(steps) + platform)`. Platform is included so iOS and Android don't share an entry (different selectors).
- Hit → copy to `$TEST_FLOW.ad`, mark `cached: true` in the manifest, skip Phase 1, proceed to Phase 2.
- Miss → run Phase 1, write the script to the cache on success.

The skill does not delete, invalidate, or retry cache entries. If a cached `.ad` is stale, the flow is marked `phase2_failed`. To recover, edit the steps (which changes the fingerprint) or wipe `~/.cache/agent-device-evidence/.ad-cache/` externally.

## Capture loop (per flow per platform)

Two phases per flow. Lifecycle delegated to the parent skill's bring-up. Phase 1 is skipped on cache hit (see above).

### Shared setup (run once per platform, before the first flow)

1. **Run the [agent-device bring-up](../agent-device/SKILL.md#bring-up)** for the target platform. The parent skill resolves bundle ID, starts Metro, picks/confirms the device, manages session, and opens the app for sanity verification. Capture the resolved `$APP_ID` (bundle ID) and `$DEVICE_NAME` for re-opens in Phases 1 and 2.
   - If bring-up fails for any reason (HybridApp gate, missing dev build, Metro start, simulator boot, etc.), **exit `7 BRING_UP_FAILED`** and surface the parent skill's error verbatim.
   - Selector discipline (id > role+label, no coordinate fallback unless 0 a11y nodes) follows the parent skill's [`flows/README.md`](../agent-device/flows/README.md).
   - **Non-interactive overrides for the parent bring-up** (this skill never prompts):
     - Device pick (parent step 5, "If multiple are booted, ask the user which"): pick the **first booted device** in `agent-device devices --json` order, deterministically. Log the choice in the manifest under `device_selected`.
     - Session reuse vs reset (parent step 6, line 73): **always `reset`** for sessions not created in the current invocation - run `agent-device close --shutdown --session <name>` without prompting. Phase 1 and Phase 2 both rely on cold starts, so reuse of stale sessions is never desired here.

2. **Close the bring-up session** so each phase starts cold:
   ```bash
   agent-device close
   ```

3. **Set up run directory** - persistent, append-only:
   ```bash
   SOURCE_KIND=<pr|issue>; SOURCE_NUM=<num>; RUN_TS=$(date -u +%Y%m%dT%H%M%SZ)
   RUN_DIR="$HOME/.cache/agent-device-evidence/$SOURCE_KIND-$SOURCE_NUM/$RUN_TS"
   mkdir -p "$RUN_DIR/ios" "$RUN_DIR/android"
   ```

### Phase 1 - Warm-up (per flow, no camera)

Goal: produce a deterministic `.ad` script of the successful command sequence, plus per-step still candidates. Drives autonomously from cold start. No recording.

**Skip if cached.** Before any device work, consult the [Phase 1 cache](#phase-1-cache). On hit, copy the cached `.ad` to `$TEST_FLOW.ad`, mark `cached: true` in the manifest, and proceed straight to Phase 2.

On cache miss:

1. **Open the app** with the bring-up's resolved values:
   ```bash
   agent-device open "$APP_ID" --device "$DEVICE_NAME"
   ```

2. **Drive setup actions** based on the flow's `Precondition:` block (if any) and what the steps imply. Setup actions go into the `.ad` script up to the marker; everything after the marker is what Phase 2 records.

3. **Drive the test flow** - one numbered step at a time. For each step:
   - Send the step text verbatim to the agent-device LLM driver.
   - On success, append the **final, successful** action to `$TEST_FLOW.ad`. Do not append actions that needed retries on different selectors.
   - **If a value is explicit in the step** (e.g. "Enter $42.50"), pass it through verbatim. **If not**, the LLM picks a context-appropriate value and the chosen value is recorded in `params:` in the manifest.
   - The post-action `agent-device snapshot` (taken for selector matching) is **saved as a candidate still** - `flow-<id>-step-<n>-<label>.png`. Free side-effect.

4. **Verify final state** - `agent-device is exists "<selector>"` on the post-condition implied by the last step.

5. **Close session** - `agent-device close`.

6. **Sanity-check** the script is non-empty:
   ```bash
   test -s "$TEST_FLOW.ad" || { record per-flow status "phase1_failed: empty script"; continue }
   ```

7. **Write to cache** - on success, copy `$TEST_FLOW.ad` to `~/.cache/agent-device-evidence/.ad-cache/<fingerprint>.ad` and write the meta sidecar.

### Phase 2 - Recording (per flow, deterministic replay)

Goal: clean MP4 of only the test-flow steps. No snapshots on camera, no retries, no LLM thinking time.

1. **Open the app fresh** with the bring-up's resolved values:
   ```bash
   agent-device open "$APP_ID" --device "$DEVICE_NAME"
   ```

2. **Replay setup silently** - everything in the `.ad` script up to the marker. Off-camera. The app reaches the test starting state.

3. **Start recording**:
   ```bash
   agent-device record start "$RUN_DIR/$PLATFORM/flow-$ID.mp4" --fps 24
   ```

   > Android: `adb screenrecord` has a 3-min hard cap. Per-flow MP4s rarely hit this; if a flow exceeds, mark `status: phase2_failed` and continue.

4. **Replay test-flow portion**:
   ```bash
   agent-device replay "$TEST_FLOW.ad" --from-marker
   ```

5. **Stop recording**:
   ```bash
   agent-device record stop
   ```

6. **Close session** - `agent-device close`.

7. **Verify artifact**:
   ```bash
   test -s "$RUN_DIR/$PLATFORM/flow-$ID.mp4" && file "$RUN_DIR/$PLATFORM/flow-$ID.mp4" \
     || { mark phase2_failed; continue }
   ```

**On Phase 2 replay failure:** mark the flow `phase2_failed` and continue to the next flow.

### Multi-flow chunking

Multiple flows in one PR share a single Phase 2 session (one `agent-device open` + replay-to-marker), with `record start` / `record stop` per flow. State carries between flows unless Phase 1 flagged `requires_cold_start: true` for a flow, in which case Phase 2 closes and re-opens before that flow.

### Single-step verify-only flows

For flows classified `kind: still`:
- Phase 1 still drives autonomously to the verification screen.
- Phase 2 opens fresh, replays setup, takes one screenshot at the verification screen via `agent-device screenshot`, and writes `flow-<id>.png`. No `record start`/`stop`.

## Output

### Run-output layout

```
~/.cache/agent-device-evidence/
├── .ad-cache/                            # cross-source Phase 1 cache (see "Phase 1 cache")
│   ├── <fingerprint>.ad
│   └── <fingerprint>.meta.json
└── <source-kind>-<source-num>/           # per-source run output, e.g. pr-89475/ or issue-89855/
    └── <run-ts>/
        ├── manifest.json
        ├── ios/
        │   ├── flow-1.mp4
        │   ├── flow-1-step-2-tap-signin.png
        │   ├── flow-2.png   (still-only flow)
        │   └── ...
        └── android/
            └── ...
```

Run output is persistent across reboots and append-only - the skill never deletes prior runs or cache entries.

### Manifest schema

See [`references/manifest-schema.md`](references/manifest-schema.md).

### Handoff

After all platforms, the skill prints the run directory and lists per-flow paths. The user drags each artifact into the PR's `### Screenshots/Videos` section (or attaches to the issue, depending on source). The skill never edits the source.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | All applicable flows produced an artifact (or the run was best-effort with at least one usable artifact; per-flow status reflects reality). |
| `3` | `NO_FLOWS` - steps section unparseable or empty after stripping. |
| `4` | `PLATFORM_UNSUPPORTED` - mWeb / Desktop / Windows requested or only out-of-scope platforms checked on the source. |
| `5` | `PHASE1_TOTAL_FAILURE` - every flow failed Phase 1. |
| `6` | `PHASE2_TOTAL_FAILURE` - every flow failed Phase 2 despite Phase 1 success. |
| `7` | `BRING_UP_FAILED` - parent skill bring-up failed (missing dev build, HybridApp gate, Metro start, simulator boot, etc.). Parent error is surfaced verbatim. |
| `8` | `BAD_INPUT` - source URL is missing, malformed, or not a recognised PR/issue URL. |

## Cost guards

| Cap | Value |
| --- | --- |
| Phase 1 timeout | 5 min per flow |
| Phase 2 timeout | 3 min per flow (Android cap) |
| Max driver actions | 50 per flow |

Hitting any cap marks the flow `phase1_failed` / `phase2_failed` and proceeds to the next flow.

## Error handling

See [`references/error-handling.md`](references/error-handling.md).

## Out of scope (do not do these)

The skill must not attempt any of the following. If a request implies one of these, refuse or delegate.

- **Mobile web and Desktop platforms** (`iOS: mWeb Safari`, `Android: mWeb Chrome`, `MacOS: Chrome / Safari`) - belong in `playwright-app-testing` or a future browser-driver skill. Exit `4 PLATFORM_UNSUPPORTED`.
- **Standalone (non-HybridApp) builds** - parent skill is HybridApp-only and this specialization inherits the gate. Production mobile evidence runs against HybridApp.
- **Device lifecycle** (Metro, simulator boot, bundle ID resolution, session reuse, app install verification) - fully delegated to the parent skill's [Bring-up](../agent-device/SKILL.md#bring-up). Do not call `agent-device metro prepare`, `xcrun simctl`, or `is-hybrid-app.sh` directly.
- **Editing the PR body or posting PR comments** - the skill only writes local files. The user handles upload.
- **Interactive prompts of any kind** - CI is the eventual host; the skill must run end-to-end without human input.
- Test data cleanup. Accounts/expenses/workspaces created during runs accumulate; rely on periodic test-account reset.
