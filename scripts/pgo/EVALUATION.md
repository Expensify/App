# Evaluate native PGO in CI

<!-- cspell:ignore chrispader -->

This workflow runs the release-candidate evaluation plan on the real HybridApp, using disposable Android and iOS emulators instead of physical devices. It builds the baseline and instrumented apps, trains with three complete journeys on a test account, and builds the optimized app from that profile. It then benchmarks startup, the journey and the heavy report journey with 20 samples per app after one discarded warm-up. Each benchmark runs once with the baseline app first and once with the optimized app first.

The only setup it needs is a login for that test account, stored as three repository secrets. The removed E2E performance tests used the same secrets, so they may already exist.

## Step 1: Check the test account secrets

Open **Expensify/App → Settings → Secrets and variables → Actions** and look for these repository secrets:

| Secret | Required |
| --- | --- |
| `EXPENSIFY_PARTNER_PASSWORD_EMAIL` | Yes. The test account's email. |
| `EXPENSIFY_PARTNER_USER_ID` | Yes. The `partnerUserID` of a partner login for that account. |
| `EXPENSIFY_PARTNER_USER_SECRET` | Yes. The `partnerUserSecret` of that login. |
| `EXPENSIFY_PARTNER_NAME` and `EXPENSIFY_PARTNER_PASSWORD` | Only if another partner issued the login. Without them, the app uses its own partner name. |

The workflow also uses the existing `OS_BOTIFY_TOKEN` and `MAPBOX_SDK_DOWNLOAD_TOKEN` secrets.

If the three required secrets exist, go to step 3.

## Step 2: Add a test account login if the secrets are missing

1. Choose a dedicated test account that meets the [account requirements](#account-requirements).
2. Create a partner login for it, the same kind the E2E tests used.
3. Add the account email, the `partnerUserID` and the `partnerUserSecret` as the three required secrets from step 1.

## Step 3: Copy the branch to Expensify/App

You need permission to push branches to Expensify/App and Expensify/Mobile-Expensify. The copy script pushes the pinned native commit first, then the App branch. It preserves both commits and their signatures.

```bash
git clone --single-branch --branch @chrispader/perf/pgo-ci-app-evaluation git@github.com:margelo/Expensify.git expensify-pgo-ci
cd expensify-pgo-ci
./scripts/pgo/copy-ci-preview.sh
```

The push starts the workflow, before it is merged into main. New pushes to the copied branch start another run. The Margelo fork skips these jobs because it has no access to Expensify's private dependencies.

## Step 4: Watch the run

1. Open **Expensify/App → Actions → Evaluate native PGO on emulators**.
2. Open the run for the copied branch. It has a `train` job per platform, then a `benchmark` job per platform and order, then a `report` job. A hosted job stops after six hours, so each benchmark order runs in its own job.
3. Wait for the `report` job to finish. If a job fails, see [if a run fails](#if-a-run-fails).

Use **Re-run jobs** to repeat a run. The workflow installs the toolchains and creates the devices. It uses Android's debug signing key and disables iOS signing, so it needs no device IDs, certificates or environment files.

## Step 5: Read the report

The `report` job adds the evaluation report to the run page and uploads it as `pgo-evaluation-report`. Each platform shows as passed, failed at a named stage, or missing if it never produced a result. A passed platform lists startup, journey and heavy-journey results for both orders.

The other artifacts hold the public inputs to that report. `pgo-training-<platform>` has the training result, the profile and its function listing. `pgo-benchmark-<platform>-<order>` has the samples for one order. Every job uploads its result, even when it fails.

## Account requirements

The journeys drive the real app, so the test account needs data to work with. A run that fails on these requirements stops after the builds, roughly an hour in. If you can open the account in a browser, check it first.

- It signs in to New Expensify, not Expensify Classic, and uses English.
- It has one `#announce` room, and that room has many messages. The journeys open it as their busy report.
- Its Spend tab has enough expenses and expense reports to scroll.
- It can receive test messages in its own `(you)` chat. Each training journey sends two marked messages there and leaves them in place.

## How the workflow uses the account

The emulator builds start from `src/PgoEmulatorApp.ts`, which runs the normal app and signs it in with the partner login. It then hands the session to Expensify Classic, as a normal HybridApp sign-in does. Without that handoff, HybridApp would sign New Expensify out on every launch. The runner places the login on the disposable device after installing the app, so no app or uploaded file contains it. Classic keeps the login to stay signed in, and signing out could revoke it for every later run, so nothing in the workflow signs out. The app signs in again on the first launch after 30 minutes, so no journey starts with an old session. If sign-in fails, the app writes the reason next to the login file and the runner prints it.

The journeys also need a fixture that names the account, the chat that receives the training messages, and the busy report to open. The runner builds it after signing in. It takes the email from the secret, and reads the account's own chat and its `#announce` room from the app's search. The fixture stays on the runner. To open a different busy chat, change `BUSY_REPORT` in `scripts/pgo/emulatorAccount.ts`.

The rollout uses dedicated phones instead. Someone signs each phone in by hand once and leaves a fixture file on its runner, so the rollout needs no partner login.

## If a run fails

| The run stops at | What it means |
| --- | --- |
| `Check repository secrets` | A required secret is missing. The error names it. |
| `build-release`, `build-instrumented` or `build-optimized` | A native build failed. The job log has the compiler error. |
| `account-preflight` | The app did not sign in, or search found no single `(you)` chat or `#announce` room. Check the [account requirements](#account-requirements). |
| `training` | A training journey failed, for example because a Spend list had nothing to scroll. The job log names the journey step. |
| A benchmark stage, such as `journey-release-first` | A benchmark run failed in that scenario and order. The job log shows the failing step. |

## Interpret the result

A complete report shows that the real app trains, builds with its profile, and benchmarks with the same steps and sample counts as a release-candidate evaluation. The emulators run on shared hosted machines. The Android app is an x86_64 build without R8, and the iOS simulator app targets a different platform than a phone. Their timings do not establish phone performance, and their profiles must not be used for store builds. The workflow does not change deployments or choose a production binary.
