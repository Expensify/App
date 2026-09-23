# Automated native PGO journey

<!-- cspell:ignore profraw profdata UDID XCTest -->

`journey.ts` drives the installed app through its accessibility tree using `agent-device` (developed with version 0.20.6). It runs without an LLM. The same TypeScript workload accepts an Android serial or iOS UDID. It uses labels and test IDs, and sizes scroll gestures from the device's reported bounds. The app must use English and portrait orientation. The full journey, including message sending and native profile export, has been validated on a physical Samsung phone and iPhone 13 Pro.

## Account and device setup

Use a dedicated, owner-approved heavy account with a populated Inbox, a long chat history, and enough expenses and expense reports to scroll. Keep the account and its data between runs. Installing over the existing app preserves authentication; uninstalling or clearing app data does not.

The runner never enters credentials, retrieves a magic code, or switches accounts. It checks the account email in Account and exits with `SIGN_IN_REQUIRED` (exit code 2) if sign-in is needed. Stop and ask Chris to sign in manually before continuing. A CI job must surface this failure for manual intervention instead of substituting another account.

Before every run, it opens Inbox to allow the app's automatic large-account preference update, then opens Account → Preferences and ensures Priority mode is **Most recent**. If it is **#focus**, the runner changes it and verifies the result. It checks the preference again at the end and rejects the run if #focus became enabled.

Install `agent-device` on the runner and pin its version. Android needs USB debugging and a connected, authorized device. The runner temporarily enables the tool's test keyboard for reliable text replacement and restores the previous keyboard when its session closes. iOS requires macOS, Xcode, a trusted device with Developer Mode enabled, and signing for the tool's XCTest runner. The existing iOS profile collector supports physical devices; simulator profiles are not inputs to a device build.

Create an ignored fixture, for example `.pgo/journey-fixture.json`:

```json
{
    "accountEmail": "heavy@example.com",
    "accountClass": "heavy",
    "description": "Owner-approved high-traffic test account with populated chats, expenses, and reports.",
    "report": {
        "query": "busy",
        "resultLabelPrefix": "#busy, Test workspace",
        "title": "#busy"
    },
    "personalChat": {
        "query": "heavy@example.com",
        "resultLabelPrefix": "Test User (you), heavy@example.com",
        "title": "Test User (you)"
    },
    "allowMessages": false,
    "scrolls": 8,
    "tabCycles": 3
}
```

Choose the report name and workspace from the actual account. Search matching permits a changing message preview after the configured identity, and rejects ambiguous results. The personal-chat query must be the exact approved account email. That result can show either the email or the latest message beneath its `(you)` title, so both forms are supported for repeated runs. Confirm the personal chat with Chris before setting `allowMessages` to `true`. Messages are restricted to that account's `(you)` chat; each run sends two uniquely marked test messages and leaves them in place. An existing composer draft causes a failure.

## Validate and record

First check the account and #focus setting without sending messages:

```bash
scripts/pgo/journey.ts android --device DEVICE_SERIAL --app-id APP_ID --fixture .pgo/journey-fixture.json --preflight
```

Use `--navigation-only` instead of `--preflight` to exercise all navigation and scrolling without sending messages. This mode cannot collect a training profile. Omit both flags for the complete journey once message permission is recorded in the fixture.

The complete journey relaunches the app, scrolls Inbox in both directions, opens and scrolls the selected report, composes two messages in the personal chat, scrolls Spend expenses and reports, switches between Inbox, Spend, and Workspaces three times, and reopens the report. Android also edits each draft before sending; iOS enters the final text once because replacing non-empty text in its composer was unreliable during live validation. The scroll count is a maximum per direction: two unchanged snapshots stop that direction at the list boundary. Scrolling must expose changing content; an empty or stationary list fails the run.

After installing and verifying an instrumented build with the existing PGO commands, collect three independent repetitions:

```bash
scripts/pgo/journey.ts android --device DEVICE_SERIAL --app-id APP_ID --fixture .pgo/journey-fixture.json --runs 3 --collect
scripts/pgo/journey.ts ios --device DEVICE_UDID --app-id BUNDLE_ID --fixture .pgo/journey-fixture.json --runs 3 --collect
```

Start with three repetitions per platform. Use the recorded duration and resulting native counter coverage to adjust the workload; extra repetitions of the same data do not add new paths. Most activity here exercises Hermes, Fabric mounting, layout, text, native input, and scrolling. This trains the compiled native implementation used by JavaScript; it does not compile the application's JavaScript with LLVM. Avoid spending most of the run waiting on network responses or looping over trivial settings screens.

On September 23, 2026, the Android navigation-only run completed in 6 minutes 7 seconds. Two complete instrumented recordings passed in 7 minutes 1 second and 6 minutes 55 seconds, excluding preflight. Each sent two messages and exported four raw profiles; both recordings merged successfully, separately and together. These timings include automation overhead and the final account/preference check; they are not app performance measurements. The first recording's four profiles were also checked individually for nonzero native counters.

On the same day, a complete instrumented iOS validation recording passed on a connected iPhone 13 Pro in 6 minutes 35 seconds, excluding preflight. A subsequent three-repetition training batch passed in 6 minutes 41 seconds, 6 minutes 35 seconds, and 6 minutes 37 seconds per journey. The batch exported six raw profiles and produced a 15 MB merged profile containing 77,590 functions. Every repetition sent two approved messages to the account's personal chat, then confirmed the heavy account and #focus off. These timings include automation overhead; they are not app performance measurements.

The collector checks that the installed app can flush profiles, discards setup output, clears previous device profiles, and starts a fresh process for each repetition. It flushes once after a successful journey and verification, then archives that run's raw files. It merges only after every requested repetition succeeds. Failed batches produce no final merged profile. A failed send is never retried automatically.

Each batch lives under `.pgo/<platform>/journeys/<timestamp>/` and includes `result.json`, per-run raw profiles, `journey.profdata`, and a function summary. The result records the fixture, app and device identifiers, both repository revisions, automation version, completed runs, and durations. These artifacts contain account identifiers and must stay in restricted CI storage.

The journey profile is kept separate from the startup profile. The existing optimized-build command reads `newdot.profdata` from its platform directory: CI must explicitly select or weight the successful scenario profiles, write that final input, and preserve the iOS `.format` marker. Do not silently replace the startup input with an incomplete navigation run.

## Release pipeline integration

Use an exclusive device lease on a persistent runner: Linux or macOS with an arm64 Android device, and macOS with an arm64 iPhone. Build the instrumented artifact from the release candidate, install it over the signed-in app, run preflight and the full collection, then build the optimized artifact from the same source and toolchain. Gate publication on a separate performance and correctness check. The instrumented artifact is a CI input, not the store upload.

Run these steps for each staging or production release candidate before publication. Pin the compiler, SDK, dependencies, architecture, build settings, and automation version; retain them alongside the profile. The current runner records source revisions but does not validate binary provenance. The release pipeline must enforce that the training artifact and optimized build match, and keep simultaneous jobs from sharing a device or profile output directory. Store signing credentials separately from the fixture.

This change supplies the journey and profile collection hook for local and CI execution. Connecting it to the store release workflows and measuring held-out interactive performance remain separate integration steps.
