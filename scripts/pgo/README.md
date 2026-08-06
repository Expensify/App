# Local PGO proof

This is an experimental, local-only LLVM PGO workflow for Android and iOS. The TypeScript tool shares the build, profile, merge, and benchmark orchestration while each platform adapter handles its native build system and physical-device tooling. It builds React Native, Hermes, Nitro modules, and other source-based native dependencies from source so they can participate in PGO. Precompiled vendored frameworks cannot be instrumented retroactively.

The workflow does not publish artifacts. It uses the existing NewDot `APP_READY` point immediately after the `ManualAppStartup` Sentry span ends as both the profile boundary and startup benchmark marker.

## Preconditions

- A physical arm64 Android or iOS device. Simulators are not suitable for collecting a production-device PGO profile.
- For Android, `ANDROID_NDK_HOME` points at NDK `27.1.12297006`, the version pinned in `Mobile-Expensify/Android/build.gradle`.
- For iOS, Xcode command-line tools, a connected and unlocked device, and locally valid Apple Development signing settings for the app and its remaining extensions. The tool respects the project development team by default; override it with `IOS_DEVELOPMENT_TEAM`. Select a device with `--device`; `IOS_DEVICE_ID` remains available as an environment fallback. It reads the locally signed bundle identifier from the archived `.app`; `IOS_BUNDLE_IDENTIFIER` is available as an explicit override.
- A signed-in, seeded test account and the agreed manual NewDot journey.
- Dependencies have had the repository's patches applied.

Every command starts with a platform:

```bash
scripts/pgo/local-proof.ts android --help
scripts/pgo/local-proof.ts ios --help
```

## Collect one profile

1. Build and install the instrumented application:

   ```bash
   scripts/pgo/local-proof.ts android build-instrumented
   scripts/pgo/local-proof.ts android install-instrumented
   ```

2. Run the manual authenticated journey once: open and scroll chats, send a message, visit and modify reversible workspace settings, attach an image and document, view attachments, then use search.
3. Persist the counters before force-stopping the application:

   ```bash
   scripts/pgo/local-proof.ts android dump
   scripts/pgo/local-proof.ts android pull
   scripts/pgo/local-proof.ts android merge
   ```

   Profiles are written to the app's external cache so they can be retrieved from a non-debuggable release APK with `adb pull`.

4. Build the matched optimized application:

   ```bash
   scripts/pgo/local-proof.ts android build-optimized
   ```

   The script archives all release outputs under `.pgo/android/arm64-v8a/apk/`: `Expensify-release.apk`, `Expensify-release-instrumented.apk`, and `Expensify-release-optimized.apk`. This keeps them safe when Gradle replaces the contents of its release output directory. The install and benchmark commands use these archived APKs. All builds use the release application ID and are installed consecutively. Install the optimized APK with:

   ```bash
   scripts/pgo/local-proof.ts android install-optimized
   ```

### Collect a startup-focused profile

To replace the manual journey with ten cold-process startup runs, then pull and merge the accumulated profiles automatically, run:

```bash
scripts/pgo/local-proof.ts android record-startups
```

The optional arguments set the number of runs and the timeout for NewDot's native app-ready signal respectively:

```bash
scripts/pgo/local-proof.ts android record-startups 10 30
```

The command clears only existing `newdot-*.profraw` files on the device before the first run. It clears Logcat before each launch, waits for `NewDotStartup: APP_READY`, and fails rather than recording an incomplete startup if the marker does not appear before the timeout. LLVM's `%m` filename pattern merges each process into the same per-library raw profiles. Each process is dumped exactly once, and the final host-side `merge` converts those raw profiles into `.pgo/android/arm64-v8a/newdot.profdata`.

The metrics build calls Android's `reportFullyDrawn()` and emits the machine-readable `NewDotStartup: APP_READY durationMs=<milliseconds>` native marker from `Expensify.tsx`'s `onSplashHide`, immediately after the `ManualAppStartup` Sentry span ends and after the splash exit animation and startup gates have completed. The duration starts at the same native timestamp used by the Sentry span.

## Benchmark startup

Build the PGO-optimized APK and then the release APK from the same source revision, compiler, NDK, and ABI. Every mode uses Gradle's normal release output path, then the tool copies it into `.pgo/android/arm64-v8a/apk/`. The currently built APK remains in Gradle's release directory:

```bash
scripts/pgo/local-proof.ts android build-optimized
scripts/pgo/local-proof.ts android build-release
```

Collect each benchmark independently. Each command installs its APK without clearing application data, performs one unmeasured warm-up, then records ten cold-process startup samples by default:

```bash
scripts/pgo/local-proof.ts android benchmark-release
scripts/pgo/local-proof.ts android benchmark-optimized
```

The optional arguments select the measured run count and app-ready timeout:

```bash
scripts/pgo/local-proof.ts android benchmark-release 20 30
scripts/pgo/local-proof.ts android benchmark-optimized 20 30
```

Compare previously collected samples:

```bash
scripts/pgo/local-proof.ts android compare-benchmarks
```

Or install and benchmark the archived release APK first, then install and benchmark the archived optimized APK, and compare them in one command:

```bash
scripts/pgo/local-proof.ts android benchmark 10 30
```

