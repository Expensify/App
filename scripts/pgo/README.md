# Native profile-guided optimization

This directory contains the local LLVM PGO workflow for Android and iOS. The `pgo.ts` command builds release, instrumented, and profile-optimized apps, retrieves native profiles, merges them, and compares startup performance. On Android, the current flags cover source-built React Native, Hermes, and ExpensifyNitroUtils libraries. On iOS, the workflow forces React Native and Hermes source builds and instruments the app and source-based CocoaPods targets. Precompiled frameworks do not participate.

The command enables the existing `ManualAppStartup` benchmark span in every app it builds. Profile collection waits for that span to finish, then explicitly writes the LLVM counters before the app process is stopped. Benchmarking uses the same native span tooling as the repository's general startup benchmark.

## Prepare local release identifiers

Bootstrap the release projects once so the apps can be installed beside other Expensify builds:

```bash
scripts/bootstrapForDevice.ts --build-variants release --identifier-suffix pgo
```

For Christoph Pader's local identifiers, this produces:

| Platform | Identifier |
| --- | --- |
| Android | `com.chrispader.expensify.pgo` |
| iOS | `com.chrispader.expensify.expensifylite.pgo` |

The PGO command reads the Android release application ID from `Mobile-Expensify/Android/build.gradle` and the iOS bundle identifier from the archived app. Pass `--app-id` to override either value.

## Preconditions

- Prefer physical arm64 Android and iOS devices for final profile collection and measurements. An Android emulator running the same ABI and instrumented native build can provide useful counts, but emulator-only behavior can bias the workload. An iOS simulator builds for a different platform, so do not reuse its native profiles for a device build.
- Android requires the NDK version pinned in `Mobile-Expensify/Android/build.gradle`. Set `ANDROID_NDK_HOME` if it is not installed in the default SDK directory.
- iOS requires Xcode command-line tools, an unlocked device, and valid local Apple Development signing for the app and its extensions. Select a team with `IOS_DEVELOPMENT_TEAM` when automatic discovery is insufficient.
- Install dependencies and apply the repository patches before building.
- Seed a test account and data set before recording an interactive profile.

Every command starts with a platform and a workflow:

```bash
scripts/pgo/pgo.ts android --help
scripts/pgo/pgo.ts ios --help
```

## Collect a startup profile

Build, verify, and install the instrumented app:

```bash
scripts/pgo/pgo.ts android build-instrumented
scripts/pgo/pgo.ts android verify-instrumented
scripts/pgo/pgo.ts android install-instrumented
```

Record ten cold-process startups, retrieve the raw profiles, and merge them:

```bash
scripts/pgo/pgo.ts android record-startups
```

The optional positional arguments set the run count and span timeout:

```bash
scripts/pgo/pgo.ts android record-startups 20 45
```

The command removes only old `newdot-*.profraw` files before collection. It requires `ManualAppStartup` to complete on every run and flushes the native counters after each successful run. A missing span fails the collection instead of adding a partial startup. The merged profile is written to `.pgo/android/arm64-v8a/newdot.profdata` or `.pgo/ios/arm64/newdot.profdata`.

The iOS workflow uses the same commands:

```bash
scripts/pgo/pgo.ts ios build-instrumented
scripts/pgo/pgo.ts ios verify-instrumented
scripts/pgo/pgo.ts ios install-instrumented
scripts/pgo/pgo.ts ios record-startups
```

The app must remain in the foreground until each profile write completes. Force-terminating an iOS app is not a reliable profile flush.

## Collect an interactive profile

For a broader profile, install the instrumented app, perform the agreed journey, and write the counters while the app is still running:

```bash
scripts/pgo/pgo.ts android dump
scripts/pgo/pgo.ts android pull
scripts/pgo/pgo.ts android merge
```

Use the equivalent `ios` commands on iOS. A representative journey should exercise the common signed-in path: open and scroll chats, send a message, visit a workspace setting, attach and view a file, and run a search. Keep account state, data size, and network conditions stable between collections.

## Build and benchmark the optimized app

Build the optimized app only after recording a fresh profile. Build the baseline release from the same source revision and toolchain:

```bash
scripts/pgo/pgo.ts android build-optimized
scripts/pgo/pgo.ts android build-release
scripts/pgo/pgo.ts android benchmark 20 45
```

The benchmark installs the archived baseline, runs one warm-up and the requested `ManualAppStartup` samples, then repeats the process with the optimized app. Both builds use the same application identifier, so installing the second artifact preserves the seeded account and data. Results are stored under `.pgo/<platform>/benchmarks/` in the repository benchmark CSV format.

The stages can also run independently:

