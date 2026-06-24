/*
 * Thin TypeScript wrapper around the `agent-device` CLI.
 *
 * Why this exists: the CLI emits accessibility-tree snapshots as
 * human-readable text (`@e4 [text-field] "Phone or email," [editable]`).
 * That format is fine for humans grepping artifacts but bad for an LLM
 * because:
 *   1. The LLM has to re-tokenize the structure on every turn — wasteful.
 *   2. Subtle whitespace/quoting differences across platforms (Android's
 *      trailing comma vs iOS's no comma) leak into the LLM's reasoning.
 *   3. Phantom hallucinated refs are harder to detect against free text.
 *
 * We parse once here, hand the LLM a typed JSON array, and keep the raw
 * text in the artifact for post-mortem.
 */

import { execFileSync } from "child_process";

/**
 * One element in the parsed accessibility tree. The optional fields are
 * absent when the underlying line lacked them; do NOT default to empty
 * strings — the LLM uses presence/absence as a signal (e.g. a button with
 * no text label is suspicious).
 */
export type SnapshotNode = {
  ref: string;
  kind: string;
  text?: string;
  editable: boolean;
  enabled: boolean;
  scrollable: boolean;
};

export type Snapshot = {
  page?: string;
  app?: string;
  nodes: SnapshotNode[];
  nodeCount: number;
  raw: string;
};

export type AppState = {
  foregroundApp?: string;
  activity?: string;
  raw: string;
};

const SESSION = process.env.AGENT_DEVICE_SESSION ?? "ci";

/*
 * Bound every CLI invocation so a hung emulator can't wedge the smoke.
 * 30s is generous for read-only commands (snapshot/screenshot/appstate).
 * `fill` is special: typing a 30-char string into an editable on a
 * 2-core ubuntu-latest under load was observed to exceed 30s (the
 * CLI partial-typed and exited non-zero on timeout — visible at the
 * device level via screenshot but the runner threw before recording
 * the action). 90s gives ~3x headroom.
 */
const CLI_TIMEOUT_MS = 30_000;
const CLI_FILL_TIMEOUT_MS = 90_000;

function run(args: string[]): string {
  const timeout = args[0] === "fill" ? CLI_FILL_TIMEOUT_MS : CLI_TIMEOUT_MS;
  return execFileSync("agent-device", args, {
    encoding: "utf8",
    timeout,
    maxBuffer: 8 * 1024 * 1024,
  });
}

function tryRun(args: string[]): {
  stdout: string;
  ok: boolean;
  error?: Error;
} {
  try {
    return { stdout: run(args), ok: true };
  } catch (e) {
    return { stdout: "", ok: false, error: e as Error };
  }
}

/**
 * Parse a single snapshot line of the form:
 *   `@e4 [text-field] "Phone or email," [editable]`
 *   `@e5 [button] "Continue"`
 *   `@e2 [scroll-area] [scrollable]`
 *
 * The `agent-device` CLI's text format isn't a stable contract, so this
 * parser is deliberately permissive: anything that doesn't fit the shape
 * is dropped (and counted in nodeCount via the header line, not by
 * counting parsed children — so we don't quietly hide drift).
 */
function parseNodeLine(line: string): SnapshotNode | null {
  const refMatch = line.match(/^@(e\d+)\s+\[([a-z-]+)\]/);
  if (!refMatch) {
    return null;
  }
  const [, refIndex, kind] = refMatch;
  const after = line.slice(refMatch[0].length).trim();

  let text: string | undefined;
  const textMatch = after.match(/^"((?:[^"\\]|\\.)*)"/);
  if (textMatch) {
    text = textMatch[1].replace(/,$/, "");
  }

  const flags = after.toLowerCase();
  return {
    ref: `@${refIndex}`,
    kind,
    text,
    editable: flags.includes("[editable]"),
    enabled: !flags.includes("[disabled]"),
    scrollable: flags.includes("[scrollable]"),
  };
}

export function parseSnapshot(raw: string): Snapshot {
  const lines = raw.split("\n");
  const nodes: SnapshotNode[] = [];
  let page: string | undefined;
  let app: string | undefined;
  let nodeCount = 0;

  for (const line of lines) {
    if (line.startsWith("Page:")) {
      page = line.slice("Page:".length).trim();
      continue;
    }
    if (line.startsWith("App:")) {
      app = line.slice("App:".length).trim();
      continue;
    }
    const countMatch = line.match(/^Snapshot:\s*(\d+)/);
    if (countMatch) {
      nodeCount = Number(countMatch[1]);
      continue;
    }
    const node = parseNodeLine(line.trim());
    if (node) {
      nodes.push(node);
    }
  }
  return { page, app, nodes, nodeCount, raw };
}

export function parseAppState(raw: string): AppState {
  const fg = raw.match(/Foreground app:\s*(\S+)/);
  const act = raw.match(/Activity:\s*(\S+)/);
  return { foregroundApp: fg?.[1], activity: act?.[1], raw };
}

/* ---- public surface used by the runner ------------------------------- */

export function snapshot(): Snapshot {
  return parseSnapshot(run(["snapshot", "-i", "--session", SESSION]));
}

export function screenshotBase64(path: string): string {
  run(["screenshot", path, "--session", SESSION]);
  /*
   * The CLI writes to disk; the runner reads + base64-encodes itself
   * (we keep this wrapper free of fs to keep the signatures simple).
   */
  return path;
}

export function appstate(): AppState {
  return parseAppState(run(["appstate", "--session", SESSION]));
}

export function fill(ref: string, text: string): void {
  run(["fill", ref, text, "--session", SESSION]);
}

export function press(ref: string): void {
  run(["press", ref, "--session", SESSION]);
}

export function closeSession(): void {
  /* Idempotent — if there's no session, this is a no-op. */
  tryRun(["close", "--session", SESSION]);
}

/**
 * @deprecated Prefer `platform.back()` / `platform.dismissKeyboard()`
 * from `./agent-device-platform`. Kept exported because the skill-
 * bundled `replay-only.ts` helper (on a separate branch) still
 * imports it; the upstream-bound driver no longer calls this
 * directly — keyevent dispatch is now platform-specific.
 */
export function adbKey(keyEvent: number): void {
  execFileSync("adb", ["shell", "input", "keyevent", String(keyEvent)], {
    timeout: CLI_TIMEOUT_MS,
    encoding: "utf8",
  });
}

/**
 * Find nodes whose text contains the given substring (case-insensitive).
 * Side-effect-free; operates on a snapshot already in memory.
 */
export function findInSnapshot(snap: Snapshot, needle: string): SnapshotNode[] {
  const n = needle.toLowerCase();
  return snap.nodes.filter((node) => node.text?.toLowerCase().includes(n));
}
