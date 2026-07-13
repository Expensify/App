/*
 * Phase-1 LLM-driven Android smoke runner.
 *
 * Lifecycle inside the workflow's emulator-runner `script:` block:
 *
 *   1. Boot dance (deterministic, NOT LLM-driven):
 *      - close any stale agent-device session
 *      - locate dev APK from android/app/build/outputs/...
 *      - adb install
 *      - adb reverse tcp:8081 tcp:8081  (Metro reachable from emulator)
 *      - npm start &  (Metro background)
 *      - poll /status until packager-status:running
 *      - agent-device open --relaunch  (cold start)
 *
 *   2. Test-case execution:
 *      - parse test case (numbered steps + optional `expect:` lines)
 *      - per step: cache-first / LLM-fallback / bash-fallback ladder
 *      - assert post-state via `expect:` evaluator
 *      - write artifacts (screenshots, snapshots, llm-trace, cache-diff)
 *
 *   3. Cleanup (always — even on signal/error):
 *      - dump logcat once
 *      - close agent-device session (so re-runs aren't tripped by the
 *        "session already bound" guard)
 *      - kill background jobs (Metro)
 *
 * Why a TS runner instead of Python or Bash:
 *   - The repo already runs ts-node in CI (precedent: createDocsRoutes.ts).
 *   - Reusing the snapshot parser + signature + expect DSL across
 *     replay / LLM / bash paths means one source of truth for what
 *     "the SignIn screen is on screen" means — a divergence between
 *     "what bash sees" and "what the LLM sees" would be a class of
 *     bugs we don't want.
 */

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import * as adCli from "./agent-device-cli";
import type { Snapshot, AppState } from "./agent-device-cli";
import {
  snapshotSignature,
  refToLocator,
  locatorToRef,
} from "./agent-device-snapshot-signature";
import { evaluateExpect } from "./agent-device-expect";
import * as cache from "./agent-device-replay-cache";
import type { CachedAction, CacheV1 } from "./agent-device-replay-cache";
import {
  AnthropicClient,
  TokenBudgetExceededError,
  AnthropicCallFailedError,
} from "./agent-device-llm-client";
import type {
  AnthropicTool,
  AnthropicMessage,
} from "./agent-device-llm-client";
import {
  detectPlatform,
  startMetro,
  locateBundle,
  backgroundPids,
} from "./agent-device-platform";
import type { Platform } from "./agent-device-platform";

/* ---- config ----------------------------------------------------------- */

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const TOKEN_BUDGET = Number(process.env.LLM_TOKEN_BUDGET ?? 200_000);
const SESSION = process.env.AGENT_DEVICE_SESSION ?? "ci";
const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR ?? "artifacts";
const TEST_CASE_PATH =
  process.argv[2] ?? "tests/smoke/android-signin.testcase.txt";
const CACHE_PATH =
  process.env.LLM_CACHE_PATH ?? deriveCachePath(TEST_CASE_PATH);
const platform: Platform = detectPlatform();
const METRO_READY_TIMEOUT_MS = 120_000;
/*
 * 600s gives ~2× margin over Phase 0's observed 294s (warm AVD). The
 * first run on a fresh AVD-cache key is closer to a cold boot since
 * the prime+run happens in two separate emulator-runner invocations
 * and the snapshot-load overhead lands inside this budget.
 */
const SIGNIN_LOAD_TIMEOUT_MS = 600_000;
const BOOT_PROBE_INTERVAL_MS = 30_000;
const STEP_WALL_CLOCK_BUDGET_MS = 60_000;
const MAX_STATE_CHANGING_ACTIONS = 4;
const SCREENSHOT_BUDGET_PER_RUN = 2;
const TEXT_LENGTH_CAP = 200;
/*
 * DEBUG_LLM=1 makes both the LLM client (request/response bodies)
 * and the runner (per-tool-dispatch entries) emit verbose entries to
 * llm-trace.jsonl + stdout. Off by default to keep normal-run
 * artifacts and CI stdout slim.
 */
const DEBUG_LLM = process.env.DEBUG_LLM === "1";

/* ---- types ------------------------------------------------------------ */

type Step = {
  number: number;
  text: string;
  expect: string | null;
  raw: string;
};

type ToolResultBlock = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
};
type ContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: { type: "base64"; media_type: "image/png"; data: string };
    }
  | ToolResultBlock;

type ExecutedAction = CachedAction & { ref?: string };

/* ---- entry point ------------------------------------------------------ */

