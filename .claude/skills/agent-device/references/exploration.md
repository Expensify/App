# Exploration

## When to open this file

Open this file when the app or screen is already running and you need to discover the UI, choose targets, read state, wait for conditions, or perform normal interactions.

## Read-only first

- If the question is what text, labels, or structure is visible on screen, start with plain `snapshot`.
- Escalate to `snapshot -i` only when you need refs such as `@e3` for interactive exploration or a requested action.
- If you intend to `press`, `fill`, or otherwise interact, start with `snapshot -i` and fall back to plain `snapshot` only if interactive refs are unavailable.
- Prefer `get`, `is`, or `find` before mutating the UI when a read-only command can answer the question.
- You may take the smallest reversible UI action needed to unblock inspection, such as dismissing a popup, closing an alert, or backing out of an unintended surface.
- Do not type or fill text just to make hidden information easier to access unless the user asked for that interaction.
- Do not use external sources to infer missing UI state unless the user explicitly asked.
- If the answer is not visible or exposed in the UI, report that gap instead of compensating with search, navigation, or text entry.

## Decision shortcut

- User asks what is visible on screen: `snapshot`
- User asks for exact text from a known target: `get text`
- User asks you to tap, type, or choose an element: `snapshot -i`, then act
- React Native dev or debug build shows warning/error UI: capture enough evidence to identify it, dismiss it if it is not the requested behavior, then continue the flow and report it in the summary
- The on-screen keyboard is blocking the next step: `keyboard dismiss`; on iOS do this only while an app session is active, and use `keyboard status|get` only on Android
- UI does not expose the answer: say so plainly; do not browse or force the app into a new state unless asked

## Read-only commands

- `snapshot`
- `get`
- `is`
- `find`
- `keyboard status|get` on Android when keyboard visibility or input type matters

## Interaction commands

- `snapshot -i`
- `press`
- `fill`
- `type`
- `scrollintoview`
- `wait`
- `keyboard dismiss` when the keyboard obscures the next target

## Common mistakes to avoid

**Stale refs.** Do not treat `@ref` values as durable after navigation or dynamic updates. Re-snapshot after the UI changes, and switch to selectors when the flow must stay stable.

**Android AX tree lag.** After submits, route changes, or composer transitions, the accessibility tree can lag behind the visible UI. If `snapshot -i` and `screenshot` disagree:

1. Trust the screenshot as visual truth.
2. Take one fresh `snapshot -i`. Android retries briefly after navigation-sensitive actions.
3. If the tree still disagrees with the screenshot, wait briefly, then take one more fresh snapshot. Do not loop snapshots immediately.

**React Native dev overlays.** In dev or debug builds, warning or error overlays can block taps, change focus, or hide the real UI. Check for them near app open and after major transitions.

- Not blocking the task: dismiss and continue.
- Blocking or recurring: switch to [debugging.md](debugging.md) and collect evidence.
- Seen at any point: mention in the final summary even if dismissed.

## Common example loops

These are examples, not required exact sequences. Adapt them to the app, state, and task at hand.

### Interactive exploration loop

```bash
agent-device open Settings --platform ios
agent-device snapshot -i
agent-device press @e3
agent-device wait visible 'label="Privacy & Security"' 3000
agent-device get text 'label="Privacy & Security"'
agent-device close
```

### Screen verification loop

```bash
agent-device open MyApp --platform ios
# perform the necessary actions to reach the state you need to verify
agent-device snapshot
# verify whether the expected element or text is present
agent-device close
```

## Snapshot choices

- Use plain `snapshot` when you only need to verify whether visible text or structure is on screen.
- Use `snapshot -i` when you need refs such as `@e3` for interactive exploration or for an intended interaction.
- On iOS and Android, default snapshot output is visible-first. Off-screen interactive content is surfaced as discovery hints (including inline scroll/list hidden-content hints when known), not shown as directly tappable refs.
- Treat large text-surface lines in `snapshot -i` as discovery output. If a node shows preview or truncation metadata, use `get text @ref` only after you have already decided that `snapshot -i` is needed for that surface.
- Use `snapshot -i -s "Camera"` or `snapshot -i -s @e3` when you want a smaller, scoped result.
- If `snapshot -i -s "<query>"` returns 0 nodes, the scope did not match the current screen. Widen the query or re-check the screen state instead of assuming the command silently fell back to the full tree.
- If `snapshot -i` returns 0 nodes but the screen is visibly populated, treat `screenshot` as visual truth, wait briefly, then re-run `snapshot -i` once before escalating.
- If `snapshot -i -d <n>` says the interactive output is empty at that depth, retry without `-d` instead of taking more shallow snapshots.

Example:

```bash
agent-device snapshot -i
```

Sample output:

```text
Page: com.apple.Preferences
App: com.apple.Preferences

@e1 [ioscontentgroup]
  @e2 [button] "Camera"
  @e3 [button] "Privacy & Security"
[off-screen below] 2 interactive items: "Location Services", "Battery"
```

