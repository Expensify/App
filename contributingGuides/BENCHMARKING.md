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

Use the device bootstrap script before producing a local release build. With no identifier option, it derives a unique identifier from the GitHub user authenticated by `GH_TOKEN` or `GITHUB_TOKEN`. Pass `--github-username` instead when neither token is set. A suffix is useful when the same developer needs separate apps for multiple branches or worktrees:

```shell
npm run bootstrap-device -- android --suffix baseline
npm run bootstrap-device -- ios --suffix baseline
```

Pass `--bundle-identifier` to replace the generated base identifier, or `--github-username` to override only the username used by the default. Android converts hyphens in GitHub usernames and suffixes to underscores because Android application ID segments are Java identifiers. The suffix is also included in the launcher display name, for example `Expensify (baseline)` and `Expensify Debug (baseline)`.

On Android, bootstrapping changes every build type's application ID, switches release-derived builds to the checked-in debug keystore, and disables R8/ProGuard so a local release APK can be signed and assembled. It also creates package-matched entries in the local `google-services.json` by reusing the registered Expensify Firebase resources. This avoids a Firebase dashboard change and keeps Firebase startup behavior present in benchmark builds.

The synthetic package is not a newly registered Firebase Android app. Package/signing-restricted services, notably Google Sign-In, do not work with it, and Firebase data may be attributed to the registered Expensify app whose resources were reused. Do not distribute or upload this build. Disabling Google Services is not recommended for performance comparisons: it removes production startup work and can change application behavior, making the result less representative.

Build and install a bootstrapped Android release APK with the Mobile-Expensify Gradle wrapper, then use the application ID printed by the bootstrap command:

```shell
./Mobile-Expensify/Android/gradlew -p Mobile-Expensify/Android assembleRelease
adb -s emulator-5554 install -r Mobile-Expensify/Android/build/outputs/apk/release/Expensify-release.apk
```

## Run the benchmark

The benchmark runs one unmeasured warm-up followed by 20 measured cold-process launches by default. It collects every span configured in `EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS` and prints a separate statistics row for each span. Every run writes the raw samples and the same Average, P50, P75, P90, P95, P99, Min, and Max table as CSV files under the git-ignored `.benchmarks` directory.

Android:

```shell
npm run benchmark-app-startup -- android 20 --device emulator-5554
```

iOS physical device:

```shell
npm run benchmark-app-startup -- ios 20 --device "Developer's iPhone"
```

The positional arguments are the platform and measured run count. By default, each launch collects metrics for 30 seconds. Use a fixed collection window without `--wait-until-span` when measuring multiple spans, since they can finish at different times. Use `--wait-time` to change that window:

```shell
npm run benchmark-app-startup -- ios 20 --wait-time 10
```

Use `--wait-until-span` to finish a run early when a particular configured span ends. Spans that finish after that cutoff are not collected. The wait time remains the maximum time allowed for the stop span to end. For example, measure only startup and stop when it ends:

```shell
npm run benchmark-app-startup -- ios 20 --span ManualAppStartup --wait-time 30 --wait-until-span ManualAppStartup
```

Pass `--span` to restrict the statistics and CSV output to one span. To measure the startup network request within a fixed collection window:

```shell
npm run benchmark-app-startup -- ios 20 --span ManualAppStartupNetworkRequest --wait-time 30
```

The wait-until span can differ from the measured span as long as both are included in `EXPO_PUBLIC_BENCHMARK_SENTRY_SPANS`. Choose it only when later spans may be omitted intentionally. `ManualAppStartupNetworkRequest` can finish after `ManualAppStartup`, so stopping at startup does not guarantee a network-request sample.

Use `--app-id` for a nonstandard Android application ID or iOS bundle identifier. `--output` selects the raw sample CSV path, and `--results-output` selects the statistics table CSV path. Without `--results-output`, the script adds `-results.csv` to the raw sample filename. For example, `.benchmarks/ios-all-spans-process.csv` produces `.benchmarks/ios-all-spans-process-results.csv`.

Runs where a configured metric does not end within the collection window are reported as `not observed` and are omitted from that metric's percentile calculations. The final console and CSV tables show the actual sample count in `runs`. The console also warns for each incomplete metric, for example `12/20 samples collected; 8 missing`, and identifies the binary in comparison mode. Statistics exclude missing samples and may be biased toward faster completions. Use a longer fixed collection window when samples are missing; increasing `--wait-time` while retaining `--wait-until-span` does not delay its early cutoff.