async function main(): Promise<void> {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  registerCleanup();

  log(
    `runner=${MODEL} test_case=${TEST_CASE_PATH} cache=${CACHE_PATH} budget=${TOKEN_BUDGET}`,
  );

  const testCaseRaw = fs.readFileSync(TEST_CASE_PATH, "utf8");
  const testCaseHash = cache.hashText(testCaseRaw);
  const steps = parseTestCase(testCaseRaw);
  if (!steps.length) {
    fail("test case has no steps");
  }

  const committed = cache.loadCache(CACHE_PATH, MODEL, testCaseHash);
  const recorded: CacheV1 = {
    version: 1,
    model: MODEL,
    testCaseHash,
    steps: [],
  };

  await bootApp();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const llm = apiKey
    ? new AnthropicClient({
        apiKey,
        model: MODEL,
        tokenBudget: TOKEN_BUDGET,
        traceWriter: (e) =>
          fs.appendFileSync(
            path.join(ARTIFACTS_DIR, "llm-trace.jsonl"),
            `${JSON.stringify(e)}\n`,
          ),
      })
    : null;
  if (!llm) {
    log(
      "::warning::ANTHROPIC_API_KEY missing — every step will use bash fallback",
    );
  }

  let cacheHits = 0;
  let llmRuns = 0;
  let bashRuns = 0;

  for (const step of steps) {
    const result = await executeStep(step, {
      committed,
      testCaseHash,
      llm,
      recorded,
      stats: {
        onCacheHit: () => cacheHits++,
        onLLMRun: () => llmRuns++,
        onBashRun: () => bashRuns++,
      },
    });
    if (!result.ok) {
      fail(`step ${step.number} failed: ${result.reason}`);
    }
  }

  /*
   * Always write the recorded cache diff, even if it's identical.
   * Reviewers want to see a clean (no-op) diff to know the canary
   * ran end-to-end without UI drift.
   */
  const diffText = cache.diff(committed, recorded);
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, "cache-diff.txt"),
    `${diffText || "(no drift — cache up to date)"}\n`,
  );
  cache.writeCache(path.join(ARTIFACTS_DIR, "cache-recorded.json"), recorded);

  log(
    `::notice::smoke OK — cache_hits=${cacheHits} llm_runs=${llmRuns} bash_runs=${bashRuns} tokens=${llm?.getTokensUsed() ?? 0}`,
  );

  if (diffText) {
    log(
      "::warning::cache drift detected — copy artifacts/cache-recorded.json to tests/smoke/cache/<test>.json and commit",
    );
  }
}

/* ---- test case parser ------------------------------------------------- */

function parseTestCase(raw: string): Step[] {
  const steps: Step[] = [];
  let cur: Step | null = null;
  for (const lineRaw of raw.split("\n")) {
    const line = lineRaw.trimEnd();
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }
    const m = line.match(/^(\d+)\.\s+(.*)$/);
    if (m) {
      if (cur) {
        steps.push(cur);
      }
      cur = { number: Number(m[1]), text: m[2], expect: null, raw: line };
      continue;
    }
    const ex = line.match(/^\s*expect:\s*(.+)$/);
    if (ex && cur) {
      cur.expect = ex[1];
      cur.raw += `\n${line}`;
    }
  }
  if (cur) {
    steps.push(cur);
  }
  return steps;
}

/* ---- boot dance (matches Phase 0's bash) ------------------------------ */

async function bootApp(): Promise<void> {
  log(`boot: platform=${platform.name}`);
  log("boot: closing stale session");
  adCli.closeSession();

  log("boot: locating app bundle");
  const bundle = locateBundle(platform);
  if (!bundle) {
    fail(
      `no app bundle (*${platform.appBundleSuffix}) found under ${platform.appBundleDir} — build step likely failed`,
    );
  }
  log(`boot: installing ${bundle}`);
  platform.install(bundle);

  log("boot: setupNetworking");
  platform.setupNetworking();

  platform.preBootHardening();

  log("boot: starting Metro");
  startMetro(path.join(ARTIFACTS_DIR, "metro.log"));

  await waitForMetro();

  log("boot: agent-device open --relaunch");
  platform.launch();

  /*
   * Bounded wait for the SignIn UI to hydrate. The LLM can technically
   * poll for it itself in step 1, but on slow runners that would burn
   * LLM budget on what's effectively boot-blocking emulator wait time.
   * We dump a probe snapshot every 30s during the wait so post-mortem
   * can see *what* the app was showing if the wait times out — the
   * first run of this workflow had no such artifacts and the failure
   * was undebuggable from the upload.
   */
  log("boot: waiting for SignIn UI");
  const start = Date.now();
  let probeIdx = 0;
  let lastProbeAt = 0;
  while (Date.now() - start < SIGNIN_LOAD_TIMEOUT_MS) {
    let snap;
    try {
      snap = adCli.snapshot();
    } catch (e) {
      /*
       * Don't let a single transient snapshot timeout kill the wait —
       * the emulator may be under heavy load and the next poll will
       * probably succeed.
       */
      log(
        `boot: snapshot threw (${(e as Error).message.slice(0, 80)}); retrying`,
      );
      await sleep(2_000);
      continue;
    }
    if (
      snap.nodes.some((n) => n.text?.toLowerCase().includes("phone or email"))
    ) {
      log(
        `boot: SignIn ready after ${Math.round((Date.now() - start) / 1000)}s`,
      );
      return;
    }
    /*
     * Blocking-dialog recovery. Platform-specific detection +
     * dismissal hides behind `tryDismissBlockingDialog`. Android:
     * Pixel Launcher ANR dialog (Close app / Wait). iOS (PR B):
     * system permission alerts. Either way, dismissed → force-
     * relaunch the app so we don't poll against a half-initialised
     * activity stuck behind the dismissed dialog.
     */
    if (platform.tryDismissBlockingDialog(snap)) {
      log("boot: blocking dialog dismissed + app force-relaunched");
      /* Give the process a moment to come back up before re-snapshotting. */
      await sleep(3_000);
      continue;
    }
    if (Date.now() - lastProbeAt >= BOOT_PROBE_INTERVAL_MS) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      fs.writeFileSync(
        path.join(
          ARTIFACTS_DIR,
          `boot-probe-${String(probeIdx).padStart(2, "0")}-t${elapsed}s.txt`,
        ),
        snap.raw,
      );
      probeIdx++;
      lastProbeAt = Date.now();
    }
    await sleep(6_000);
  }
  /*
   * Capture as much state as we can BEFORE failing so a re-run isn't
   * required to debug. The cleanup trap will still write logcat after.
   */
  try {
    const snap = adCli.snapshot();
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, "boot-timeout-snapshot.txt"),
      snap.raw,
    );
    const app = adCli.appstate();
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, "boot-timeout-appstate.txt"),
      app.raw,
    );
    adCli.screenshotBase64(path.join(ARTIFACTS_DIR, "boot-timeout.png"));
  } catch (e) {
    log(`boot: timeout-diagnostics capture failed: ${(e as Error).message}`);
  }
  fail(`SignIn UI not ready within ${SIGNIN_LOAD_TIMEOUT_MS / 1000}s`);
}