Select a specific connected device for install or benchmark commands with `--device`. Use an adb serial for Android and any identifier accepted by CoreDevice for iOS, such as a CoreDevice identifier, UDID, serial number, or device name:

```bash
scripts/pgo/local-proof.ts --device emulator-5554 android install-optimized
scripts/pgo/local-proof.ts --device emulator-5554 android benchmark 10 30
scripts/pgo/local-proof.ts --device Chris14Pro ios install-optimized
scripts/pgo/local-proof.ts --device Chris14Pro ios benchmark 10 30
scripts/pgo/local-proof.ts --device "Chris14Pro (26.6) (00008120-00065D541E3B401E)" ios benchmark 10 30
```

Quote selectors containing spaces or parentheses. The iOS resolver accepts either the plain device name or the complete physical-device entry printed under `== Devices ==` by `xcrun xctrace list devices`; it does not select entries from the simulator section.

Raw samples are stored in `.pgo/android/benchmarks/release.csv` and `.pgo/android/benchmarks/pgo-optimized.csv`. The comparison reports the average, P50, P75, P90, P95, P99, minimum, maximum, and percentage improvements. Percentiles use linear interpolation, and positive improvement percentages mean the optimized build was faster.

The `.pgo/` directory is intentionally local-only. Never apply this profile to another ABI, build mode, NDK version, or substantially different source revision. A production-release comparison additionally needs the repository's R8/SafetyNet dependency issue fixed; this local proof deliberately does not change that unrelated configuration.

## Compare

Install the release and optimized APKs consecutively. For each build, exclude the first post-install run, force-stop before every subsequent run, and record ten repetitions of the same journey with `am start -W` and Perfetto. Keep attachment-upload latency diagnostic only; use cold start and local interaction/frame timing as the primary decision metrics.

## iOS workflow

The iOS commands mirror Android:

```bash
scripts/pgo/local-proof.ts ios build-instrumented
scripts/pgo/local-proof.ts ios verify-instrumented
scripts/pgo/local-proof.ts ios install-instrumented
scripts/pgo/local-proof.ts ios record-startups 10 30
scripts/pgo/local-proof.ts ios build-optimized
scripts/pgo/local-proof.ts ios build-release
scripts/pgo/local-proof.ts ios benchmark 10 30
```

`record-startups` launches the installed instrumented app, clears old counters, performs the requested cold-process startups, explicitly flushes LLVM counters after every `APP_READY`, copies the raw profiles from the app data container, and merges them into `.pgo/ios/arm64/newdot.profdata`. The app must remain in the foreground until each dump completes; force-terminating an iOS app is not a reliable profile-flush mechanism.

For a broader manual profile, use the same instrumented build, perform the agreed authenticated NewDot journey, and then run:

```bash
scripts/pgo/local-proof.ts ios dump
scripts/pgo/local-proof.ts ios pull
scripts/pgo/local-proof.ts ios merge
scripts/pgo/local-proof.ts ios build-optimized
```

The iOS adapter uses an arm64 Release device build with local development signing. It forces React Native core, React Native dependencies, and Hermes to build from source. Xcode-level Clang frontend instrumentation and Swift IR instrumentation cover app and source-based CocoaPods targets; a React Native patch forwards the matching flags into Hermes' nested CMake build. Release, instrumented, and optimized `.app` bundles are archived under `.pgo/ios/arm64/app/` and benchmarks under `.pgo/ios/benchmarks/`.

The source-build preparation also validates the source roots CocoaPods needs for Hermes, `libdav1d`, and `libwebp`. If an existing generated checkout is incomplete, the tool removes only that Pod directory and lets the locked `pod install` restore it before compiling. This prevents missing private-header failures caused by a partially materialized CocoaPods sandbox.

If signing is temporarily unavailable, `IOS_CODE_SIGNING_ALLOWED=NO scripts/pgo/local-proof.ts ios build-instrumented` builds an unsigned device artifact for compilation and instrumentation verification only. Unsigned apps cannot be installed, profiled, or benchmarked; the connected device and all app-extension bundle identifiers must be covered by valid development provisioning profiles for the complete workflow.

The three-stage procedure is the same on both platforms, but the mechanics differ:

| Stage | Android | iOS |
| --- | --- | --- |
| Build | Gradle/NDK | CocoaPods + `xcodebuild` |
| Instrument | Clang `-fprofile-generate` | Clang `-fprofile-instr-generate`, Swift `-ir-profile-generate` |
| Flush | Android broadcast/JNI | Darwin notification/native LLVM runtime |
| Retrieve | `adb pull` from external cache | CoreDevice copy from the app data container |
| Merge | NDK `llvm-profdata` | Xcode `llvm-profdata` |
| Consume | Clang `-fprofile-use` | Clang `-fprofile-instr-use`, Swift `-ir-profile-use` |

Profiles are tied to the exact compiler, architecture, source, dependencies, and build configuration that produced them. Rebuild all three app variants from the same revision and Xcode version, do not reuse an Android profile on iOS, and regenerate the iOS profile after meaningful native-source or toolchain changes. The release and optimized benchmarks preserve app data and use the same bundle identifier so the authenticated state and data set remain comparable.