## Refs vs selectors

- Use refs for discovery, debugging, and short local loops.
- Use `scrollintoview @ref` when the target is already known from the current snapshot and you want the command to re-snapshot after each swipe until the element reaches the viewport safe band.
- If `scrollintoview @ref` succeeds, prefer the returned `currentRef` for the next action.
- Visible-first off-screen summaries are intentionally compact. If you need the full off-screen tree instead of a short summary, retry with `snapshot --raw`.
- Cap long searches with `--max-scrolls <n>` when the list may be unbounded or the target may not exist.
- Use selectors for deterministic scripts, assertions, and replay-friendly actions.
- Prefer selector or `@ref` targeting over raw coordinates.
- For tap interactions, `press` is canonical and `click` is an equivalent alias.

Examples:

```bash
agent-device press @e2
agent-device fill @e5 "test"
agent-device press 'id="camera_row" || label="Camera" role=button'
agent-device is visible 'id="camera_settings_anchor"'
```

## Interaction fallbacks

When `press @ref` fails:

1. If the error says the ref is off-screen, run `scrollintoview @ref` and reuse the returned `currentRef` or take one fresh snapshot.
2. Re-snapshot if the UI may have changed.
3. Retry `press @ref` or a selector-based `press`.
4. If `screenshot --overlay-refs --json` returned a reliable `overlayRefs[].center`, use `agent-device press <x> <y>`.
5. Use an external vision-based tap tool only after semantic and coordinate targeting fail.

- Prefer `@ref` over coordinates.
- Do not guess coordinates from the image when structured `center` is available.
- `agent-device` does not provide a built-in vision-tap flag.

## Text entry rules

- Use `fill` to replace text in an editable field.
- Use `type` to append text to the current insertion point.
- Use `fill @ref "text"` when you need to target a field directly by ref.
- Use `press @ref`, then `type "text"` when the field is already focused and you need append semantics.
- Do not write `type @ref "text"`; `type` only accepts text and will not target that ref for you.
- If the keyboard blocks the next control after text entry, prefer `keyboard dismiss` instead of backing out of the screen.
- On iOS, `keyboard dismiss` depends on the active app session to keep the target app foregrounded, so do not rely on selector-only dismiss calls after closing or without `open`.
- Do not use `fill` or `type` just to make the app reveal information that is not currently visible unless the user asked for that interaction.

## React Native dev or debug overlays

Use this loop for React Native dev clients, Metro-backed builds, and local debug sessions where warnings or errors may appear as tooltips, banners, toasts, or modal overlays.

1. After `open`, inspect the visible UI for warning or error surfaces before relying on the next tap.
2. If a warning or error is visible, capture enough evidence to identify it:
   - preferred: `screenshot`
   - optional: `logs mark "warning visible"` or `logs mark "error visible"` if you are already in a debug window
3. If the overlay is not the thing the user asked you to investigate, dismiss or close it with the smallest reversible action.
4. Re-check the intended screen before continuing the task.
5. Report any visible warnings or errors in the final summary, even if the flow succeeded after dismissal.

Use this rule of thumb:

- Warning overlay that does not block the task: dismiss and keep going.
- Error overlay that does not block the task: dismiss, keep going, and report it.
- Error overlay that blocks the task or keeps returning: stop treating it as noise and switch to [debugging.md](debugging.md).

## Query and sync rules

- Use `get` to read text, attrs, or state from a known target.
- Use `is` for assertions.
- Use `wait` when the UI needs time to settle after a mutation.
- Use `find "<query>" click --json` when you need search-driven targeting plus matched-target metadata.
- Use `find "<query>" click --first` or `--last` when ambiguous matches are expected and you want the first or last occurrence without falling back to raw coordinates.
- If you are forced onto raw coordinates, open [coordinate-system.md](coordinate-system.md) first.

Example:

```bash
agent-device find "Increment" click --json
```

Returned metadata comes from the matched snapshot node and can be used for observability or replay maintenance.

## QA from acceptance criteria

Use this loop when the task starts from acceptance criteria and you need to turn them into concrete checks.

Preferred mapping:

- visibility claim for what is on-screen now: `is visible` or plain `snapshot`
- presence claim regardless of viewport visibility: `is exists`
- exact text, label, or value claim: `get text`
- post-action state change: act, then `wait`, then `is` or `get`
- nearby structural UI change: `diff snapshot`
- proof artifact for the final result: `screenshot` or `record`

Notes:

- `wait text` is useful for synchronizing on text presence, but it is not the same as `is visible`.
- After a nearby navigation or submit on Android, prefer `screenshot`, then `wait 500` or `wait 1000`, then one fresh `snapshot -i` if the accessibility tree seems stale.

Anti-hallucination rules:

- Do not invent app names, device ids, session names, refs, selectors, or package names.
- Discover them first with `devices`, `open`, `snapshot -i`, `find`, or `session list`.
- If refs drift after navigation, re-snapshot or switch to selectors instead of guessing.