async function waitForMetro(): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < METRO_READY_TIMEOUT_MS) {
    try {
      const out = execFileSync(
        "curl",
        ["-sf", "http://localhost:8081/status"],
        { encoding: "utf8" },
      );
      if (out.includes("packager-status:running")) {
        log(
          `boot: Metro ready after ${Math.round((Date.now() - start) / 1000)}s`,
        );
        return;
      }
    } catch {
      /* Metro not up yet */
    }
    await sleep(2_000);
  }
  fail(
    `Metro did not reach packager-status:running within ${METRO_READY_TIMEOUT_MS / 1000}s`,
  );
}

/* ---- per-step orchestration ------------------------------------------- */

type StepCtx = {
  committed: CacheV1;
  testCaseHash: string;
  llm: AnthropicClient | null;
  recorded: CacheV1;
  stats: {
    onCacheHit: () => void;
    onLLMRun: () => void;
    onBashRun: () => void;
  };
};

async function executeStep(
  step: Step,
  ctx: StepCtx,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const preSnap = adCli.snapshot();
  const preSig = snapshotSignature(preSnap);
  const stepKey = `step ${step.number}`;
  log(`::group::${stepKey} — ${step.text}`);

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, `step-${step.number}-pre.txt`),
    preSnap.raw,
  );

  const cached = cache.lookup(ctx.committed, step.number, preSig);
  if (cached) {
    log(`${stepKey}: cache hit (pre_sig=${preSig})`);
    const replay = await replayCachedActions(cached.actions);
    if (replay.ok) {
      const post = await verifyPostState(step, cached.postSignature);
      if (post.ok) {
        ctx.stats.onCacheHit();
        ctx.recorded.steps.push(cached);
        fs.writeFileSync(
          path.join(ARTIFACTS_DIR, `step-${step.number}-post.txt`),
          post.snap.raw,
        );
        log(`::endgroup::`);
        return { ok: true };
      }
      log(`${stepKey}: cache drift — ${post.reason}; falling through to LLM`);
    } else {
      log(
        `${stepKey}: replay failed — ${replay.reason}; falling through to LLM`,
      );
    }
  }

  let actions: ExecutedAction[] = [];
  if (ctx.llm) {
    try {
      const llmResult = await runLLMStep(step, ctx.llm);
      if (!llmResult.ok) {
        log(
          `${stepKey}: LLM gave up — ${llmResult.reason}; trying bash fallback`,
        );
      } else {
        ctx.stats.onLLMRun();
        actions = llmResult.actions;
      }
    } catch (e) {
      if (e instanceof TokenBudgetExceededError) {
        return { ok: false, reason: e.message };
      }
      log(
        `${stepKey}: LLM call failed (${(e as Error).message}); trying bash fallback`,
      );
    }
  }

  if (!actions.length) {
    const bashResult = await runBashFallback(step);
    if (!bashResult.ok) {
      log(`::endgroup::`);
      return { ok: false, reason: bashResult.reason };
    }
    ctx.stats.onBashRun();
    actions = bashResult.actions;
    /*
     * Settle gap: agent-device fill returns once it has dispatched
     * the typing command, but the on-device EditText needs a beat for
     * React Native's onChange to fire and the accessibility tree to
     * re-publish the new text. Without this, verifyPostState below
     * takes a snapshot before the typed text has propagated and the
     * expect predicate fails on what's transient lag, not a real
     * problem.
     */
    await sleep(500);
  }

  const post = await verifyPostState(step, null);
  if (!post.ok) {
    log(`::endgroup::`);
    return { ok: false, reason: post.reason };
  }
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, `step-${step.number}-post.txt`),
    post.snap.raw,
  );

  ctx.recorded.steps.push({
    stepNumber: step.number,
    stepTextHash: cache.hashText(step.text),
    preSignature: preSig,
    postSignature: snapshotSignature(post.snap),
    actions: actions.map(stripExecutedRef),
    expect: step.expect,
    recordedAt: new Date().toISOString(),
    runId: process.env.GITHUB_RUN_ID ?? "local",
  });
  log(`::endgroup::`);
  return { ok: true };
}

