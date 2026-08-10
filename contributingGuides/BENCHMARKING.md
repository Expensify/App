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

## Run the benchmark

The benchmark runs one unmeasured warm-up followed by 20 measured cold-process launches by default. It prints each sample and summary statistics, and stores raw samples under the git-ignored `.benchmarks` directory.

Android:

```shell
nr benchmark-app-startup -- android ManualAppStartup 20 30 --device emulator-5554
```

iOS physical device:

```shell
nr benchmark-app-startup -- ios ManualAppStartup 20 30 --device "Developer's iPhone"
```

The positional arguments are platform, span name, measured run count, and timeout in seconds. Use `--app-id` for a nonstandard Android application ID or iOS bundle identifier, and `--output` to select another CSV path.

### True-cold mode

By default, each run terminates and relaunches the existing app process without clearing persisted state. Pass `--cold` to clear state before every launch.

On Android, true-cold mode clears package data and resets compiled package state with `cmd package compile --reset`:

```shell
nr benchmark-app-startup -- android ManualAppStartup --cold --device emulator-5554
```

On iOS, clearing app data requires uninstalling and reinstalling the signed app, so `--app-path` is required:

```shell
nr benchmark-app-startup -- ios ManualAppStartup --cold --device "Developer's iPhone" --app-path /path/to/Expensify.app
```

True-cold runs start with no authenticated account or persisted application state. Cold-process runs are usually more suitable for benchmarking authenticated startup flows.
