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

/* ---- factory --------------------------------------------------------- */

/**
 * Selects a Platform implementation. `PLATFORM` env var wins; defaults
 * to 'android' for backwards compatibility with Phase 1.
 */
export function detectPlatform(): Platform {
  const envName = (process.env.PLATFORM ?? "").toLowerCase().trim();
  if (envName === "ios") {
    throw new Error(
      "PLATFORM=ios requested but IOSPlatform is not implemented in this PR (Phase 2 PR A). It lands in PR B.",
    );
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
