/*
 * Structural signature of a UI snapshot.
 *
 * The signature is the cache key for the replay system: cache hits replay
 * recorded actions, cache misses fall back to the LLM. For that to work,
 * the signature must be:
 *
 *   1. STABLE across cosmetic UI changes — locale rotation, A/B copy
 *      tests, visible user data, dynamic timestamps. We exclude visible
 *      `text` content for this reason. A label changing from
 *      "Continue" to "Submit" must NOT bust the cache (the replay layer
 *      finds the button by role + position, then the LLM recovery layer
 *      handles a real shape change if any).
 *
 *   2. SENSITIVE to structural change — a new button appearing, an
 *      input becoming non-editable, a screen transitioning to a
 *      different layout. These are the events that invalidate a
 *      recorded action sequence.
 *
 * Net effect: localization or copy churn doesn't trigger an LLM call,
 * but real UI shape change does.
 */

import { createHash } from "crypto";
import type { Snapshot, SnapshotNode } from "./agent-device-cli";

function project(node: SnapshotNode): string {
  return [
    node.kind,
    node.text ? "T1" : "T0",
    node.editable ? "E1" : "E0",
    node.enabled ? "N1" : "N0",
    node.scrollable ? "S1" : "S0",
  ].join("|");
}

/**
 * Transient nodes the signature must ignore.
 *
 * React Native dev-mode renders an inline "!, <warning>" bubble for
 * runtime warnings (StrictMode, dev-only assertions, etc.). These
 * appear and disappear between runs depending on bundler timing and
 * warning suppression state — same screen, different node count.
 * Runs 25659967543 and 25662443061 produced different signatures on
 * an identical SignIn screen because one had 3 extra dev-warning
 * nodes the other didn't, and cache replay never landed.
 *
 * These warnings are dev-only, never reach release builds, and never
 * mean anything to a user — exactly the kind of cosmetic node the
 * structural signature should disregard.
 */
function isTransientDevWarning(node: SnapshotNode): boolean {
  if (!node.text) {
    return false;
  }
  if (node.kind === "group" && node.text.startsWith("!, ")) {
    return true;
  }
  if (node.kind === "text" && node.text === "!") {
    return true;
  }
  if (
    node.kind === "text" &&
    node.text.startsWith("Open debugger to view warnings")
  ) {
    return true;
  }
  if (
    node.kind === "text" &&
    node.text.startsWith("The result of getSnapshot")
  ) {
    return true;
  }
  return false;
}

export function snapshotSignature(snap: Snapshot): string {
  const projected = snap.nodes
    .filter((n) => !isTransientDevWarning(n))
    .map(project)
    .join("\n");
  return createHash("sha256").update(projected).digest("hex").slice(0, 16);
}

/**
 * Locator that survives across runs even though `@eN` refs do not.
 * The runner re-resolves to a concrete `@ref` against the live
 * snapshot at replay time.
 *
 * Example: `{kind: "text-field", index: 0, editable: true}` →
 * "the first editable text-field in the current snapshot".
 */
export type RoleLocator = {
  kind: string;
  index: number;
  editable?: boolean;
};

export function refToLocator(snap: Snapshot, ref: string): RoleLocator | null {
  const sameKind = snap.nodes.filter(
    (n) => n.kind === snap.nodes.find((m) => m.ref === ref)?.kind,
  );
  const idx = sameKind.findIndex((n) => n.ref === ref);
  if (idx < 0) {
    return null;
  }
  const node = sameKind[idx];
  return { kind: node.kind, index: idx, editable: node.editable || undefined };
}

export function locatorToRef(snap: Snapshot, loc: RoleLocator): string | null {
  const matches = snap.nodes.filter((n) => {
    if (n.kind !== loc.kind) {
      return false;
    }
    if (loc.editable !== undefined && n.editable !== loc.editable) {
      return false;
    }
    return true;
  });
  return matches[loc.index]?.ref ?? null;
}
