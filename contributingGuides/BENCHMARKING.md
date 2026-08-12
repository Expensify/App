<!-- cspell:ignore devicectl -->

# Native app benchmarks

The native release bundle can emit structured completion events for selected manual Sentry spans. Benchmark logging is disabled unless a developer explicitly configures span names in the git-ignored root `.env` file.

## Configure benchmark spans

Add a comma-separated list of exact Sentry span names to `.env` before building the release app:

```dotenv
EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS=ManualAppStartup,ManualAppStartupNetworkRequest
```

Rebuild the release app after changing the list. Enabled spans produce one flat, machine-readable line when they end successfully:

```text
[EXPENSIFY_BENCHMARK] {"event":"span_end","span":"ManualAppStartup","durationMs":1234,"timestamp":1710000000000}
```

The app uses `console.warn` for this opt-in output because production bundles remove `console.log`, `console.info`, and `console.debug`. The Sentry console integration only forwards errors, so benchmark lines do not create Sentry log events or additional network traffic. A dedicated native logging bridge would avoid warning semantics, but would add native code solely for local tooling on both platforms.

## Bootstrap side-by-side native apps

Use the device bootstrap script before producing a local release build. With no identifier option, it derives a unique identifier from the authenticated GitHub username. A suffix is useful when the same developer needs separate apps for multiple branches or worktrees:

```shell
nr bootstrap-device -- android --suffix baseline
nr bootstrap-device -- ios --suffix baseline
```

Pass `--bundle-identifier` to replace the generated base identifier, or `--github-username` to override only the username used by the default. Android converts hyphens in GitHub usernames and suffixes to underscores because Android application ID segments are Java identifiers. The suffix is also included in the launcher display name, for example `Expensify (baseline)` and `Expensify Debug (baseline)`.

On Android, bootstrapping changes every build type's application ID, switches release-derived builds to the checked-in debug keystore, and disables R8/ProGuard so a local release APK can be signed and assembled. It also creates package-matched entries in the local `google-services.json` by reusing the registered Expensify Firebase resources. This avoids a Firebase dashboard change and keeps Firebase startup behavior present in benchmark builds.

The synthetic package is not a newly registered Firebase Android app. Package/signing-restricted services, notably Google Sign-In, do not work with it, and Firebase data may be attributed to the registered Expensify app whose resources were reused. Do not distribute or upload this build. Disabling Google Services is not recommended for performance comparisons: it removes production startup work and can change application behavior, making the result less representative.

Build and install a bootstrapped Android release APK with the Mobile-Expensify Gradle wrapper, then use the application ID printed by the bootstrap command:

```shell
./Mobile-Expensify/Android/gradlew -p Mobile-Expensify/Android assembleRelease
adb -s emulator-5554 install -r Mobile-Expensify/Android/build/outputs/apk/release/Android-release.apk
```

## Run the benchmark

The benchmark runs one unmeasured warm-up followed by 20 measured cold-process launches by default. It collects every span configured in `EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS`, prints a separate statistics row for each span, and stores the raw samples under the git-ignored `.benchmarks` directory.

Android:

```shell
nr benchmark-app-startup -- android 20 --device emulator-5554
```

iOS physical device:

```shell
nr benchmark-app-startup -- ios 20 --device "Developer's iPhone"
```

The positional arguments are the platform and measured run count. By default, each launch collects metrics for 30 seconds. Use `--wait-time` to change that collection window:

```shell
nr benchmark-app-startup -- ios 20 --wait-time 10
```

Use `--wait-until-span` to finish a run early when a particular configured span ends. The wait time remains the maximum time allowed for that span to end:

```shell
nr benchmark-app-startup -- ios 20 --wait-time 30 --wait-until-span ManualAppStartup
```

Pass `--span` to restrict the statistics and CSV output to one span. The wait-until span can be different from the measured span as long as both are included in `EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS`:

```shell
nr benchmark-app-startup -- ios 20 --span ManualAppStartupNetworkRequest --wait-until-span ManualAppStartup
```

Use `--app-id` for a nonstandard Android application ID or iOS bundle identifier, and `--output` to select another CSV path. Runs where a configured metric does not end within the collection window are reported as `not observed` and are omitted from that metric's percentile calculations.

### Compare two installed apps

Pass `--app-id-a` and `--app-id-b` to enable alternating comparison mode. The two application IDs or bundle identifiers must identify different apps that are already installed on the device. The script warms up each app once, then measures app A followed by app B for every run, keeping the two apps interleaved on the same device without reinstalling either one.

```shell
nr benchmark-app-startup -- android 20 \
    --app-id-a com.example.expensify.baseline \
    --app-id-b com.example.expensify.candidate \
    --device emulator-5554 \
    --span ManualAppStartup \
    --wait-time 30
```

Use `--output-a` and `--output-b` to choose the per-app CSV files. By default they are written as `<platform>-<span>-<mode>-a.csv` and `...-b.csv` under `.benchmarks`. Each file contains every selected span's samples for that app, and the terminal prints a separate multi-span summary table for each app. `--output` is reserved for single-app mode.

Pass `--cold` together with `--app-path-a` and `--app-path-b` when you want each comparison app reinstalled before every warm-up and measured launch. The paths identify the corresponding Android APKs or signed iOS `.app` bundles. Cold comparison mode also clears app state using the platform-specific cold-start behavior; artifact paths are rejected in process mode.

```shell
nr benchmark-app-startup -- ios 20 --cold \
    --app-id-a com.example.app.a \
    --app-id-b com.example.app.b \
    --app-path-a /path/to/app-a.app \
    --app-path-b /path/to/app-b.app \
    --device "Developer's iPhone" \
    --wait-time 30
```

The script runs with Bun and also exports `benchmarkAppStartups`, `benchmarkAppStartupsAlternating`, and `benchmarkStartups`. Other local tooling, such as the PGO workflow, can install an artifact and invoke the same benchmark implementation. The lower-level Android and iOS process tooling lives in `scripts/lib/nativeAppBenchmark.ts` so callers do not need to duplicate `adb` or `xcrun devicectl` behavior.

Android benchmark logs are scoped to the PID launched for each application ID. This prevents log events from the other installed comparison binary from being counted in the current sample.

For example, a PGO script can install each artifact and call `benchmarkAppStartups` with its platform, device, bundle identifier, output path, and span name. This keeps artifact building and installation in the PGO workflow while sharing all startup measurement and platform-device behavior.

```ts
import {benchmarkAppStartups} from '../benchmarkAppStartup';

await benchmarkAppStartups({
    platform: 'android',
    rootDirectory,
    deviceIdentifier,
    appID: 'org.me.mobiexpensifyg',
    mode: 'process',
    spanNames: ['ManualAppStartup', 'ManualAppStartupNetworkRequest'],
    runs,
    waitTimeSeconds: 30,
    waitUntilSpan: 'ManualAppStartup',
    outputPath,
});
```

### True-cold mode

By default, each run terminates and relaunches the existing app process without clearing persisted state. Pass `--cold` to clear state before every launch.

On Android, true-cold mode clears package data and resets compiled package state with `cmd package compile --reset`:

```shell
nr benchmark-app-startup -- android --cold --device emulator-5554
```

On iOS, clearing app data requires uninstalling and reinstalling the signed app, so `--app-path` is required:

```shell
nr benchmark-app-startup -- ios --cold --device "Developer's iPhone" --app-path /path/to/Expensify.app
```

True-cold runs start with no authenticated account or persisted application state. Cold-process runs are usually more suitable for benchmarking authenticated startup flows.