function stripExecutedRef(a: ExecutedAction): CachedAction {
  const { ref, ...rest } = a as ExecutedAction & { ref?: string };
  return rest;
}

async function verifyPostState(
  step: Step,
  expectedSignature: string | null,
): Promise<{ ok: true; snap: Snapshot } | { ok: false; reason: string }> {
  const snap = adCli.snapshot();
  const app = adCli.appstate();

  /*
   * Expect (when declared) is the source of truth: it's a deterministic
   * predicate over the live UI, while the post-signature is a structural
   * hash that can drift on cosmetic re-renders, animation timing, or
   * node-ordering changes that don't affect what the user actually sees.
   * If expect passes, the step succeeded — drift becomes advisory.
   */
  if (step.expect) {
    const ev = evaluateExpect(step.expect, snap, app);
    if (!ev.ok) {
      return { ok: false, reason: `expect failed: ${ev.reason}` };
    }
    if (expectedSignature && snapshotSignature(snap) !== expectedSignature) {
      log(
        `::warning::post-signature drift but expect passed (recorded ${expectedSignature}, observed ${snapshotSignature(snap)}) — accepting`,
      );
    }
    return { ok: true, snap };
  }

  /*
   * No expect declared — fall back to signature equality so a cache-hit
   * path still has *some* post-state check.
   */
  if (expectedSignature && snapshotSignature(snap) !== expectedSignature) {
    return {
      ok: false,
      reason: `post-state signature drift (recorded ${expectedSignature}, observed ${snapshotSignature(snap)})`,
    };
  }
  return { ok: true, snap };
}

/* ---- cache replay ----------------------------------------------------- */

async function replayCachedActions(
  actions: CachedAction[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  for (const action of actions) {
    const ok = await dispatchCachedAction(action);
    if (!ok.ok) {
      return ok;
    }
    /*
     * Tiny settle gap — even on warm runners, fill→press in
     * immediate succession occasionally lands the press before
     * React has propagated the fill.
     */
    await sleep(150);
  }
  return { ok: true };
}

async function dispatchCachedAction(
  action: CachedAction,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (action.tool === "wait") {
    await sleep(action.ms);
    return { ok: true };
  }
  if (action.tool === "wait_for") {
    return await runWaitFor(action.predicate, action.timeoutMs);
  }
  if (action.tool === "back") {
    platform.back();
    return { ok: true };
  }
  if (action.tool === "dismiss_keyboard") {
    platform.dismissKeyboard();
    return { ok: true };
  }
  const snap = adCli.snapshot();
  const ref = locatorToRef(snap, action.locator);
  if (!ref) {
    return {
      ok: false,
      reason: `cached locator did not resolve: ${JSON.stringify(action.locator)}`,
    };
  }
  if (action.tool === "fill") {
    adCli.fill(ref, action.text);
    return { ok: true };
  }
  if (action.tool === "press") {
    adCli.press(ref);
    return { ok: true };
  }
  return {
    ok: false,
    reason: `unknown cached tool: ${(action as { tool: string }).tool}`,
  };
}

async function runWaitFor(
  predicate: string,
  timeoutMs: number,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const snap = adCli.snapshot();
    const app = adCli.appstate();
    const ev = evaluateExpect(predicate, snap, app);
    if (ev.ok) {
      return { ok: true };
    }
    await sleep(250);
  }
  return {
    ok: false,
    reason: `wait_for timed out after ${timeoutMs}ms (predicate: ${predicate})`,
  };
}

/* ---- LLM step --------------------------------------------------------- */

const SYSTEM_PROMPT = [
  "You are an autonomous mobile UI test runner driving the Expensify Android app via the agent-device CLI.",
  "You receive: the current step description in plain English, an accessibility snapshot of the live UI, and a history of your tool calls within this step.",
  "",
  "Snapshot format: a JSON array of `{ref, kind, text, editable, enabled, scrollable}` nodes. Each ref is a stable handle for that node within this snapshot only — re-snapshot before reusing refs from a prior turn.",
  "",
  "Rules:",
  "- Never invent a ref. Always pick refs from the most recent snapshot's `nodes` array.",
  "- After any state-changing action (fill, press, back, dismiss_keyboard, wait), call snapshot to refresh before asserting.",
  "- Use `assert` to prove a step succeeded — `step_complete` without an `assert` first is suspicious.",
  "- Prefer `wait_for(predicate)` over `wait(ms)`. The bare wait is a last resort; the runner logs a warning each time it is used.",
  "- Treat label text as advisory; it may be localized. Match by intent and element kind.",
  "- If after 2-3 unique attempts you cannot make progress, call `step_failed` with a precise reason.",
].join("\n");

