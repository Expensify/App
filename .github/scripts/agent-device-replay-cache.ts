/*
 * Replay cache for the LLM-driven smoke.
 *
 * Without this cache, every PR run pays the LLM round-trip cost on
 * every step. Worse, every run is non-deterministic. With it, the
 * happy path costs ~$0 and runs deterministically; only when the
 * snapshot signature changes (real UI shape change) do we fall
 * through to the LLM.
 *
 * The cache file lives at `tests/smoke/cache/<test-case>.json` and
 * is committed. The diff in code review is the human-readable
 * signal that "the SignIn UI shape changed" — the property
 * reviewers want to see.
 */

import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import type { RoleLocator } from "./agent-device-snapshot-signature";

export type CachedAction =
  | { tool: "fill"; locator: RoleLocator; text: string }
  | { tool: "press"; locator: RoleLocator }
  | { tool: "back" }
  | { tool: "dismiss_keyboard" }
  | { tool: "wait"; ms: number }
  | { tool: "wait_for"; predicate: string; timeoutMs: number };

export type CachedStep = {
  stepNumber: number;
  stepTextHash: string;
  preSignature: string;
  postSignature: string;
  actions: CachedAction[];
  expect: string | null;
  recordedAt: string;
  runId: string;
};

export type CacheV1 = {
  version: 1;
  model: string;
  testCaseHash: string;
  steps: CachedStep[];
};

export function hashText(s: string): string {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

export function loadCache(
  filePath: string,
  model: string,
  testCaseHash: string,
): CacheV1 {
  if (!fs.existsSync(filePath)) {
    return { version: 1, model, testCaseHash, steps: [] };
  }
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as CacheV1;
  if (raw.version !== 1) {
    throw new Error(
      `Cache version mismatch at ${filePath}: expected 1, got ${raw.version}`,
    );
  }
  return raw;
}

/**
 * Cache hit requires three things to line up:
 *   1. test_case_hash — the test file itself hasn't been edited
 *   2. step_number    — we're at the right step in the sequence
 *   3. pre_signature  — we're staring at the same UI shape we recorded
 *
 * If any drift, we fall through to the LLM and (on success) the
 * runner emits a cache-diff to artifacts. The PR check fails red,
 * forcing the contributor to commit the updated cache.
 */
export function lookup(
  cache: CacheV1,
  stepNumber: number,
  preSignature: string,
): CachedStep | null {
  return (
    cache.steps.find(
      (s) => s.stepNumber === stepNumber && s.preSignature === preSignature,
    ) ?? null
  );
}

export function diff(committed: CacheV1, recorded: CacheV1): string {
  const lines: string[] = [];
  for (const s of recorded.steps) {
    const prior = committed.steps.find((c) => c.stepNumber === s.stepNumber);
    if (!prior) {
      lines.push(
        `+ step ${s.stepNumber}: NEW (pre=${s.preSignature}, post=${s.postSignature})`,
      );
      continue;
    }
    if (prior.preSignature !== s.preSignature) {
      lines.push(
        `~ step ${s.stepNumber}: pre_signature ${prior.preSignature} → ${s.preSignature}`,
      );
    }
    if (prior.postSignature !== s.postSignature) {
      lines.push(
        `~ step ${s.stepNumber}: post_signature ${prior.postSignature} → ${s.postSignature}`,
      );
    }
    if (JSON.stringify(prior.actions) !== JSON.stringify(s.actions)) {
      lines.push(
        `~ step ${s.stepNumber}: actions changed (${prior.actions.length} → ${s.actions.length})`,
      );
    }
  }
  return lines.join("\n");
}

export function writeCache(filePath: string, cache: CacheV1): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(cache, null, 2)}\n`);
}
