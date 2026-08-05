# Local PGO proof

This is an experimental, local-only LLVM PGO workflow. The TypeScript tool separates platform-specific operations from the shared build, profile, and benchmark workflows so iOS support can be added without duplicating the orchestration. Currently only the standalone Android arm64 release build is implemented: optimized native code and a bundled production JavaScript bundle, signed with the local debug key so it can be installed without release credentials. It does not publish artifacts and it does not add application metrics.

## Preconditions

- A physical arm64 Android device connected through `adb`.
- `ANDROID_NDK_HOME` points at NDK `27.1.12297006`, the version pinned in `Mobile-Expensify/Android/build.gradle`.
- A signed-in, seeded test account and the agreed manual NewDot journey.
- Dependencies have had the repository's patches applied.

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

Raw samples are stored in `.pgo/android/benchmarks/release.csv` and `.pgo/android/benchmarks/pgo-optimized.csv`. The comparison reports the average, P50, P75, P90, P95, P99, minimum, maximum, and percentage improvements. Percentiles use linear interpolation, and positive improvement percentages mean the optimized build was faster.

The `.pgo/` directory is intentionally local-only. Never apply this profile to another ABI, build mode, NDK version, or substantially different source revision. A production-release comparison additionally needs the repository's R8/SafetyNet dependency issue fixed; this local proof deliberately does not change that unrelated configuration.

## Compare

Install the release and optimized APKs consecutively. For each build, exclude the first post-install run, force-stop before every subsequent run, and record ten repetitions of the same journey with `am start -W` and Perfetto. Keep attachment-upload latency diagnostic only; use cold start and local interaction/frame timing as the primary decision metrics.