const TOOLS: AnthropicTool[] = [
  {
    name: "snapshot",
    description:
      "Capture a fresh accessibility tree. Returns {nodes: [...], node_count: number}. Call this after any state-changing action and before using a ref from a previous turn.",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "screenshot",
    description:
      "Capture a PNG screenshot. Rate-limited to 2 calls per run; the runner may auto-attach a screenshot when a snapshot returns 0 nodes. Use this only when the snapshot is genuinely empty or when you've addressed phantom refs twice.",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "find",
    description:
      "Search the most recent snapshot for nodes whose `text` contains the given substring (case-insensitive). Side-effect-free.",
    input_schema: {
      type: "object",
      properties: { needle: { type: "string" } },
      required: ["needle"],
      additionalProperties: false,
    },
  },
  {
    name: "fill",
    description: "Type text into the editable text-field at the given ref.",
    input_schema: {
      type: "object",
      properties: { ref: { type: "string" }, text: { type: "string" } },
      required: ["ref", "text"],
      additionalProperties: false,
    },
  },
  {
    name: "press",
    description: "Tap the pressable element at the given ref.",
    input_schema: {
      type: "object",
      properties: { ref: { type: "string" } },
      required: ["ref"],
      additionalProperties: false,
    },
  },
  {
    name: "wait_for",
    description:
      'Poll snapshots until `predicate` is satisfied or `timeout_ms` elapses. Predicates: snapshot.contains_text("..."), snapshot.field_with_text("...").exists, appstate.foreground == "...".',
    input_schema: {
      type: "object",
      properties: {
        predicate: { type: "string" },
        timeout_ms: { type: "integer", maximum: 10_000 },
      },
      required: ["predicate"],
      additionalProperties: false,
    },
  },
  {
    name: "wait",
    description:
      "Sleep for the given number of milliseconds (max 2000). Last resort — prefer wait_for. The runner logs a warning each call.",
    input_schema: {
      type: "object",
      properties: { ms: { type: "integer", minimum: 1, maximum: 2_000 } },
      required: ["ms"],
      additionalProperties: false,
    },
  },
  {
    name: "back",
    description:
      "Press Android back. Use to recover from an unintended screen.",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "dismiss_keyboard",
    description: "Dismiss the soft keyboard.",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "assert",
    description:
      "Verify a postcondition. Returns {ok: bool, reason?: string}. Predicates as in wait_for.",
    input_schema: {
      type: "object",
      properties: { predicate: { type: "string" } },
      required: ["predicate"],
      additionalProperties: false,
    },
  },
  {
    name: "appstate",
    description: "Return {foreground_app, activity}.",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "step_complete",
    description:
      "Mark the current step as passed. Must include a brief rationale describing what was observed (mention the assert you ran).",
    input_schema: {
      type: "object",
      properties: { rationale: { type: "string" } },
      required: ["rationale"],
      additionalProperties: false,
    },
  },
  {
    name: "step_failed",
    description:
      "Mark the current step as failed. Use when 2-3 unique attempts have not produced progress, or when the screen does not match what the step expects.",
    input_schema: {
      type: "object",
      properties: { reason: { type: "string" } },
      required: ["reason"],
      additionalProperties: false,
    },
  },
];

async function runLLMStep(
  step: Step,
  llm: AnthropicClient,
): Promise<
  { ok: true; actions: ExecutedAction[] } | { ok: false; reason: string }
