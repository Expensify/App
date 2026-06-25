# Flows

## Directory layout

- `macros/` - reusable helpers for common setup/navigation actions that stop in a navigable state for further interactive work.
- `tests/` - critical-scenario scripts for QA/perf verification that assert explicit outcomes (for example Sentry spans) and then stop.

Composable `.ad` snippets - bounded units of work. A flow may span one or multiple screens as long as it represents a coherent, reusable action with clear start (`@pre`) and completion (`@post`) checkpoints. Each flow advertises machine-matchable metadata (`@pre`, `@post`, `@tag`, `@param`) via `# @`-prefixed comment headers, while flow type is derived from location (`flows/macros/` or `flows/tests/`).

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

## QA workflow (separate)

`flows/tests/` is reserved for dedicated QA automation and should not be offered to users as part of the interactive helper loop above. Run these flows with the dedicated test runner:

```bash
agent-device test .claude/skills/agent-device/flows/tests/<name>.ad -e KEY=VALUE ...
```

## Metadata header spec

Each flow starts with `# @key value` comment lines. The `.ad` parser treats `#` lines as no-ops, so headers cost nothing at replay time.

| Field    | Cardinality | Value                                                                                            |
| -------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `@desc`  | 1           | One-line human summary.                                                                          |
| `@pre`   | 1..N        | Selector that must resolve in the current snapshot. Multiple lines are ANDed.                    |
| `@post`  | 0..N        | Selector expected after replay. Multiple lines are ANDed. Used for chaining + success.           |
| `@tag`   | 0..N        | Free-form category (`auth`, `onboarding`, ...) or scoped (`sentry-<spanName>`).                  |
| `@param` | 0..N        | Runtime input contract: `@param KEY description.` Use with `${KEY}` in flow body.                |

Selector syntax matches the body: `id="..."`, `role="..." label="..."`, `text="..."`, `||` for fallbacks.

## Parametrization (`agent-device` v0.13.0+)

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
- **No fixed `wait` calls.** `fill`/`press` resolve selectors with retry. Only add `wait <selector>` for real post-action blocks.
- **Durable selectors.** Prefer `id=...` first, then `role=... label=...`, with `||` fallbacks. Avoid `@eN` refs.
- **Every flow declares `@desc` and `@pre`.** Add `@post` for outcome-bearing flows; utility flows (for example `go-back`) may omit it. Add `@tag` when applicable.
- **Choose directory intentionally.** Put reusable setup/navigation steps in `flows/macros/`; put outcome verification scenarios in `flows/tests/`.
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
   - Move file to `flows/macros/` or `flows/tests/`, then add `@desc`, `@pre`, optional `@post`, optional `@tag`, and any needed `@param` headers.
6. Verify: pre-check from a matching state, replay, post-check.

## Maintenance

Heal selector drift in place:

```bash
agent-device replay -u .claude/skills/agent-device/flows/<kind>/<name>.ad
```

Re-verify `@pre`/`@post` still hold, then commit. Note: `replay -u` can rewrite interpolated lines to concrete selectors/values; review diffs and restore `${KEY}` placeholders where needed. Keep runtime inputs in `@param` + `-e`/`AD_VAR_*`; do not reintroduce in-file `env` directives.
