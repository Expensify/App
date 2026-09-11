# Flows

This file is the reference for every `.ad` file in the repository: the metadata spec, selector rules, recording, and maintenance.

## Directory layout

1. `macros/` contains reusable setup and navigation helpers for interactive work. These are the only flows an interactive agent may propose.
2. `macros/<platform>/` contains platform-specific overrides of a `macros/` flow, for flows whose selectors differ per platform. See [Platform scoping](#platform-scoping).

`macros/` contains composable `.ad` snippets. The caller owns application startup, authentication, platform selection, session state, and cleanup. A flow may span one or multiple screens as long as it represents a coherent action with clear start (`@pre`) and completion (`@post`) checkpoints.

## Platform scoping

Most flows are platform-neutral and live directly in `macros/`. A flow whose selectors genuinely differ per platform gets a copy per platform under `macros/<platform>/`, where `<platform>` is the value passed to `--platform`.

A caller driving platform `P` resolves a macro by name:

1. `macros/<P>/<name>.ad` when that file exists.
2. `macros/<name>.ad` otherwise.

Split flows today: `sign-in.ad`, `send-message.ad`, `complete-onboarding.ad`. All three fill text inputs, whose accessibility shape differs between web and native. The unscoped copy of a split flow stays in `macros/` as the fallback for platforms that have no folder yet; it is not the contract for any platform that does have one. (Exception: `sign-in.ad` is fully platform-scoped - `web` and `android` only - and has no unscoped fallback; a new platform such as iOS must add its own `macros/<platform>/sign-in.ad`.) Everything else stays shared - split a flow only after confirming the divergence per platform with `agent-device is visible "<selector>"`.

## Agent decision loop (interactive)

Before manually navigating, use this human-in-the-loop loop:

1. `agent-device snapshot -i` - see current state.
2. `grep -H '^# @' .claude/skills/agent-device/flows/macros/*.ad .claude/skills/agent-device/flows/macros/<platform>/*.ad` - interactive catalog. Where both list the same name, the platform copy wins.
3. For each candidate flow, run `agent-device is exists "<selector>"` per `@pre`. Keep flows where every `@pre` passes.
4. Rank survivors by goal closeness and present top macro candidates to the user with a short "why this flow" note:
   - Prefer flows whose `@post` selectors literally match destination language from the user request (same `text`, `label`, or selector phrase).
5. Wait for user selection before replaying. **Auto-run is allowed only when there is exactly one survivor and it is an unambiguous match for an explicit user request.**
   - Only propose flows from `flows/macros/` in interactive usage.
6. Scan selected flow `# @param` headers. Ask the user for any missing parameter values, then build explicit CLI args (`-e KEY=VALUE`) for replay.
7. `agent-device replay <path> -e KEY=VALUE ...`.
8. If the flow declares `@post`, verify each `@post` with `is exists`. On success, re-enter the loop only if the user's stated goal is not complete; otherwise stop and report completion. On failure, propose peer flow/manual fallback options and ask before continuing. If no `@post` is declared (utility flow), rely on explicit user confirmation or the next snapshot before continuing.

## Replay lifecycle

No flow in this repository owns application lifecycle, so none of them is a self-contained `agent-device test` input. `agent-device test` creates an isolated session per attempt; use it only for scripts that own `context`, `open`, and cleanup. Repository flows expect the caller to open the app and prepare a named session first.

## Metadata header spec

Each flow starts with `# @key value` comment lines. The `.ad` parser treats `#` lines as no-ops, so headers cost nothing at replay time.

| Field    | Cardinality | Value                                                                                  |
| -------- | ----------- | -------------------------------------------------------------------------------------- |
| `@desc`  | 1           | One-line human summary.                                                                |
| `@pre`   | 1..N        | Selector that must resolve in the current snapshot. Multiple lines are ANDed.           |
| `@post`  | 0..N        | Selector expected after replay. Multiple lines are ANDed. The flow body enforces them. |
| `@param` | 0..N        | Runtime input contract: `@param KEY description.` Use with `${KEY}` in flow body.      |

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
- **Durable selectors.** Prefer `id=...` first, then `role=... label=...`, with `||` fallbacks. Avoid `@eN` refs.
- **A `@pre` must distinguish the start screen from the destination.** A bottom-tab label such as `text="Home"` is rendered on every tab, so asserting it proves nothing. Anchor on a screen-scoped `id=` instead - `id="HomePage"` for Home, `id="BaseSidebarScreen"` for Inbox - otherwise a flow that starts on the wrong screen reports success while the action it measures never happens.
- **Confirm every selector on the platform it is written for.** `snapshot -i` prints display tags, which are not selector values - a node printed as `[text-field]` may only match `role="textbox"`. Check the exit code of `agent-device is visible "<selector>"` before committing a selector, and never carry one across platforms unchecked.
- **Every flow declares `@desc` and `@pre`.** Outcome-bearing flows also declare at least one `@post`. Utility macros (for example `go-back`) may omit `@post`.
- **Every declared `@pre` and `@post` runs as a body assertion.** Use `is exists` or `wait`. Metadata documents the contract but does not execute it.
- **Assertion order decides whether a pass means anything.** Enforce every `@pre` before the first mutation and every `@post` after the last one. An assertion on the wrong side of a mutation lets a flow report success from the screen it started on.
- **No `find <selector> "click"`.** It resolves at runtime and hides which element was hit. Press an exact selector instead.
- **A bare `label=` alternative must carry `hittable=true`.** Without it the match can land on an off-screen or non-interactive node and the press silently does nothing.
- **Keep scope coherent, not artificially tiny.** Flows can span multiple screens when that sequence is the reusable intent (for example "create and submit manual expense").
- **Peers share `@pre` and differ on `@post`.** One flow per narrow outcome is better than a mega-flow with conditional branches.
- **Use `@param` for substituted values.** If a literal is interpolated into the body, declare `# @param KEY description.` and reference it as `${KEY}`.
- **Do not use `env` directives in repo flows.** Runtime values must come from `-e KEY=VALUE` (preferred) or `AD_VAR_KEY=...`.
- **Use inline defaults sparingly.** Optional tuning values can use `${KEY:-fallback}` in the body; required values should have no fallback and must be provided by caller input.

## Recording a new flow

1. Drive the target screen manually.
2. Start a session with `--save-script`:
   ```bash
   agent-device open <app> --save-script .claude/skills/agent-device/flows/macros/<name>.ad
   ```
3. Perform the steps.
4. `agent-device close` - flushes the `.ad`.
5. Edit the generated file:
   - Delete the `context` line, leading `open ... --relaunch`, trailing `close`, and eyeballing `wait`s.
   - Move the file to `flows/macros/`, then add `@desc`, `@pre`, optional `@post`, and any needed `@param` headers.
6. Add executable checks for every declared `@pre` and `@post`.
7. Verify: pre-check from a matching state, replay, post-check.

## Maintenance

Heal selector drift by hand. Replay the flow and read the divergence report:

```bash
agent-device replay <path-to-flow>.ad --session <name>
```

Every divergence carries ranked selector suggestions. Apply them yourself: `replay --update`/`-u` no longer rewrites the `.ad` file. Editing by hand also keeps `${KEY}` placeholders intact. Re-verify `@pre`/`@post` still hold, then commit. Keep runtime inputs in `@param` + `-e`/`AD_VAR_*`; do not reintroduce in-file `env` directives.

After editing a flow, re-read the authoring rules above and replay it from a matching start state. A green replay plus enforced `@pre`/`@post` is the check.