```bash
scripts/pgo/pgo.ts android benchmark-release 20 45
scripts/pgo/pgo.ts android benchmark-optimized 20 45
scripts/pgo/pgo.ts android compare-benchmarks
```

Select a device or override an identifier when discovery is ambiguous:

```bash
scripts/pgo/pgo.ts android benchmark 20 45 --device DEVICE_SERIAL --app-id com.chrispader.expensify.pgo
scripts/pgo/pgo.ts ios benchmark 20 45 --device Chris14Pro --app-id com.chrispader.expensify.expensifylite.pgo
```

Release, instrumented, and optimized artifacts are archived under `.pgo/android/arm64-v8a/apk/` and `.pgo/ios/arm64/app/`. Do not apply a profile to another architecture, compiler, source revision, dependency graph, or build configuration.

## What to collect

A startup-only profile is useful, but it tends to overfit initialization and can make post-startup code colder. For startup and overall app performance, use a mixed profile with measured weights:

1. Record a fixed startup suite across the important states, such as a signed-out launch, a signed-in inbox launch, and a launch with a realistically large local data set.
2. Record a small set of common interactive journeys. Prefer bounded flows with deterministic seeded data and an explicit success signal.
3. Keep the raw output for each scenario separate. A longer scenario generates more counter volume than a short one, so equal repetition does not give scenarios equal influence.
4. Keep a separate benchmark suite that does not contribute to the training profile. This catches overfitting.

The current `record-startups` command accumulates and merges the startup runs automatically. For a mixed CI profile, preserve each scenario's output independently, convert it to its own indexed profile, then combine the scenario profiles with `llvm-profdata merge --weighted-input`. Choose weights from measured production flow frequency and performance impact, not from a default startup-to-interaction ratio. A giant tour of every feature is less useful than a stable suite that reflects real traffic.

## A realistic CI design

Run profile generation as a scheduled or release-candidate job, not on every pull request. Use pinned self-hosted runners or a device farm, preferably with physical arm64 devices, the production compiler versions, stable thermal and power conditions, a seeded account, and deterministic local fixtures where possible. Build one instrumented artifact per platform, run the fixed startup and interaction suites against that exact artifact, flush after every successful scenario, merge the separate outputs with documented weights, then build the optimized artifact without changing the checkout or toolchain.

Benchmark both variants on the same device after a cooldown, discard post-install warm-ups, and retain raw samples. The `benchmark` workflow runs all baseline samples before all optimized samples, so thermal or time-dependent drift can bias the comparison. The two archived builds intentionally share an identifier to preserve app data, which prevents side-by-side alternation. CI can reduce drift with ABBA install blocks that preserve the shared identifier and discard each post-install warm-up. Another option is to give the builds distinct identifiers, seed matched state, and use the repository's alternating startup benchmark. Evaluate both startup and held-out interactive journeys that were excluded from training. Gate on several releases of data rather than a single noisy run.

Hosted CI is usually insufficient for the complete workflow because hosted runners rarely expose stable physical devices. Android emulators can validate automation and may contribute useful same-ABI counts when the workload is representative, but final validation should use target devices. iOS device collection also needs signing and physical-device access. A small self-hosted device pool or managed device farm is the realistic route to automation.

## Limitations

- LLVM PGO improves compiled native code. It can optimize a source-built Hermes engine, but it does not directly reorder JavaScript or replace JavaScript startup analysis.
- Precompiled vendored frameworks cannot be instrumented after the fact.
- Profiles become stale after native source, dependency, compiler, SDK, ABI, or important build-setting changes. Regenerate them instead of accepting out-of-date warnings.
- Instrumented builds have overhead. Never use them as the performance baseline.
- Local bootstrap settings disable Android minification so synthetic identifiers and debug signing work. A production decision still needs a production-like, minified CI build with the repository's signing and dependency issues resolved.
- Device temperature, battery state, background work, network variability, and test-account drift can overwhelm small gains. Preserve raw samples and use enough repetitions.
- A profile is only as good as its workload. Narrow startup training can regress later interactions, while an unweighted feature tour can dilute hot production paths.

Android Baseline Profiles are a separate, complementary input to ART compilation of Java and Kotlin. Android Startup Profiles are the related mechanism for DEX layout. Neither replaces this LLVM profile for C, C++, and Swift code.

## References

- [Android NDK profile-guided optimization](https://developer.android.com/ndk/guides/pgo)
- [Clang profile-guided optimization](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)
- [`llvm-profdata` weighted inputs](https://llvm.org/docs/CommandGuide/llvm-profdata.html#cmdoption-llvm-profdata-merge-weighted-input)
- [Android Baseline Profiles](https://developer.android.com/topic/performance/baselineprofiles/overview)
