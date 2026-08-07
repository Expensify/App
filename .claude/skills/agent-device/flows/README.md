# Flows

## Directory layout

1. `macros/` contains reusable setup and navigation helpers for interactive work.
2. `scenarios/` contains QA and performance journeys that run against a prepared session through `agent-device replay`.
3. `lib/` contains bash drive libraries for flows that need conditional steering the linear `.ad` format cannot express. Each file documents its own contract; the caller owns session lifecycle.

The `macros/` and `scenarios/` directories contain composable `.ad` snippets. The caller owns application startup, authentication, platform selection, session state, and cleanup. A flow may span one or multiple screens as long as it represents a coherent action with clear start (`@pre`) and completion (`@post`) checkpoints.

## Agent decision loop (interactive)

Before manually navigating, use this human-in-the-loop loop:

1. `agent-device snapshot -i` - see current state.
2. `grep -H '^# @' .claude/skills/agent-device/flows/macros/*.ad` - interactive catalog.
3. For each candidate flow, run `agent-device is exists "<selector>"` per `@pre`. Keep flows where every `@pre` passes.
4. Rank survivors by goal closeness and present top macro candidates to the user with a short "why this flow" note:
   - Prefer flows whose `@post` selectors literally match destination language from the user request (same `text`, `label`, or selector phrase).
5. Wait for user selection before replaying. **Auto-run is allowed only when there is exactly one survivor and it is an unambiguous match for an explicit user request.**
   - Only propose flows from `flows/macros/` in interactive usage.
6. Scan selected flow `# @param` headers. Ask the user for any missing parameter values, then build explicit CLI args (`-e KEY=VALUE`) for replay.
7. `agent-device replay <path> -e KEY=VALUE ...`.
8. If the flow declares `@post`, verify each `@post` with `is exists`. On success, re-enter the loop only if the user's stated goal is not complete; otherwise stop and report completion. On failure, propose peer flow/manual fallback options and ask before continuing. If no `@post` is declared (utility flow), rely on explicit user confirmation or the next snapshot before continuing.

## QA workflow

Scenarios are not self-contained test-runner inputs. Open the app and prepare a named session first, then run:

```bash
AGENT_DEVICE_STATE_DIR="$HOME/.agent-device-expensify-headless" \
agent-device open <app-id> \
    --platform <ios-or-android> \
    --session <name>
AGENT_DEVICE_STATE_DIR="$HOME/.agent-device-expensify-headless" \
node .claude/skills/agent-device/scripts/replay-with-deadline.mjs \
    .claude/skills/agent-device/flows/scenarios/<name>.ad \
    --session <name> \
    --timeout 120000 \
    -e KEY=VALUE
```

Tested Agent Device versions 0.20.1 through 0.20.6 accept `replay --timeout` but can leave the daemon request running until a selector timeout. Measured on 0.20.6, a flow whose single step waits 5000ms on a selector that cannot match still takes 5505ms on iOS and 5262ms on Android under `--timeout 1000`. The repository wrapper enforces the wall-clock deadline outside the daemon, exits with code 124, and cleans the dedicated headless daemon. Always use a separate `AGENT_DEVICE_STATE_DIR` for this workflow so timeout cleanup cannot stop an interactive session. Selector waits remain the per-step bounds and produce the useful divergence report.

`agent-device test` creates an isolated session for each attempt. Use it only for scripts that own `context`, `open`, and cleanup.

Every scenario must execute each declared `@pre` and `@post` condition with `is exists` or `wait`. Metadata documents the contract but does not execute it.

For headless runs, stop after the first failed replay or postcondition. Retry only after an explicit reset or another verified state change. Do not replay the same scenario against an unchanged state.

## Metadata header spec

Each flow starts with `# @key value` comment lines. The `.ad` parser treats `#` lines as no-ops, so headers cost nothing at replay time.

| Field    | Cardinality | Value                                                                                            |
| -------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `@desc`  | 1           | One-line human summary.                                                                          |
| `@pre`   | 1..N        | Selector that must resolve in the current snapshot. Multiple lines are ANDed.                    |
| `@post`  | 0..N        | Selector expected after replay. Multiple lines are ANDed. The flow body enforces them.             |
| `@reset` | 0..1        | Repository-relative macro path that restores the scenario's `@pre` state between measured runs.    |
| `@measure` | 0..1      | Set to `canonical` when multiple scenarios emit the same Sentry span and this one owns measurement. |
| `@tag`   | 0..N        | Free-form category (`auth`, `onboarding`, ...) or scoped (`sentry-<spanName>`).                  |
| `@param` | 0..N        | Runtime input contract: `@param KEY description.` Use with `${KEY}` in flow body.                |
| `@unique-label` | 0..N | Label string the author confirmed resolves to exactly one node, which lets a selector union end with an unqualified `label="..."` alternative. Required for iOS tab presses; see the authoring rules below. |

Selector syntax matches the body: `id="..."`, `role="..." label="..."`, `text="..."`, `||` for fallbacks.

## Parametrization

Declare runtime inputs via metadata (`@param`) and reference them in the body with `${VAR}` interpolation. Values are supplied by caller arguments (`-e`) or shell imports (`AD_VAR_*`) - never by in-file `env` directives.

