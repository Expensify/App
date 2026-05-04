# Flows

Composable `.ad` snippets - bounded units of work. A flow may span one or multiple screens as long as it represents a coherent, reusable action with clear start (`@pre`) and completion (`@post`) checkpoints. Each flow advertises machine-matchable metadata (`@pre`, `@post`, `@tag`) via `# @`-prefixed comment headers, so an agent can pick the right one from a snapshot.

## Agent decision loop

Before manually navigating, use this human-in-the-loop loop:

1. `agent-device snapshot -i` - see current state.
2. `grep -H '^# @' .claude/skills/agent-device/flows/*.ad` - full catalog in one read.
3. For each candidate flow, run `agent-device is exists "<selector>"` per `@pre`. Keep flows where every `@pre` passes.
4. Rank survivors by goal closeness (`@post` overlap with the requested destination when present) and present top candidates to the user with a short "why this flow" note.
5. Wait for user selection before replaying. **Auto-run is allowed only when there is exactly one survivor and it is an unambiguous match for an explicit user request.**
6. `agent-device replay <path>`.
7. If the flow declares `@post`, verify each `@post` with `is exists`. On success, re-enter the loop only if the user's stated goal is not complete; otherwise stop and report completion. On failure, propose peer flow/manual fallback options and ask before continuing. If no `@post` is declared (utility flow), rely on explicit user confirmation or the next snapshot before continuing.

## Metadata header spec

Each flow starts with `# @key value` comment lines. The `.ad` parser treats `#` lines as no-ops, so headers cost nothing at replay time.

| Field    | Cardinality | Value                                                                                            |
| -------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `@desc`  | 1           | One-line human summary.                                                                          |
| `@pre`   | 1..N        | Selector that must resolve in the current snapshot. Multiple lines are ANDed.                    |
| `@post`  | 0..N        | Selector expected after replay. Multiple lines are ANDed. Used for chaining + success.           |
| `@tag`   | 0..N        | Free-form category (`auth`, `onboarding`, ...) or scoped (`sentry-<spanName>`).                  |

Selector syntax matches the body: `id="..."`, `role="..." label="..."`, `text="..."`, `||` for fallbacks.

## Parametrization (`agent-device` v0.13.0+)

Lift body literals to named variables via `env` + `${VAR}` interpolation so values can be overridden at runtime without editing the file.

| Construct          | Where                | Purpose                                                                          |
| ------------------ | -------------------- | -------------------------------------------------------------------------------- |
| `env KEY=VALUE`    | Header (after `# @`) | File-level default. Quote values with spaces or `||` chains: `env KEY="a || b"`. |
| `${KEY}`           | Body                 | Interpolation point. Resolves at replay time.                                    |
| `${KEY:-fallback}` | Body                 | Use `fallback` if `KEY` is unset.                                                |
| `\${KEY}`          | Body                 | Literal `${KEY}` (escape).                                                       |

Resolution precedence (high to low): CLI `-e KEY=VALUE` (repeatable) > shell `AD_KEY=...` (auto-imported, prefix stripped) > file `env` > built-ins (`AD_PLATFORM`, `AD_SESSION`, `AD_FILENAME`, `AD_DEVICE`, `AD_ARTIFACTS`). Unresolved `${X}` errors with `file:line`.

Override at runtime without editing the file:

```bash
agent-device replay <flow>.ad -e EMAIL=other@example.com
```

## Authoring rules

- **No `open`, no `close`, no `context` header.** Caller owns lifecycle.
- **No fixed `wait` calls.** `fill`/`press` resolve selectors with retry. Only add `wait <selector>` for real post-action blocks.
- **Durable selectors.** Prefer `id=...` first, then `role=... label=...`, with `||` fallbacks. Avoid `@eN` refs.
- **Every flow declares `@desc` and `@pre`.** Add `@post` for outcome-bearing flows; utility flows (for example `go-back`) may omit it. Add `@tag` when applicable.
- **Keep scope coherent, not artificially tiny.** Flows can span multiple screens when that sequence is the reusable intent (for example "create and submit manual expense").
- **Peers share `@pre` and differ on `@post`.** One flow per narrow outcome is better than a mega-flow with conditional branches.
- **Use `env` for substituted values.** If a literal is interpolated into the body, declare a matching `env` default and reference it as `${VAR}`.

## Recording a new flow

1. Drive the target screen manually.
2. Start a session with `--save-script`:
   ```bash
   agent-device open <app> --save-script .claude/skills/agent-device/flows/<name>.ad
   ```
3. Perform the steps.
4. `agent-device close` - flushes the `.ad`.
5. Edit the generated file:
   - Delete the `context` line, leading `open ... --relaunch`, trailing `close`, and eyeballing `wait`s.
   - Add `@desc`, `@pre`, optional `@post`, and `@tag` headers.
6. Verify: pre-check from a matching state, replay, post-check.

## Maintenance

Heal selector drift in place:

```bash
agent-device replay -u .claude/skills/agent-device/flows/<name>.ad
```

Re-verify `@pre`/`@post` still hold, then commit. Note: `replay -u` is rejected when the script declares `env` directives (rewrite would drop them); strip the `env` block manually before healing, then re-add it.
