# Evaluate native PGO in CI

<!-- cspell:ignore chrispader -->

This workflow runs the release-candidate evaluation plan on the real HybridApp, using disposable Android and iOS emulators instead of physical devices. It builds the baseline and instrumented apps, trains with three complete journeys on the CI test account, and builds the optimized app from that profile. It then benchmarks startup, the journey and the heavy report journey with 20 samples per app after one discarded warm-up. Each benchmark runs once with the baseline app first and once with the optimized app first.

## Run the combined PR

You need permission to push branches to Expensify/App and Expensify/Mobile-Expensify.

1. In **Expensify/App → Settings → Secrets and variables → Actions**, add or confirm these repository secrets:

   | Secret | Purpose |
   | --- | --- |
   | `OS_BOTIFY_TOKEN` | Read App and the private Mobile-Expensify repository |
   | `MAPBOX_SDK_DOWNLOAD_TOKEN` | Download the native Mapbox SDK |
   | `EXPENSIFY_PARTNER_PASSWORD_EMAIL` | Email of the CI test account |
   | `EXPENSIFY_PARTNER_USER_ID` | Partner user ID of the CI test account |
   | `EXPENSIFY_PARTNER_USER_SECRET` | Partner user secret of the CI test account |
   | `EXPENSIFY_PARTNER_NAME`, `EXPENSIFY_PARTNER_PASSWORD` | Optional partner that issued those credentials. Without them, the app uses its own partner name. |
   | `PGO_JOURNEY_FIXTURE` | Journey fixture JSON for the CI test account |

   The partner secrets have the names the removed E2E workflow used. Use a dedicated heavy NewDot account in English, with a populated Inbox, a long chat history, and enough expenses and reports to scroll. Write its fixture as described in the [journey guide](./JOURNEY.md#account-and-device-setup) and set `allowMessages` to `true`. Each training journey sends two marked test messages to the account's own `(you)` chat.

2. Check out the combined branch and run its copy script. The script copies the pinned native commit first, then pushes the App branch. It preserves both commits and their signatures.

   ```bash
   git clone --single-branch --branch @chrispader/perf/pgo-ci-app-evaluation git@github.com:margelo/Expensify.git expensify-pgo-ci
   cd expensify-pgo-ci
   ./scripts/pgo/copy-ci-preview.sh
   ```

3. Open **Expensify/App → Actions → Evaluate native PGO on emulators**. The App push starts the run before the workflow is merged into main. Each platform trains first, then benchmarks both orders in separate jobs, because a hosted job stops after six hours. The report job adds the summary to the run page and uploads it as `pgo-evaluation-report`. Use **Re-run jobs** to repeat the run.

The workflow installs the toolchains, creates the devices, uses Android's debug signing key, and disables iOS signing. You do not need device IDs, signing certificates, environment files, an AWS account, or a local dependency install. New pushes to the copied branch start another run. The Margelo fork skips the native jobs because it does not own Expensify's private dependency access.

The emulator builds start from `src/PgoEmulatorApp.ts`, which runs the normal app and signs it in with the partner credentials. The runner writes those credentials to the app's storage on the disposable device after installing it, so no app or uploaded file contains them. The app stores only the session, so signing out cannot revoke the CI login. It signs in again on the first launch after 30 minutes, so no journey starts with an old session.

Every job uploads its public result, even when it fails. `pgo-training-<platform>` holds the training result, the profile and its function listing. `pgo-benchmark-<platform>-<order>` holds the samples for one order. The report marks a platform as failed at the stage that stopped it, or as missing if it never produced a result. The raw journey results contain account details, so they stay on the runner.

## Interpret the result

A complete report shows that the real app trains, builds with its profile, and benchmarks with the same steps and sample counts as a release-candidate evaluation. The emulators run on shared hosted machines. The Android app is an x86_64 build without R8, and the iOS simulator app targets a different platform than a phone. Their timings do not establish phone performance, and their profiles must not be used for store builds. The workflow does not change deployments or choose a production binary.
