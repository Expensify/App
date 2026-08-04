# Local Android PGO proof

This is an experimental, local-only LLVM PGO workflow for the standalone Android arm64 release build: optimized native code and a bundled production JavaScript bundle, signed with the local debug key so it can be installed without release credentials. It does not publish artifacts and it does not add application metrics.

## Preconditions

- A physical arm64 Android device connected through `adb`.
- `ANDROID_NDK_HOME` points at NDK `27.1.12297006`, the version pinned in `Mobile-Expensify/Android/build.gradle`.
- A signed-in, seeded test account and the agreed manual NewDot journey.
- Dependencies have had the repository's patches applied.

## Collect one profile

1. Build and install the instrumented application:

   ```bash
   scripts/pgo/android-local-proof.sh build-instrumented
   scripts/pgo/android-local-proof.sh install-instrumented
   ```

2. Run the manual authenticated journey once: open and scroll chats, send a message, visit and modify reversible workspace settings, attach an image and document, view attachments, then use search.
3. Persist the counters before force-stopping the application:

   ```bash
   scripts/pgo/android-local-proof.sh dump
   scripts/pgo/android-local-proof.sh pull
   scripts/pgo/android-local-proof.sh merge
   ```

   Profiles are written to the app's external cache so they can be retrieved from a non-debuggable release APK with `adb pull`.

4. Build the matched optimized application:

   ```bash
   scripts/pgo/android-local-proof.sh build-optimized
   ```

   The script archives all release outputs under `.pgo/android/arm64-v8a/apk/`: `Expensify-release.apk`, `Expensify-release-instrumented.apk`, and `Expensify-release-optimized.apk`. This keeps them safe when Gradle replaces the contents of its release output directory. The install and benchmark commands use these archived APKs. All builds use the release application ID and are installed consecutively. Install the optimized APK with:

   ```bash
   scripts/pgo/android-local-proof.sh install-optimized
   ```

### Collect a startup-focused profile

To replace the manual journey with ten cold-process startup runs, then pull and merge the accumulated profiles automatically, run:

```bash
scripts/pgo/android-local-proof.sh record-startups
```

The optional arguments set the number of runs and the timeout for NewDot's native app-ready signal respectively:

```bash
scripts/pgo/android-local-proof.sh record-startups 10 30
```

The command clears only existing `newdot-*.profraw` files on the device before the first run. It clears Logcat before each launch, waits for `NewDotStartup: APP_READY`, and fails rather than recording an incomplete startup if the marker does not appear before the timeout. LLVM's `%m` filename pattern merges each process into the same per-library raw profiles. Each process is dumped exactly once, and the final host-side `merge` converts those raw profiles into `.pgo/android/arm64-v8a/newdot.profdata`.

The metrics build calls Android's `reportFullyDrawn()` and emits the machine-readable `NewDotStartup: APP_READY durationMs=<milliseconds>` native marker from `Expensify.tsx`'s `onSplashHide`, immediately after the `ManualAppStartup` Sentry span ends and after the splash exit animation and startup gates have completed. The duration starts at the same native timestamp used by the Sentry span.

## Benchmark startup

Build the PGO-optimized APK and then the release APK from the same source revision, compiler, NDK, and ABI. Every mode initially uses Gradle's normal release output path, then the tool moves it into `.pgo/android/arm64-v8a/apk/`:

```bash
scripts/pgo/android-local-proof.sh build-optimized
scripts/pgo/android-local-proof.sh build-release
```

Collect each benchmark independently. Each command installs its APK without clearing application data, performs one unmeasured warm-up, then records ten cold-process startup samples by default:

```bash
scripts/pgo/android-local-proof.sh benchmark-release
scripts/pgo/android-local-proof.sh benchmark-optimized
```

The optional arguments select the measured run count and app-ready timeout:

```bash
scripts/pgo/android-local-proof.sh benchmark-release 20 30
scripts/pgo/android-local-proof.sh benchmark-optimized 20 30
```

Compare previously collected samples:

```bash
scripts/pgo/android-local-proof.sh compare-benchmarks
```

Or install and benchmark the archived release APK first, then install and benchmark the archived optimized APK, and compare them in one command:

```bash
scripts/pgo/android-local-proof.sh benchmark 10 30
```

Raw samples are stored in `.pgo/android/benchmarks/release.csv` and `.pgo/android/benchmarks/pgo-optimized.csv`. The comparison reports the mean, median, minimum, maximum, and percentage improvement. Positive improvement percentages mean the optimized build was faster.

The `.pgo/` directory is intentionally local-only. Never apply this profile to another ABI, build mode, NDK version, or substantially different source revision. A production-release comparison additionally needs the repository's R8/SafetyNet dependency issue fixed; this local proof deliberately does not change that unrelated configuration.

## Compare

Install the release and optimized APKs consecutively. For each build, exclude the first post-install run, force-stop before every subsequent run, and record ten repetitions of the same journey with `am start -W` and Perfetto. Keep attachment-upload latency diagnostic only; use cold start and local interaction/frame timing as the primary decision metrics.
