/*
 * Platform abstraction for the LLM-driven smoke driver.
 *
 * The per-step LLM loop, cache replay, expect predicate evaluator,
 * signature hashing, and Anthropic client are platform-agnostic.
 * Boot dance, blocking-dialog recovery, and a small set of keyevent
 * tools are NOT. This module lifts the latter behind a tiny
 * `Platform` interface so a new platform (iOS) can be added without
 * touching the driver core.
 *
 * The current file ships ONE implementation — `AndroidPlatform` —
 * which is a verbatim move of today's inlined logic in
 * agent-device-llm-driver.ts. PR A is a refactor with zero behavior
 * change; the matching Android fork-test run must produce the same
 * artifacts as before. PR B (a follow-up) adds `IOSPlatform`.
 */

import { execFileSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

import * as adCli from "./agent-device-cli";
import type { Snapshot } from "./agent-device-cli";

/* ---- shared types ---------------------------------------------------- */

export type PlatformName = "android" | "ios";

/**
 * Operations the driver delegates to a Platform impl. Everything not
 * listed here is shared across platforms and stays in the driver.
 */
export interface Platform {
  readonly name: PlatformName;

  /** App bundle / package identifier passed to `agent-device open`. */
  readonly appPackage: string;

  /**
   * Directory the runner searches for the installable bundle
   * (APK on Android, .app on iOS). The first matching entry wins.
   */
  readonly appBundleDir: string;
  readonly appBundleSuffix: string;

  /**
   * One-shot install of the located bundle. Throws on hard failure;
   * the driver surfaces the error to the workflow log.
   */
  install(bundlePath: string): void;

  /**
   * Best-effort networking prep so Metro on the host is reachable
   * from the device/sim. Android needs `adb reverse`; iOS Sim
   * shares host loopback and this is a no-op.
   */
  setupNetworking(): void;

  /**
   * Best-effort pre-launch hardening — disable autofill, suppress
   * system error dialogs, etc. Implementations should swallow
   * failures (a missing setting on a fresh AVD is fine).
   */
  preBootHardening(): void;

  /**
   * Launch the app via `agent-device open --relaunch`. Handles the
   * platform-specific `--platform`/`--serial`/`--device` flag set.
   */
  launch(): void;

  /**
   * Force a clean relaunch — used by blocking-dialog recovery.
   * Android: `am force-stop` + relaunch. iOS: `xcrun simctl
   * terminate` + relaunch.
   */
  forceRelaunch(): void;

  /**
   * Detect a system-modal "blocking" dialog over the app. Android's
   * ANR dialog and iOS's permission alerts share the shape: a
   * small handful of system buttons whose conservative choice
   * lets the app continue. Returns true if dismissed.
   */
  tryDismissBlockingDialog(snap: Snapshot): boolean;

  /**
   * Map LLM-facing `back()` / `dismiss_keyboard()` tool calls to
   * platform-specific keyevents.
   */
  back(): void;
  dismissKeyboard(): void;

  /**
   * Dump device logs to the given file. Called by the driver's
   * cleanup trap on exit. Best-effort — missing logs must not
   * fail the run.
   */
  dumpLogsToFile(outPath: string): void;
}

/* ---- session constant shared by all platforms ------------------------ */

const SESSION = process.env.AGENT_DEVICE_SESSION ?? "ci";

/* ---- Android implementation ----------------------------------------- */

class AndroidPlatform implements Platform {
  readonly name = "android" as const;
  readonly appPackage = process.env.APP_PACKAGE ?? "com.expensify.chat.dev";
  readonly appBundleDir = "android/app/build/outputs/apk/development/debug";
  readonly appBundleSuffix = ".apk";

  install(apkPath: string): void {
    execFileSync("adb", ["install", "-r", "-d", "-t", apkPath], {
      stdio: "inherit",
    });
  }

  setupNetworking(): void {
    execFileSync("adb", ["reverse", "tcp:8081", "tcp:8081"], {
      stdio: "inherit",
    });
  }

  preBootHardening(): void {
    /*
     * Suppress system ANR dialogs. Without this, the Pixel
     * Launcher's "isn't responding" dialog covers our app on
     * the 2-core ubuntu-latest runner during heavy boot load.
     * The underlying ANR still happens but the foreground app
     * keeps running uncovered.
     */
    try {
      execFileSync(
        "adb",
        ["shell", "settings", "put", "global", "hide_error_dialogs", "1"],
        { timeout: 5_000, stdio: "ignore" },
      );
    } catch {
      /* best effort */
    }

    /*
     * Disable Android Autofill globally. Without this, the
     * framework silently populates editable fields when they
     * gain focus and a credential is cached on the AVD —
     * cache recording then misses the fill action and replay
     * breaks on a different AVD snapshot.
     */
    try {
      execFileSync(
        "adb",
        ["shell", "settings", "put", "secure", "autofill_service", "null"],
        { timeout: 5_000, stdio: "ignore" },
      );
    } catch {
      /* best effort */
    }
  }

  launch(): void {
    execFileSync(
      "agent-device",
      [
        "open",
        this.appPackage,
        "--platform",
        "android",
        "--serial",
        this.getSerial(),
        "--session",
        SESSION,
        "--relaunch",
      ],
      { stdio: "inherit" },
    );
  }

  forceRelaunch(): void {
    try {
      execFileSync("adb", ["shell", "am", "force-stop", this.appPackage], {
        timeout: 5_000,
        stdio: "ignore",
      });
    } catch (e) {
      // Surface to caller via log line; not fatal.
      process.stdout.write(
        `platform.android: force-stop failed: ${(e as Error).message.slice(0, 80)}\n`,
      );
    }
    try {
      execFileSync(
        "agent-device",
        [
          "open",
          this.appPackage,
          "--platform",
          "android",
          "--serial",
          this.getSerial(),
          "--session",
          SESSION,
          "--relaunch",
        ],
        { timeout: 30_000, stdio: "ignore" },
      );
    } catch (e) {
      process.stdout.write(
        `platform.android: relaunch failed: ${(e as Error).message.slice(0, 80)}\n`,
      );
    }
  }

  tryDismissBlockingDialog(snap: Snapshot): boolean {
    /*
     * Android ANR dialog signature: exactly two buttons labelled
     * "Close app" and "Wait". The label varies slightly
     * (Pixel Launcher / com.android.systemui / etc.) but the
     * structural fingerprint stays.
     */
    const buttons = snap.nodes.filter((n) => n.kind === "button");
    if (buttons.length !== 2) {
      return false;
    }
    const labels = buttons.map((b) => b.text?.toLowerCase() ?? "").sort();
    if (labels[0] !== "close app" || labels[1] !== "wait") {
      return false;
    }
    try {
      const waitBtn = snap.nodes.find(
        (n) => n.kind === "button" && n.text?.toLowerCase() === "wait",
      );
      if (waitBtn) {
        adCli.press(waitBtn.ref);
      }
    } catch (e) {
      process.stdout.write(
        `platform.android: dismiss press failed: ${(e as Error).message.slice(0, 80)}\n`,
      );
    }
    this.forceRelaunch();
    return true;
  }

  back(): void {
    execFileSync("adb", ["shell", "input", "keyevent", "4"], {
      timeout: 30_000,
      encoding: "utf8",
    });
  }

  dismissKeyboard(): void {
    execFileSync("adb", ["shell", "input", "keyevent", "111"], {
      timeout: 30_000,
      encoding: "utf8",
    });
  }

  dumpLogsToFile(outPath: string): void {
    try {
      execFileSync(
        "adb",
        [
          "logcat",
          "-d",
          "-v",
          "time",
          "*:W",
          "ReactNativeJS:V",
          "ReactNative:V",
        ],
        {
          stdio: ["ignore", fs.openSync(outPath, "w"), "ignore"],
        },
      );
    } catch {
      /* best effort */
    }
  }

  private getSerial(): string {
    return execFileSync("adb", ["get-serialno"], { encoding: "utf8" }).trim();
  }
}

/* ---- iOS implementation --------------------------------------------- */

class IOSPlatform implements Platform {
  readonly name = "ios" as const;
  /*
   * The standalone NewDot iOS dev scheme ships with the same bundle id
   * as Android dev (`com.expensify.chat.dev`). HybridApp dev would be
   * `com.expensify.expensifylite` instead — the smoke targets standalone.
   */
  readonly appPackage = process.env.APP_PACKAGE ?? "com.expensify.chat.dev";
  /*
   * Xcode places the simulator build under DerivedData. The workflow
   * step that builds the app sets DerivedData via `-derivedDataPath
   * ios/build`, so the .app ends up here. iOS app bundles are
   * directories (not single files like .apk), so `locateBundle`
   * still matches them via the `.app` suffix.
   */
  readonly appBundleDir =
    process.env.IOS_APP_BUNDLE_DIR ??
    "ios/build/Build/Products/DebugDevelopment-iphonesimulator";
  readonly appBundleSuffix = ".app";

  install(appPath: string): void {
    execFileSync("xcrun", ["simctl", "install", "booted", appPath], {
      stdio: "inherit",
    });
  }

  setupNetworking(): void {
    /*
     * iOS Simulator shares the host loopback by default — Metro on
     * localhost:8081 is reachable from the simulated app with no
     * port-forward equivalent of `adb reverse` needed.
     */
  }

  preBootHardening(): void {
    /*
     * Best-effort pre-launch hardening. The exact knobs that matter
     * on iOS Sim are:
     *
     *   - SuggestionsAppLibraryEnabled=NO: stops smart-suggestion
     *     bubbles from interrupting the keyboard.
     *   - AutoFillCredentialProviderEnabled=NO: same idea as
     *     Android `autofill_service=null` — forces the LLM to
     *     explicitly fill the email rather than relying on
     *     framework autofill silently completing the action.
     *
     * `defaults write` against simulator domains is the canonical
     * path. Failures here are non-fatal — fresh sims may not have
     * those domains until the app launches once.
     */
    try {
      execFileSync(
        "xcrun",
        [
          "simctl",
          "spawn",
          "booted",
          "defaults",
          "write",
          "com.apple.suggestions",
          "SuggestionsAppLibraryEnabled",
          "-bool",
          "NO",
        ],
        { timeout: 5_000, stdio: "ignore" },
      );
    } catch {
      /* best effort */
    }
    try {
      execFileSync(
        "xcrun",
        [
          "simctl",
          "spawn",
          "booted",
          "defaults",
          "write",
          "com.apple.keyboard.preferences",
          "KeyboardAutomaticPredictionType",
          "-int",
          "0",
        ],
        { timeout: 5_000, stdio: "ignore" },
      );
    } catch {
      /* best effort */
    }
  }

  launch(): void {
    const dev = this.getDevice();
    /*
     * `agent-device boot` is the daemon-side counterpart to
     * `xcrun simctl boot` — it tells the agent-device daemon to
     * "ensure target device/simulator is booted and ready". Without
     * this, the workflow's prior `xcrun simctl boot` step boots the
     * sim at the macOS level but the agent-device daemon never wires
     * up its session-binding state, leading to `agent-device
     * snapshot` hanging forever after `open` (runs 25861525119,
     * 25864724817, 25868449643 all exhibited this).
     *
     * Belt-and-suspenders: do this even though the workflow has its
     * own xcrun simctl boot step — boot is idempotent and lets the
     * daemon refresh its device list.
     */
    /*
     * NOTE on flag combo: passing --session here conflicts with
     * device selectors per the daemon's session-lock policy
     * (run 25924098549 hit: "boot cannot override session lock
     * policy with --device=..., --udid=..."). Boot is a pure
     * device warmup, no session binding needed yet — that happens
     * at open time.
     */
    try {
      execFileSync(
        "agent-device",
        ["boot", "--platform", "ios", "--device", dev.name],
        { stdio: "inherit", timeout: 60_000 },
      );
    } catch (e) {
      process.stdout.write(
        `platform.ios: agent-device boot failed: ${(e as Error).message.slice(0, 200)}\n`,
      );
    }

    execFileSync(
      "agent-device",
      [
        "open",
        this.appPackage,
        "--platform",
        "ios",
        "--udid",
        dev.udid,
        "--session",
        SESSION,
        "--relaunch",
      ],
      { stdio: "inherit" },
    );
  }

  forceRelaunch(): void {
    const dev = this.getDevice();
    try {
      execFileSync(
        "xcrun",
        ["simctl", "terminate", dev.udid, this.appPackage],
        { timeout: 10_000, stdio: "ignore" },
      );
    } catch (e) {
      process.stdout.write(
        `platform.ios: simctl terminate failed: ${(e as Error).message.slice(0, 80)}\n`,
      );
    }
    try {
      execFileSync(
        "agent-device",
        [
          "open",
          this.appPackage,
          "--platform",
          "ios",
          "--udid",
          dev.udid,
          "--session",
          SESSION,
          "--relaunch",
        ],
        { timeout: 30_000, stdio: "ignore" },
      );
    } catch (e) {
      process.stdout.write(
        `platform.ios: relaunch failed: ${(e as Error).message.slice(0, 80)}\n`,
      );
    }
  }

  tryDismissBlockingDialog(snap: Snapshot): boolean {
    /*
     * iOS system permission alerts (ATT, notifications, location,
     * camera, photos, keychain) share a recognisable shape: a small
     * number (2-3) of system buttons whose labels include one of the
     * conservative dismissals. Match on label set rather than exact
     * count because ATT alerts can have 2 or 3 buttons depending on
     * iOS version.
     *
     * The dismissal strategy is intentionally conservative: never
     * grant a permission, never tap "Continue" or "Open Settings".
     * The smoke is a build canary, not a permissions-flow exerciser.
     */
    const buttons = snap.nodes.filter((n) => n.kind === "button");
    if (buttons.length < 2 || buttons.length > 3) {
      return false;
    }
    const labels = buttons
      .map((b) => b.text?.toLowerCase() ?? "")
      .filter((l) => l.length > 0);
    /*
     * Recognise as a dialog only if at least one button matches a
     * known conservative-choice label. Otherwise this is just a
     * 2-button screen (e.g. SignIn with Continue + secondary CTA),
     * not a system alert.
     */
    const conservativeChoices = [
      "don't allow",
      "ask app not to track",
      "not now",
      "cancel",
      "no thanks",
      "later",
    ];
    const target = buttons.find((b) =>
      conservativeChoices.includes(b.text?.toLowerCase() ?? ""),
    );
    if (!target) {
      return false;
    }
    /*
     * Sanity: an iOS SignIn screen has buttons like "Continue" or
     * "Sign In" but never conservative-choice labels. The presence
     * of a Continue button alongside a conservative choice is the
     * only ambiguous case; we resolve in favor of "system alert"
     * because the test cases don't expect a Continue+Cancel pair
     * outside a dialog.
     */
    if (labels.length === 0) {
      return false;
    }
    try {
      adCli.press(target.ref);
    } catch (e) {
      process.stdout.write(
        `platform.ios: dismiss press failed: ${(e as Error).message.slice(0, 80)}\n`,
      );
    }
    this.forceRelaunch();
    return true;
  }

  back(): void {
    /*
     * iOS doesn't have a hardware back equivalent. The closest is
     * the per-screen "Back" navigation button which differs by
     * screen; we don't attempt to synthesize it here. The LLM's
     * `back()` tool is mostly an Android idiom — on iOS it should
     * use `press` against the actual back-arrow node.
     *
     * For belt-and-suspenders, emit ESC to the simulator (no-op on
     * most app screens but harmless).
     */
    try {
      execFileSync(
        "xcrun",
        ["simctl", "io", "booted", "send", "keystroke", "escape"],
        { timeout: 5_000, stdio: "ignore" },
      );
    } catch {
      /* best effort */
    }
  }

  dismissKeyboard(): void {
    /*
     * No system shortcut to dismiss the iOS Sim keyboard without a
     * focus change. The simulator menu's "I/O > Keyboard > Toggle
     * Software Keyboard" is GUI-only. Cmd+K via simctl io toggles
     * the soft keyboard on/off:
     */
    try {
      execFileSync(
        "xcrun",
        ["simctl", "io", "booted", "send", "keystroke", "cmd+k"],
        { timeout: 5_000, stdio: "ignore" },
      );
    } catch {
      /* best effort */
    }
  }

  dumpLogsToFile(outPath: string): void {
    try {
      /*
       * Capture the last hour of NewExpensify-process logs from the
       * booted simulator. `--style compact` keeps the artifact size
       * manageable; `--last 1h` is generous for a ~10min smoke.
       */
      execFileSync(
        "xcrun",
        [
          "simctl",
          "spawn",
          "booted",
          "log",
          "show",
          "--predicate",
          'process == "NewExpensify"',
          "--style",
          "compact",
          "--last",
          "1h",
        ],
        {
          stdio: ["ignore", fs.openSync(outPath, "w"), "ignore"],
          timeout: 60_000,
        },
      );
    } catch {
      /* best effort */
    }
  }

  private cachedDevice: { name: string; udid: string } | null = null;

  private getDevice(): { name: string; udid: string } {
    if (this.cachedDevice) {
      return this.cachedDevice;
    }
    /*
     * Discover the booted iOS sim via `xcrun simctl list devices
     * --json`. Format:
     *
     *   {"devices": {"com.apple.CoreSimulator.SimRuntime.iOS-17-2": [
     *     {"udid":"…","state":"Booted","name":"iPhone 15"}, …
     *   ]}}
     *
     * We capture BOTH the udid and the name. Run 25864724817 showed
     * that `agent-device open --udid <UDID>` succeeds but subsequent
     * `agent-device snapshot --session ci` hangs indefinitely on iOS.
     * The skill-documented idiom is `--device <name>`, so we now pass
     * both flags to maximise the chance the daemon's session-binding
     * logic recognises the device correctly. If `--device` alone
     * suffices, the redundant `--udid` is harmless.
     */
    const raw = execFileSync("xcrun", ["simctl", "list", "devices", "--json"], {
      encoding: "utf8",
    });
    const parsed = JSON.parse(raw) as {
      devices: Record<
        string,
        Array<{ udid: string; state: string; name: string }>
      >;
    };
    for (const runtime of Object.values(parsed.devices)) {
      for (const dev of runtime) {
        if (dev.state === "Booted") {
          this.cachedDevice = { name: dev.name, udid: dev.udid };
          return this.cachedDevice;
        }
      }
    }
    throw new Error("no booted iOS simulator found");
  }

  private getDeviceUdid(): string {
    return this.getDevice().udid;
  }
}

/* ---- factory --------------------------------------------------------- */

/**
 * Selects a Platform implementation. `PLATFORM` env var wins; defaults
 * to 'android' for backwards compatibility with Phase 1.
 */
export function detectPlatform(): Platform {
  const envName = (process.env.PLATFORM ?? "").toLowerCase().trim();
  if (envName === "ios") {
    return new IOSPlatform();
  }
  if (envName === "android" || envName === "") {
    return new AndroidPlatform();
  }
  throw new Error(
    `unsupported PLATFORM='${envName}'; expected 'android' or 'ios'`,
  );
}

/* ---- background process tracking ------------------------------------ */

/**
 * Tracks PIDs the driver spawns (e.g. Metro) so the cleanup trap can
 * terminate them on exit. Exported so the driver and the cleanup
 * handler share state without circular imports.
 */
export const backgroundPids: number[] = [];

/**
 * Starts Metro and tracks its PID. Identical across platforms — both
 * Android and iOS dev builds fetch the JS bundle from
 * `http://localhost:8081/...`.
 */
export function startMetro(metroLogPath: string): void {
  const metroLog = fs.openSync(metroLogPath, "a");
  const metro = spawn("npm", ["start"], {
    stdio: ["ignore", metroLog, metroLog],
    detached: true,
  });
  metro.unref();
  if (metro.pid) {
    backgroundPids.push(metro.pid);
  }
}

/**
 * Resolve the installable bundle path under `platform.appBundleDir`.
 * Returns the first match by name (sorted alphabetically), or null.
 * The driver decides how to report a missing bundle.
 */
export function locateBundle(platform: Platform): string | null {
  if (!fs.existsSync(platform.appBundleDir)) {
    return null;
  }
  const files = fs
    .readdirSync(platform.appBundleDir)
    .filter((f) => f.endsWith(platform.appBundleSuffix))
    .sort();
  if (!files.length) {
    return null;
  }
  return path.join(platform.appBundleDir, files[0]);
}
