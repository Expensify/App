---
name: agent-device
description: Automates interactions for Apple-platform apps (iOS, tvOS, macOS) and Android devices. Use when navigating apps, taking snapshots/screenshots, tapping, typing, scrolling, or extracting UI info across mobile, TV, and desktop targets.
---

# agent-device

Use this skill as a router with mandatory defaults. Read this file first. For normal device tasks, always load `references/bootstrap-install.md` and `references/exploration.md` before acting. Use bootstrap to confirm or establish deterministic setup. Use exploration for UI inspection, interaction, and verification once the app session is open.

## Default operating rules

- Start conservative. Prefer read-only inspection before mutating the UI.
- Start deterministic. If the app name, package, device, or session is uncertain, load bootstrap and discover them before interacting.
- Use plain `snapshot` when the task is to verify what text or structure is currently visible on screen.
- Use `snapshot -i` only when you need interactive refs such as `@e3` for a requested action or targeted query. On iOS and Android, default snapshot output uses the same visible-first model: off-screen interactive content is exposed as discovery hints, not tappable refs.
- Prefer `diff snapshot` after a nearby mutation when you only need to know what changed.
- Avoid speculative mutations. You may take the smallest reversible UI action needed to unblock inspection or complete the requested task, such as dismissing a popup, closing an alert, or clearing an unintended surface.
- In React Native dev or debug builds, check early for visible warning or error overlays, tooltips, and toasts that can steal focus or intercept taps. If they are not part of the requested behavior, dismiss them and continue. If you saw them, report them in the final summary.
- Do not browse the web or use external sources unless the user explicitly asks.
- Re-snapshot after meaningful UI changes instead of reusing stale refs.
- Treat refs in default snapshot output as actionable-now, not durable identities. If a target is off-screen, use `scrollintoview` or scroll and re-snapshot.
- Prefer `@ref` or selector targeting over raw coordinates.
- Ensure the correct target is pinned and an app session is open before interacting.
- Keep the loop short: `open` -> inspect/act -> verify if needed -> `close`.

## Default flow

1. Load [references/bootstrap-install.md](references/bootstrap-install.md) and [references/exploration.md](references/exploration.md) before acting on a normal device task.
2. Use bootstrap first to confirm or establish the correct target, app install, and open app session.
3. Once the app session is open and stable, use exploration for inspection, interaction, and verification.
4. Start with plain `snapshot` if the goal is to read or verify what is visible.
5. Escalate to `snapshot -i` only if you need refs for interactive exploration or a requested action.
6. Use `get`, `is`, or `find` before mutating the UI when a read-only command can answer the question.
7. End by capturing proof if needed, then `close`.

## QA modes

- Open-ended bug hunt with reporting: use [../dogfood/SKILL.md](../dogfood/SKILL.md).
- Pass/fail QA from acceptance criteria: stay in this skill, start with [references/bootstrap-install.md](references/bootstrap-install.md), then use the QA loop in [references/exploration.md](references/exploration.md).

## Required references

- For every normal device task, after reading this file, load [references/bootstrap-install.md](references/bootstrap-install.md) first, then [references/exploration.md](references/exploration.md), before acting.
- Use bootstrap to confirm or establish deterministic setup, especially in sandbox or cloud environments.
- Use exploration once the app session is open and stable.
- Load additional references only when their scope is needed.

## Decision rules

- Use plain `snapshot` when you need to verify whether text is visible.
- Use `snapshot -i` mainly for interactive exploration and choosing refs.
- Use `diff snapshot` for compact post-action verification; use `snapshot --diff` when that alias is easier to discover from snapshot help.
- Use `get`, `is`, or `find` when they can answer the question without changing UI state.
- Use `fill` to replace text.
- Use `type` to append text.
- Do not write `type @eN "text"`. Use `fill @eN "text"` to target a field directly, or `press @eN` then `type "text"` when the field already has focus and you want append semantics.
- If the on-screen keyboard blocks the next step, prefer `keyboard dismiss` over navigation. On iOS, keep an app session open first; `keyboard status|get` remains Android-only.
- When a task asks to "go back", use plain `back` for predictable app-owned navigation and reserve `back --system` for platform back gestures or button semantics.
- Use `type --delay-ms` or `fill --delay-ms` for debounced search fields that drop characters when typed too quickly.
- If there is no simulator, no app install, or no open app session yet, switch to `bootstrap-install.md` instead of improvising setup steps.
- Use the smallest unblock action first when transient UI blocks inspection, but do not navigate, search, or enter new text just to make the UI reveal data unless the user asked for that interaction.
- In React Native dev or debug apps, treat visible warning or error overlays as transient blockers unless the user is explicitly asking you to diagnose them. Dismiss them when safe, then continue the requested flow.
- Do not use external lookups to compensate for missing on-screen data unless the user asked for them.
- If the needed information is not exposed on screen, say that plainly instead of compensating with extra navigation, text entry, or web search.
- Prefer `@ref` or selector targeting over raw coordinates.

## Additional references

- Need logs, network, alerts, permissions, or failure triage: [references/debugging.md](references/debugging.md)
- Need screenshots, diff, recording, replay maintenance, or perf data: [references/verification.md](references/verification.md)
- Need desktop surfaces, menu bar behavior, or macOS-specific interaction rules: [references/macos-desktop.md](references/macos-desktop.md)
- Need remote HTTP transport, `--remote-config` launches, or tenant leases on a remote macOS host: [references/remote-tenancy.md](references/remote-tenancy.md)