Avoid this escalation path for visible-text questions:

- Do not jump from `snapshot -i` to `get text @ref`, then to web search, then to typing into a search box just to force the app to reveal the answer.
- Start with `snapshot`. If the text is not visible or exposed, report that directly.
- After Android submit or navigation-heavy actions when the UI looks wrong: `screenshot` first, then `snapshot -i`.

Canonical QA loop:

```bash
agent-device open MyApp --platform ios
agent-device snapshot -i
agent-device press @e3
agent-device wait visible 'label="Success"' 3000
agent-device is visible 'label="Success"'
agent-device screenshot /tmp/qa-proof.png
agent-device close
```

## Accessibility audit

Use this pattern when you need to find UI that is visible to a user but missing from the accessibility tree.

Audit loop:

1. Capture a `screenshot` to see what is visually rendered.
2. Capture a `snapshot` or `snapshot -i` to see what the accessibility tree exposes.
3. Compare the two:
   - visible in screenshot and present in snapshot: exposed to accessibility
   - visible in screenshot and missing from snapshot: likely accessibility gap
4. If you suspect the node exists in AX but is filtered from interactive output, retry with `snapshot --raw`.

Example:

```bash
agent-device screenshot /tmp/accessibility-screen.png
agent-device snapshot -i
```

Use `screenshot` as the visual source of truth and `snapshot` as the accessibility source of truth for this audit.

## Batch only when the sequence is already known

Use `batch` when a short command sequence is already planned and belongs to one logical screen flow.

```bash
agent-device batch --session sim --platform ios --steps-file /tmp/batch-steps.json --json
```

- Keep batch size moderate, roughly 5 to 20 steps.
- Add `wait` or `is exists` guards after mutating steps.
- Do not use `batch` for highly dynamic flows that need replanning after each step.

Example: known chat-send flow

```json
[
  { "command": "open", "positionals": ["ChatApp"], "flags": { "platform": "android" } },
  { "command": "click", "positionals": ["label=\"Travel chat\""], "flags": {} },
  { "command": "wait", "positionals": ["label=\"Message\"", "3000"], "flags": {} },
  { "command": "fill", "positionals": ["label=\"Message\"", "Filed the expense"], "flags": {} },
  { "command": "press", "positionals": ["label=\"Send\""], "flags": {} }
]
```

Step payload contract:

```json
[
  { "command": "open", "positionals": ["Settings"], "flags": { "platform": "ios" } },
  { "command": "wait", "positionals": ["label=\"Privacy & Security\"", "3000"], "flags": {} },
  { "command": "click", "positionals": ["label=\"Privacy & Security\""], "flags": {} },
  { "command": "get", "positionals": ["text", "label=\"Tracking\""], "flags": {} }
]
```

- `positionals` is optional and defaults to `[]`.
- `flags` is optional and defaults to `{}`.
- Only `command`, `positionals`, `flags`, and `runtime` are accepted as top-level step keys.
- Nested `batch` and `replay` are rejected.
- Supported error mode is stop-on-first-error.

Response handling:

- Success returns fields such as `total`, `executed`, `totalDurationMs`, and `results[]`.
- Human-mode `batch` runs also print a short per-step success summary.
- Failed runs include `details.step`, `details.command`, `details.executed`, and `details.partialResults`.
- Replan from the first failing step instead of rerunning the whole flow blindly.

Canonical batch recipe: open app -> open action menu -> choose option -> verify

```json
[
  { "command": "open", "positionals": ["com.example.app"], "flags": { "platform": "android" } },
  { "command": "wait", "positionals": ["text", "Home", "3000"], "flags": {} },
  { "command": "press", "positionals": ["label=\"More actions\" role=button"], "flags": {} },
  { "command": "wait", "positionals": ["text", "Camera scan", "2000"], "flags": {} },
  { "command": "press", "positionals": ["label=\"Camera scan\""], "flags": {} },
  { "command": "wait", "positionals": ["text", "Expense created", "15000"], "flags": {} },
  { "command": "is", "positionals": ["visible", "label=\"Expense created\""], "flags": {} }
]
```

Common batch error categories:

- `INVALID_ARGS`: fix the payload shape and retry.
- `SESSION_NOT_FOUND`: open or select the correct session, then retry.
- `UNSUPPORTED_OPERATION`: switch to a supported command or surface.
- `AMBIGUOUS_MATCH`: refine the selector or locator, then retry the failed step.
- `COMMAND_FAILED`: add sync guards and retry from the failing step.

## Stop conditions

- If refs drift after transitions, switch to selectors.
- If a desktop surface or context menu is involved on macOS, load [macos-desktop.md](macos-desktop.md).
- If logs, network, alerts, or setup failures become the blocker, switch to [debugging.md](debugging.md).
- If the flow is stable and you need proof or replay maintenance, switch to [verification.md](verification.md).