```shell
npm run benchmark-app-startup -- ios 20 \
    --output .benchmarks/startup-samples.csv \
    --results-output .benchmarks/startup-results.csv
```

### Create a results table from existing samples

Use the `results` command to recalculate and export the statistics table from one or more raw sample CSV files. Samples from all input files are combined by span, the table is printed to the terminal, and `.benchmarks/results.csv` is written by default.

```shell
npm run benchmark-app-startup -- results \
    --input-files .benchmarks/startup-samples-a.csv,.benchmarks/startup-samples-b.csv
```

Use `--results-output` to choose a different destination:

```shell
npm run benchmark-app-startup -- results \
    --input-files .benchmarks/startup-samples.csv \
    --results-output .benchmarks/startup-results.csv
```

### Compare two installed apps

Pass `--app-id-a` and `--app-id-b` to enable alternating comparison mode. The two application IDs or bundle identifiers must identify different apps that are already installed on the device. The script warms up each app once, then measures app A followed by app B for every run, keeping the two apps interleaved on the same device without reinstalling either one.

```shell
npm run benchmark-app-startup -- android 20 \
    --app-id-a com.example.expensify.baseline \
    --app-id-b com.example.expensify.candidate \
    --device emulator-5554 \
    --span ManualAppStartup \
    --wait-time 30
```

Use `--output-a` and `--output-b` to choose the per-app sample CSV files. Use `--results-output-a` and `--results-output-b` to choose the corresponding statistics table files. By default, the sample files are written as `<platform>-<span>-<mode>-a.csv` and `...-b.csv` under `.benchmarks`, and each statistics filename adds `-results.csv`. The terminal also prints a separate multi-span summary table for each app. Output options without the `-a` or `-b` suffix are reserved for single-app mode.

Pass `--cold` together with `--app-path-a` and `--app-path-b` when you want each comparison app reinstalled before every warm-up and measured launch. The paths identify the corresponding Android APKs or signed iOS `.app` bundles. Cold comparison mode also clears app state using the platform-specific cold-start behavior; artifact paths are rejected in process mode.

```shell
npm run benchmark-app-startup -- ios 20 --cold \
    --app-id-a com.example.app.a \
    --app-id-b com.example.app.b \
    --app-path-a /path/to/app-a.app \
    --app-path-b /path/to/app-b.app \
    --device "Developer's iPhone" \
    --wait-time 30
```

The script runs with Bun and also exports `benchmarkAppStartups`, `benchmarkAppStartupsAlternating`, and `benchmarkStartups`. Other local tooling can install an artifact and invoke the same benchmark implementation. Statistics calculation, raw sample parsing, and CSV result writing live in `scripts/lib/benchmarkStatistics.ts`. The lower-level shared, Android, and iOS process tooling lives in `scripts/lib/nativeAppBenchmark.ts` and `scripts/lib/nativeAppBenchmark/`. This guide does not assume that an existing PGO script has adopted these exports.

The percentile and summary-statistics functions in `scripts/lib/benchmarkStatistics.ts` remain side-effect free. Callers can use those calculations independently or opt into the same module's sample-file parsing and CSV export helpers without importing device commands or startup orchestration.

Android benchmark logs are scoped to the PID launched for each application ID. This prevents log events from the other installed comparison binary from being counted in the current sample.

The Android collector reads tagged warnings from that process through `adb logcat`. CoreDevice does not provide the benchmark script with an equivalent stream of iOS app logs, so the iOS logger also writes one marker file per span to the app cache. The collector copies those markers from the app container with `devicectl`.

For example, another build or profiling script can install an artifact and call `benchmarkAppStartups` with its platform, device, bundle identifier, output paths, and span names. This keeps artifact building and installation in the caller while sharing startup measurement and platform-device behavior.

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
    outputPath,
});
```

### True-cold mode

By default, each run terminates and relaunches the existing app process without clearing persisted state. Pass `--cold` to clear state before every launch.

On Android, true-cold mode clears package data and resets compiled package state with `cmd package compile --reset`:

```shell
npm run benchmark-app-startup -- android --cold --device emulator-5554
```

On iOS, clearing app data requires uninstalling and reinstalling the signed app, so `--app-path` is required:

```shell
npm run benchmark-app-startup -- ios --cold --device "Developer's iPhone" --app-path /path/to/Expensify.app
```

True-cold runs start with no authenticated account or persisted application state. Cold-process runs are usually more suitable for benchmarking authenticated startup flows.
