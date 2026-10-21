# Verify native PGO in CI

<!-- cspell:ignore chrispader -->

This workflow builds baseline and instrumented HybridApps, runs a bundled synthetic workload three times, merges the native profiles, and rebuilds with PGO. It then runs both baseline and optimized apps on disposable Android and iOS emulators. The workload requires no test account or API credentials.

## Run the combined PR

You need permission to push branches to Expensify/App and Expensify/Mobile-Expensify.

1. In **Expensify/App → Settings → Secrets and variables → Actions**, confirm these existing repository secrets are available:

   | Secret | Purpose |
   | --- | --- |
   | `OS_BOTIFY_TOKEN` | Read App and the private Mobile-Expensify repository |
   | `MAPBOX_SDK_DOWNLOAD_TOKEN` | Download the native Mapbox SDK |

2. Check out the combined branch and run its copy script. The script copies the pinned native commit first, then pushes the App branch. It preserves both commits and their signatures.

   ```bash
   git clone --single-branch --branch @chrispader/perf/pgo-ci-verification git@github.com:margelo/Expensify.git expensify-pgo-ci
   cd expensify-pgo-ci
   ./scripts/pgo/copy-ci-preview.sh
   ```

3. Open **Expensify/App → Actions → Verify native PGO on emulators**. The App push starts both jobs automatically, before the workflow is merged into main. Confirm both jobs pass and download `pgo-emulator-android` and `pgo-emulator-ios` for their reports and profiles. Use **Re-run jobs** to repeat the run.

The workflow installs the toolchains, creates the devices, uses Android's debug signing key, and disables iOS signing. You do not need device IDs, signing certificates, environment files, an AWS account, or a local dependency install. New pushes to the copied branch start another run. The Margelo fork skips the native jobs because it does not own Expensify's private dependency access.

Each report records the App and native commits, artifact hashes, profile counts, and successful synthetic workload samples. A failed build, incomplete workload, or invalid profile fails the job and leaves the available evidence in its artifact.

## Interpret the result

Passing verifies the native profile generation, collection, merge, and optimized rebuild on the emulator target. The bundled workload renders synthetic report and expense lists instead of loading the signed-in Expensify app. Its timings do not establish phone performance, and its profiles must not be used for device releases. The workflow does not change deployments or choose a production binary.