> {
  const startedAt = Date.now();
  let snap = adCli.snapshot();
  let app = adCli.appstate();
  let stateChanging = 0;
  let phantomStreak = 0;
  let attachScreenshotNext = false;
  let screenshotsUsed = 0;
  const seen = new Set<string>();
  const messages: AnthropicMessage[] = [];
  const executed: ExecutedAction[] = [];

  while (
    Date.now() - startedAt < STEP_WALL_CLOCK_BUDGET_MS &&
    stateChanging <= MAX_STATE_CHANGING_ACTIONS
  ) {
    if (snap.nodeCount === 0 && screenshotsUsed < SCREENSHOT_BUDGET_PER_RUN) {
      attachScreenshotNext = true;
    }

    const userBlocks: ContentBlock[] = [];
    if (attachScreenshotNext && screenshotsUsed < SCREENSHOT_BUDGET_PER_RUN) {
      const png = takeScreenshot(
        `step-${step.number}-shot-${screenshotsUsed}.png`,
      );
      screenshotsUsed++;
      attachScreenshotNext = false;
      userBlocks.push({
        type: "image",
        source: { type: "base64", media_type: "image/png", data: png },
      });
    }
    userBlocks.push({
      type: "text",
      text: buildUserText(step, snap, app, executed),
    });
    messages.push({ role: "user", content: userBlocks });

    const response = await llm.call({
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });
    const assistantContent = response.content as AnthropicMessage["content"];
    messages.push({ role: "assistant", content: assistantContent });

    const toolUses = assistantContent.filter(
      (
        b,
      ): b is Extract<
        (typeof assistantContent)[number],
        { type: "tool_use" }
      > => b.type === "tool_use",
    );
    if (!toolUses.length) {
      return { ok: false, reason: "LLM returned no tool calls" };
    }

    const toolResults: ToolResultBlock[] = [];
    for (const tu of toolUses) {
      const sigKey = `${tu.name}:${JSON.stringify(tu.input)}:${snapshotSignature(snap)}`;
      if (seen.has(sigKey)) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content:
            "You already performed this exact action against this exact UI state and it produced no observable change. Try a different approach or call step_failed.",
          is_error: true,
        });
        continue;
      }
      seen.add(sigKey);

      try {
        const out = await dispatchTool(tu.name, tu.input, {
          snap,
          app,
          onSnap: (s) => {
            snap = s;
          },
          onApp: (a) => {
            app = a;
          },
          executed,
          stepNumber: step.number,
          onPhantom: () => {
            phantomStreak++;
            if (
              phantomStreak >= 2 &&
              screenshotsUsed < SCREENSHOT_BUDGET_PER_RUN
            ) {
              attachScreenshotNext = true;
            }
          },
          resetPhantom: () => {
            phantomStreak = 0;
          },
        });
        if (isStateChangingTool(tu.name)) {
          stateChanging++;
        }
        if (out.terminal === "complete") {
          return { ok: true, actions: executed };
        }
        if (out.terminal === "failed") {
          return {
            ok: false,
            reason: out.reason ?? "step_failed without reason",
          };
        }
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: out.content,
          is_error: out.isError,
        });
      } catch (e) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: `tool error: ${(e as Error).message}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });

    /*
     * Refresh snap + appstate after every batch of tool calls that
     * changed device state. Without this the LLM keeps seeing the
     * pre-step snapshot even after its fill/press took effect, so
     * identical fills get caught by the seen-hash dedup and the LLM
     * burns its budget retrying actions it already performed.
     * dispatchTool's snapshot/wait_for/back/dismiss callbacks already
     * refresh; fill and press do not.
     */
    if (
      toolUses.some(
        (tu) => tu.name === "fill" || tu.name === "press" || tu.name === "wait",
      )
    ) {
      try {
        snap = adCli.snapshot();
        app = adCli.appstate();
      } catch (e) {
        /* Transient — next loop iteration will retry implicitly. */
        log(
          `runLLMStep: post-action snap refresh threw (${(e as Error).message.slice(0, 80)}); continuing with stale snap`,
        );
      }
    }
  }

  return {
    ok: false,
    reason: "wall-clock or distinct-action budget exhausted",
  };
}

function isStateChangingTool(name: string): boolean {
  return [
    "fill",
    "press",
    "back",
    "dismiss_keyboard",
    "wait",
    "wait_for",
  ].includes(name);
}

function buildUserText(
  step: Step,
  snap: Snapshot,
  app: AppState,
  history: ExecutedAction[],
): string {
  const lines: string[] = [];
  lines.push(`Current step: ${step.number}. ${step.text}`);
  if (step.expect) {
    lines.push(
      `Postcondition the runner will check (NOT for you to call directly): ${step.expect}`,
    );
  }
  if (history.length) {
    const tail = history.slice(-3).map((h) => describeExecutedAction(h));
    lines.push(`Recent actions you took: ${tail.join("; ")}`);
  }
  lines.push(
    `appstate.foreground=${app.foregroundApp ?? "(unknown)"} activity=${app.activity ?? "(unknown)"}`,
  );
  lines.push(`snapshot.node_count=${snap.nodeCount}`);
  lines.push("snapshot.nodes:");
  lines.push(JSON.stringify(snap.nodes.map(scrubNodeForPrompt), null, 0));
  return lines.join("\n");
}

function scrubNodeForPrompt(
  n: Snapshot["nodes"][number],
): Record<string, unknown> {
  const text = n.text
    ? sanitizeText(n.text).slice(0, TEXT_LENGTH_CAP)
    : undefined;
  return {
    ref: n.ref,
    kind: n.kind,
    text,
    editable: n.editable,
    enabled: n.enabled,
    scrollable: n.scrollable,
  };
}

function sanitizeText(s: string): string {
  let out = "";
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if (c >= 0x20 || c === 0x09 || c === 0x0a) {
      out += ch;
    }
  }
  return out;
}

function describeExecutedAction(a: ExecutedAction): string {
  if (a.tool === "fill") {
    return `fill(${JSON.stringify(a.locator)}, "${a.text.slice(0, 30)}…")`;
  }
  if (a.tool === "press") {
    return `press(${JSON.stringify(a.locator)})`;
  }
  if (a.tool === "wait_for") {
    return `wait_for(${a.predicate}, ${a.timeoutMs}ms)`;
  }
  if (a.tool === "wait") {
    return `wait(${a.ms}ms)`;
  }
  return a.tool;
}

/* ---- LLM tool dispatch ------------------------------------------------ */

type DispatchCtx = {
  snap: Snapshot;
  app: AppState;
  onSnap: (s: Snapshot) => void;
  onApp: (a: AppState) => void;
  executed: ExecutedAction[];
  stepNumber: number;
  onPhantom: () => void;
  resetPhantom: () => void;
};

type DispatchResult = {
  content: string;
  isError?: boolean;
  terminal?: "complete" | "failed";
  reason?: string;
};

async function dispatchTool(
  name: string,
  input: Record<string, unknown>,
  ctx: DispatchCtx,
): Promise<DispatchResult> {
  switch (name) {
    case "snapshot": {
      const s = adCli.snapshot();
      ctx.onSnap(s);
      return {
        content: JSON.stringify({
          node_count: s.nodeCount,
          nodes: s.nodes.map(scrubNodeForPrompt),
        }),
      };
    }
    case "screenshot": {
      const file = `step-${ctx.stepNumber}-llm-shot.png`;
      const data = takeScreenshot(file);
      return {
        content: `screenshot saved at ${file} (${data.length} bytes base64). Re-snapshot to keep working with refs.`,
      };
    }
    case "find": {
      const needle = String(input.needle ?? "");
      const matches = adCli.findInSnapshot(ctx.snap, needle).map((n) => ({
        ref: n.ref,
        kind: n.kind,
        text: n.text,
        editable: n.editable,
      }));
      return { content: JSON.stringify({ matches, count: matches.length }) };
    }
    case "fill": {
      const ref = String(input.ref ?? "");
      const text = String(input.text ?? "");
      const node = ctx.snap.nodes.find((n) => n.ref === ref);
      if (!node) {
        ctx.onPhantom();
        if (DEBUG_LLM) {
          log(
            `::debug::dispatch.fill phantom ref=${ref} text="${text.slice(0, 30)}…"`,
          );
        }
        return {
          content: `phantom ref ${ref} not in current snapshot`,
          isError: true,
        };
      }
      ctx.resetPhantom();
      try {
        adCli.fill(ref, text);
      } catch (e) {
        if (DEBUG_LLM) {
          log(
            `::debug::dispatch.fill THREW ref=${ref} text="${text.slice(0, 30)}…" err=${(e as Error).message.slice(0, 100)}`,
          );
        }
        throw e;
      }
      const loc = refToLocator(ctx.snap, ref);
      if (DEBUG_LLM) {
        log(
          `::debug::dispatch.fill ok ref=${ref} kind=${node.kind} loc=${JSON.stringify(loc)} text="${text.slice(0, 30)}…" executed_len_after=${ctx.executed.length + (loc ? 1 : 0)}`,
        );
      }
      if (loc) {
        ctx.executed.push({ tool: "fill", locator: loc, text, ref });
      }
      return { content: `filled ${ref}` };
    }
    case "press": {
      const ref = String(input.ref ?? "");
      const node = ctx.snap.nodes.find((n) => n.ref === ref);
      if (!node) {
        ctx.onPhantom();
        if (DEBUG_LLM) {
          log(`::debug::dispatch.press phantom ref=${ref}`);
        }
        return {
          content: `phantom ref ${ref} not in current snapshot`,
          isError: true,
        };
      }
      ctx.resetPhantom();
      try {
        adCli.press(ref);
      } catch (e) {
        if (DEBUG_LLM) {
          log(
            `::debug::dispatch.press THREW ref=${ref} err=${(e as Error).message.slice(0, 100)}`,
          );
        }
        throw e;
      }
      const loc = refToLocator(ctx.snap, ref);
      if (DEBUG_LLM) {
        log(
          `::debug::dispatch.press ok ref=${ref} kind=${node.kind} loc=${JSON.stringify(loc)} executed_len_after=${ctx.executed.length + (loc ? 1 : 0)}`,
        );
      }
      if (loc) {
        ctx.executed.push({ tool: "press", locator: loc, ref });
      }
      return { content: `pressed ${ref}` };
    }
    case "wait": {
      const ms = Math.min(2_000, Math.max(1, Number(input.ms ?? 0)));
      log(`::warning::LLM used wait(${ms}) — prefer wait_for`);
      await sleep(ms);
      ctx.executed.push({ tool: "wait", ms });
      return { content: `slept ${ms}ms` };
    }
    case "wait_for": {
      const predicate = String(input.predicate ?? "");
      const timeoutMs = Math.min(
        10_000,
        Math.max(250, Number(input.timeout_ms ?? 5_000)),
      );
      const r = await runWaitFor(predicate, timeoutMs);
      ctx.executed.push({ tool: "wait_for", predicate, timeoutMs });
      ctx.onSnap(adCli.snapshot());
      ctx.onApp(adCli.appstate());
      return {
        content: r.ok
          ? "predicate satisfied"
          : `wait_for timed out: ${r.reason}`,
        isError: !r.ok,
      };
    }
    case "back":
      platform.back();
      ctx.executed.push({ tool: "back" });
      ctx.onSnap(adCli.snapshot());
      return { content: "back pressed" };
    case "dismiss_keyboard":
      platform.dismissKeyboard();
      ctx.executed.push({ tool: "dismiss_keyboard" });
      ctx.onSnap(adCli.snapshot());
      return { content: "keyboard dismissed" };
    case "assert": {
      const predicate = String(input.predicate ?? "");
      const ev = evaluateExpect(predicate, ctx.snap, ctx.app);
      return { content: JSON.stringify(ev), isError: !ev.ok };
    }
    case "appstate": {
      const a = adCli.appstate();
      ctx.onApp(a);
      return { content: JSON.stringify(a) };
    }
    case "step_complete":
      return { content: "step accepted by runner", terminal: "complete" };
    case "step_failed":
      return {
        content: "step rejected by LLM",
        terminal: "failed",
        reason: String(input.reason ?? "no reason given"),
      };
    default:
      return { content: `unknown tool: ${name}`, isError: true };
  }
}

function takeScreenshot(filename: string): string {
  const p = path.join(ARTIFACTS_DIR, filename);
  adCli.screenshotBase64(p);
  return fs.readFileSync(p).toString("base64");
}

/* ---- bash fallback ---------------------------------------------------- */

/*
 * Mirrors Phase 0's bash logic for the SignIn flow. Used when:
 *   - ANTHROPIC_API_KEY is missing
 *   - The Anthropic API exhausts retries with HTTP errors
 *   - The LLM gives up via step_failed (rare; mostly defensive)
 *
 * Only the SignIn-flow steps are covered. Adding a new test case
 * without LLM access requires extending this map. That's intentional:
 * the bash fallback is a safety net for known flows, not a generic
 * drop-in for the LLM.
 */

async function runBashFallback(
  step: Step,
): Promise<
  { ok: true; actions: ExecutedAction[] } | { ok: false; reason: string }
> {
  const text = step.text.toLowerCase();

  if (text.includes("wait") && text.includes("signin")) {
    /* Boot dance already gated on this; an instant pass is fine. */
    return { ok: true, actions: [] };
  }

  if (text.includes("enter") && text.includes("email")) {
    const m = step.text.match(/"([^"]+)"/);
    if (!m) {
      return {
        ok: false,
        reason: "bash fallback could not extract email from step text",
      };
    }
    const snap = adCli.snapshot();
    const field = snap.nodes.find(
      (n) =>
        n.editable &&
        (n.kind === "text-field" ||
          (n.text?.toLowerCase().includes("phone") ?? false)),
    );
    if (!field) {
      return {
        ok: false,
        reason: "bash fallback: no editable text-field for email entry",
      };
    }
    adCli.fill(field.ref, m[1]);
    const loc = refToLocator(snap, field.ref);
    return {
      ok: true,
      actions: loc ? [{ tool: "fill", locator: loc, text: m[1] }] : [],
    };
  }

  if (text.includes("press") && text.includes("continue")) {
    const snap = adCli.snapshot();
    const btn = snap.nodes.find(
      (n) => n.kind === "button" && n.text?.toLowerCase().includes("continue"),
    );
    if (!btn) {
      return { ok: false, reason: "bash fallback: no Continue button found" };
    }
    adCli.press(btn.ref);
    const loc = refToLocator(snap, btn.ref);
    return { ok: true, actions: loc ? [{ tool: "press", locator: loc }] : [] };
  }

  if (text.includes("magic")) {
    const start = Date.now();
    while (Date.now() - start < 60_000) {
      const snap = adCli.snapshot();
      if (
        snap.nodes.some((n) => n.text?.toLowerCase().includes("magic code"))
      ) {
        return {
          ok: true,
          actions: [
            {
              tool: "wait_for",
              predicate: 'snapshot.contains_text("Magic code")',
              timeoutMs: 60_000,
            },
          ],
        };
      }
      await sleep(2_000);
    }
    return {
      ok: false,
      reason: "bash fallback: magic-code screen never appeared",
    };
  }

  return {
    ok: false,
    reason: `bash fallback has no recipe for step text: ${step.text}`,
  };
}

/* ---- cleanup ---------------------------------------------------------- */

let cleanedUp = false;

function registerCleanup(): void {
  const handler = (): void => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    platform.dumpLogsToFile(path.join(ARTIFACTS_DIR, "logcat.txt"));
    adCli.closeSession();
    for (const pid of backgroundPids) {
      try {
        process.kill(-pid, "SIGTERM");
      } catch {
        /* already gone */
      }
    }
  };
  process.on("exit", handler);
  process.on("SIGINT", () => {
    handler();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    handler();
    process.exit(143);
  });
}

/* ---- helpers ---------------------------------------------------------- */

function deriveCachePath(testCasePath: string): string {
  const base = path.basename(testCasePath, path.extname(testCasePath));
  return path.join("tests", "smoke", "cache", `${base}.json`);
}

function log(msg: string): void {
  process.stdout.write(`${msg}\n`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function fail(reason: string): never {
  log(`::error::${reason}`);
  process.exit(1);
}

main().catch((e: unknown) => {
  if (e instanceof AnthropicCallFailedError) {
    fail(`anthropic API failed: ${e.status} ${e.body.slice(0, 200)}`);
  }
  fail(`runner crashed: ${(e as Error).stack ?? String(e)}`);
});