| Construct          | Where                    | Purpose                                                                          |
| ------------------ | ------------------------ | -------------------------------------------------------------------------------- |
| `# @param KEY ...` | Metadata header comments | Declares expected input and documents meaning for the agent/user handoff.         |
| `${KEY}`           | Body                     | Interpolation point. Resolves at replay time.                                    |
| `${KEY:-fallback}` | Body                     | Use `fallback` if `KEY` is unset.                                                |
| `\${KEY}`          | Body                     | Literal `${KEY}` (escape).                                                       |

Resolution precedence (high to low): CLI `-e KEY=VALUE` (repeatable) > shell `AD_VAR_KEY=...` (auto-imported as `KEY`) > built-ins (`AD_PLATFORM`, `AD_SESSION`, `AD_FILENAME`, `AD_DEVICE`, `AD_ARTIFACTS`). Unresolved `${X}` errors with `file:line`.

Override at runtime without editing the file:

```bash
agent-device replay <flow>.ad -e EMAIL=other@example.com
```

## Authoring rules

- **No `open`, no `close`, no `context` header.** Caller owns lifecycle.
- **No fixed-duration `wait` calls.** Guard every asynchronous transition with `wait "<selector>" <timeoutMs>`, which polls until the selector resolves. A bare `wait <ms>` only burns wall clock.
- **No command flags in a flow body.** The `.ad` parser only reads flags for `press`, `fill`, `click`, and a few capture commands; for `is`, `wait`, and `find` it treats `--first` and friends as positionals. Disambiguate with a tighter selector instead.
- **Durable selectors.** Prefer `id=...` first, then `role=... label=...`, with `||` fallbacks. For shared navigation controls, put the iOS role selector before the Android `label=... hittable=true` fallback. Avoid `@eN` refs.
- **Never end a union with an unqualified `label=...`.** A bare label matches the first node with that label anywhere in the tree, and `press` taps it without complaining. On the iOS bottom navigation, `press 'label="Spend"'` hits the page header at y=98 instead of the tab at y=779, so the flow keeps running against the wrong screen. Only add a bare-label alternative when the label string is unique in the tree, as `"Inbox. Your review is required"` is.
- **`role="tab"` does not resolve on iOS.** React Native maps the tab role to no iOS accessibility trait, so those nodes come back as `Other` with `hittable: false` and both halves of a `role="tab" ... || label=... hittable=true` union miss. Tab presses therefore depend on a unique accessibility label. The Home and Spend tabs do not have one, so flows that press them are Android-only until the app exposes a `testID` on each tab.
- **Every flow declares `@desc` and `@pre`.** Scenarios enforce every `@pre` before mutation and every `@post` before success. Utility macros (for example `go-back`) may omit `@post`. Add `@tag` when applicable.
- **Choose directory intentionally.** Put reusable setup/navigation steps in `flows/macros/`; put outcome verification scenarios in `flows/scenarios/`.
- **Keep scope coherent, not artificially tiny.** Flows can span multiple screens when that sequence is the reusable intent (for example "create and submit manual expense").
- **Peers share `@pre` and differ on `@post`.** One flow per narrow outcome is better than a mega-flow with conditional branches.
- **Use `@param` for substituted values.** If a literal is interpolated into the body, declare `# @param KEY description.` and reference it as `${KEY}`.
- **Do not use `env` directives in repo flows.** Runtime values must come from `-e KEY=VALUE` (preferred) or `AD_VAR_KEY=...`.
- **Use inline defaults sparingly.** Optional tuning values can use `${KEY:-fallback}` in the body; required values should have no fallback and must be provided by caller input.

## Recording a new flow

1. Drive the target screen manually.
2. Start a session with `--save-script`:
   ```bash
   agent-device open <app> --save-script .claude/skills/agent-device/flows/<kind>/<name>.ad
   ```
3. Perform the steps.
4. `agent-device close` - flushes the `.ad`.
5. Edit the generated file:
   - Delete the `context` line, leading `open ... --relaunch`, trailing `close`, and eyeballing `wait`s.
   - Move file to `flows/macros/` or `flows/scenarios/`, then add `@desc`, `@pre`, optional `@post`, optional `@tag`, and any needed `@param` headers.
6. For scenarios, add executable checks for every declared `@pre` and `@post`.
7. Verify: pre-check from a matching state, replay, post-check.

## Maintenance

Heal selector drift by hand. Replay the flow and read the divergence report:

```bash
agent-device replay .claude/skills/agent-device/flows/<kind>/<name>.ad --session <name>
```

Every divergence carries ranked selector suggestions. Apply them yourself: `replay --update`/`-u` no longer rewrites the `.ad` file. Editing by hand also keeps `${KEY}` placeholders intact. Re-verify `@pre`/`@post` still hold, then commit. Keep runtime inputs in `@param` + `-e`/`AD_VAR_*`; do not reintroduce in-file `env` directives.

Run `node .claude/skills/agent-device/scripts/validate-flows.mjs` after editing scenarios. It checks assertion order, selector specificity, reset paths, canonical ownership of duplicate Sentry tags, and guarded floating action menu transitions.
