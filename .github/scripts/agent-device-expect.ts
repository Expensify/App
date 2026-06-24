/*
 * `expect:` DSL — machine-checked postcondition for each test step.
 *
 * Why a tiny DSL instead of letting the LLM self-report success:
 * `step_complete(rationale)` is an LLM claim, not evidence. A canary
 * that trusts an LLM's claim is a canary the LLM can lie to. The
 * `expect:` clause is evaluated by deterministic TypeScript code
 * against the post-state snapshot/appstate. The step fails red if
 * `expect:` fails, regardless of what the LLM said.
 *
 * Grammar (intentionally small — extend only when a real test step
 * can't be expressed):
 *   snapshot.contains_text("...")
 *   snapshot.field_with_text("...").exists
 *   appstate.foreground == "..."
 *
 * String literal: double-quoted, backslash-escapable. No interpolation,
 * no regex, no boolean ops. If a step needs more, write a second step.
 */

import type { AppState, Snapshot } from "./agent-device-cli";

export type ExpectResult = { ok: true } | { ok: false; reason: string };

const STR = String.raw`"((?:[^"\\]|\\.)*)"`;

const PATTERNS: Array<{
  re: RegExp;
  eval: (m: RegExpMatchArray, snap: Snapshot, app: AppState) => ExpectResult;
}> = [
  {
    re: new RegExp(`^snapshot\\.contains_text\\(${STR}\\)$`),
    eval: (m, snap) => {
      const needle = m[1].toLowerCase();
      const hit = snap.nodes.some((n) =>
        n.text?.toLowerCase().includes(needle),
      );
      return hit
        ? { ok: true }
        : {
            ok: false,
            reason: `no node contains text ${JSON.stringify(m[1])} (snapshot has ${snap.nodes.length} nodes)`,
          };
    },
  },
  {
    re: new RegExp(`^snapshot\\.field_with_text\\(${STR}\\)\\.exists$`),
    eval: (m, snap) => {
      const needle = m[1].toLowerCase();
      const hit = snap.nodes.some(
        (n) => n.editable && n.text?.toLowerCase().includes(needle),
      );
      return hit
        ? { ok: true }
        : {
            ok: false,
            reason: `no editable field contains text ${JSON.stringify(m[1])}`,
          };
    },
  },
  {
    re: new RegExp(`^appstate\\.foreground\\s*==\\s*${STR}$`),
    eval: (m, _snap, app) => {
      return app.foregroundApp === m[1]
        ? { ok: true }
        : {
            ok: false,
            reason: `foreground app is ${app.foregroundApp ?? "(unknown)"}, expected ${m[1]}`,
          };
    },
  },
];

export function evaluateExpect(
  clause: string,
  snap: Snapshot,
  app: AppState,
): ExpectResult {
  const trimmed = clause.trim();
  for (const p of PATTERNS) {
    const m = trimmed.match(p.re);
    if (m) {
      return p.eval(m, snap, app);
    }
  }
  return { ok: false, reason: `unrecognized expect clause: ${clause}` };
}
