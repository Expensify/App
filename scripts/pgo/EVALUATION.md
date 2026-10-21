# Native PGO evaluation

<!-- cspell:ignore chrispader -->

The evaluation workflow measures a native candidate without selecting a release artifact or changing deployment. It records the actual App checkout, Mobile gitlink, version and producer attempt before evaluating each platform whose native build succeeded. A failed web deployment does not invalidate an otherwise successful native build.

Each platform uses a dedicated physical runner. Its concurrency queue preserves up to 100 pending evaluations instead of replacing the previous pending candidate. Monitor the queue and rerun candidates if that limit is exceeded. Configure the `pgo-android` and `pgo-ios` runner labels and these settings before enabling device jobs:

| Variable | Required runner configuration |
| --- | --- |
| `PGO_ANDROID_DEVICE_ID` | The approved physical Android serial |
| `PGO_ANDROID_APP_ID` | The dedicated evaluation application identifier |
| `PGO_ANDROID_FIXTURE_PATH` | An absolute path to the privately provisioned approved account fixture |
| `PGO_ANDROID_ENVFILE` | An absolute path to the fixed merged Android Release environment file |
| `PGO_IOS_DEVICE_ID` | The approved physical iPhone UDID |
| `PGO_IOS_APP_ID` | The dedicated evaluation bundle identifier |
| `PGO_IOS_FIXTURE_PATH` | An absolute path to the privately provisioned approved account fixture |
| `PGO_IOS_ENVFILE` | An absolute path to the fixed merged iOS Release environment file |
| `IOS_CODE_SIGNING_ALLOWED` | `true` for physical-device iOS evaluation |
| `IOS_DEVELOPMENT_TEAM` | The authorized Apple development team identifier |

The iOS runner also needs an installed development certificate and a provisioning profile that permits the selected physical iPhone and dedicated bundle identifier. Configure the signing variables as repository variables. Keep certificate material and signing credentials private on the runner.

Android CI signing uses a private keystore on the runner. Set repository secrets `PGO_ANDROID_KEYSTORE_PATH`, `PGO_ANDROID_KEYSTORE_PASSWORD`, `PGO_ANDROID_KEY_ALIAS` and `PGO_ANDROID_KEY_PASSWORD`. The path must be absolute and outside the checkout so cleanup does not delete the key. The evaluation build uses this signing configuration without changing tracked native files. When no keystore path is supplied, local builds retain their existing signing configuration. Keep the same key across runs so updates preserve the signed-in app's data.

The configured application and bundle identifiers must match the identifiers produced by the candidate's native configuration, environment and provisioning profile. These selectors do not rewrite native identifiers. A dedicated physical runner can use an existing matching identifier.

The account must already be signed in to the dedicated application. Authentication is never automated. The fixture must explicitly authorize the heavy account and any training messages to its personal chat. Other reports are read-only. Keep account fixtures, environment files and signing credentials on the protected runner. Store device serials and private fixture/environment paths in repository secrets so the Actions environment banner masks them. Application identifiers and nonsecret signing settings can use repository variables. Do not store fixture or environment contents in variables or artifacts.

The runner builds a baseline and instrumented Release, verifies instrumentation, then collects three complete journeys. It validates the archived profiles before building the optimized candidate. Android uses R8 while disabling FullStory build processing and upload phases. The runtime SDK may remain present. These dedicated evaluation builds are not store-equivalent releases.

The runner records twenty samples per binary for heavy report navigation, separate warm navigation and cold startup. It repeats each workload with the opposite binary order. Each binary gets a five-second cool-down followed by one discarded warm-up before the measured samples. Thermal state is not verified. Warm navigation paths overlap training, and the heavy report first-layout span may stop at a skeleton rather than fully loaded content.

Android frame telemetry is optional. Reports retain available native janky-frame counts and explicitly count unavailable observations. Those counters cover automation windows, with unverified reset and isolation boundaries. They do not establish isolated scrolling performance. No iOS frame metric is reported.

Before and after each accepted stage, the runner checks the candidate commits, evaluated source contents, toolchain, fixed environment, fixture, profile and artifact hashes. The reviewed measurement code is an explicit overlay on the candidate, with its own hash. For iOS, generated CocoaPods lock files must match across all three build modes. The runner retains those locks privately and restores only the original tracked lockfile bytes before checking source consistency.

Public artifacts contain numeric observations, distributions and hashes. Raw device output, screenshots, fixtures, environment values and detailed errors remain private on the runner. Private evidence lives under the candidate's ignored evaluation directory and needs a runner retention policy. Compiler consumption remains unverified in the public result unless execution evidence is independently established.

Automatic evaluations follow completed trusted staging or production deploy runs. A manual rerun selects a producer run ID and its current immutable attempt. The exact approved same-repository preview branch can run before merge. Forks and arbitrary heads cannot access device jobs. Preview reports stay in workflow summaries and artifacts. A deployment report can update only its version-matching labelled historical checklist; otherwise the workflow visibly skips the comment. Evaluation never promotes or replaces the ordinary native artifact.

## Run the combined flow before merging

The combined verification branch contains the App foundation, evaluation scripts and CI workflow. Its `Mobile-Expensify` gitlink pins the native PGO hooks together with the native revision from App main. The smaller review PRs remain separate. Use this branch to verify the complete report-only flow without starting a deployment or merging the prerequisites first.

1. Set up protected self-hosted runners with labels `pgo-android` and `pgo-ios` in Expensify/App. Connect one authorized physical arm64 Android device and one trusted, unlocked physical iPhone. Reserve each device for its evaluation job. Android needs the repository's JDK, SDK and NDK, with `ANDROID_HOME` and `ANDROID_NDK_HOME` available to the runner service. iOS needs macOS, the repository's Xcode and Ruby toolchain, Bundler, CocoaPods, development signing for the app and extensions, and a signed `agent-device` XCTest runner. Pin `agent-device` to version `0.20.6` on both runners and expose it on the service's `PATH`.
2. Complete the repository's normal HybridApp environment setup on each runner, including private dependency credentials. Keep the approved fixture, fixed merged Release environment file and signing material outside the checkout. Set `STANDALONE_NEW_DOT=false`. The workflow installs both App and Mobile-Expensify dependencies; the PGO builds select HybridApp and build React Native and Hermes from source through Rock.
3. In **Expensify/App → Settings → Secrets and variables → Actions**, configure the secrets and variables below. These are repository settings; this workflow does not select a GitHub environment, so environment-only secrets are insufficient. Enable the approved workflow actions and grant the runners access to this repository.

   | Repository secrets | Value |
   | --- | --- |
   | `OS_BOTIFY_TOKEN` | A token authorized to read App and the private Mobile-Expensify repository, used for the recursive checkout |
   | `PGO_ANDROID_DEVICE_ID`, `PGO_IOS_DEVICE_ID` | The corresponding physical device identifiers |
   | `PGO_ANDROID_FIXTURE_PATH`, `PGO_IOS_FIXTURE_PATH` | Absolute paths to the approved JSON fixtures on the corresponding runners |
   | `PGO_ANDROID_ENVFILE`, `PGO_IOS_ENVFILE` | Absolute paths to the fixed merged Release environment files |
   | `PGO_ANDROID_KEYSTORE_PATH` | Absolute path to the Android evaluation keystore |
   | `PGO_ANDROID_KEYSTORE_PASSWORD`, `PGO_ANDROID_KEY_ALIAS`, `PGO_ANDROID_KEY_PASSWORD` | Credentials for that evaluation key |

   | Repository variables | Value |
   | --- | --- |
   | `PGO_ANDROID_APP_ID` | The application ID produced by the checked-in Android Release configuration |
   | `PGO_IOS_APP_ID` | The bundle ID produced by the checked-in iOS Release configuration |
   | `IOS_CODE_SIGNING_ALLOWED` | `true` |
   | `IOS_DEVELOPMENT_TEAM` | The Apple team authorized for the app, extensions and physical iPhone |

   The workflow's `GITHUB_TOKEN` supplies its own App metadata, artifact and issue-comment permissions. No additional reporting token is needed. Do not put fixture contents, environment contents or certificate material into these path settings.

4. Install an app with the same identifier and signing identity on each dedicated device and sign into the approved high-traffic account manually. Follow [the fixture setup](./JOURNEY.md#account-and-device-setup) and set `allowMessages: true` only with the owner's approval. Training sends two test messages per journey to that account's personal chat. The fixture's report must contain enough content to scroll. Keep the account signed in between builds; the runner installs updates without clearing app data. If `SIGN_IN_REQUIRED` appears, sign in on the physical device and rerun the failed job.
5. Copy both combined branch tips into the Expensify repositories without squashing or cherry-picking them. The App gitlink must continue to point to the exact native commit. From a clone of Expensify/App with its native submodule available, run:

   ```bash
   git -C Mobile-Expensify fetch https://github.com/margelo/Mobile-Expensify.git @chrispader/perf/pgo-ci-verification
   git -C Mobile-Expensify push git@github.com:Expensify/Mobile-Expensify.git FETCH_HEAD:refs/heads/@chrispader/perf/pgo-ci-verification
   git fetch https://github.com/margelo/Expensify.git @chrispader/perf/pgo-ci-verification
   git push git@github.com:Expensify/App.git FETCH_HEAD:refs/heads/@chrispader/perf/pgo-ci-verification
   ```

   Preserve an existing upstream branch before replacing it. The fork PR intentionally skips device jobs. Copying the native branch makes the pinned native commit fetchable from the private upstream repository; it does not merge either PR.

6. Open a PR **within Expensify/App**, from `@chrispader/perf/pgo-ci-verification` to `main`. That exact branch name is required by both the workflow and candidate resolver. The `opened`, `synchronize` and `reopened` events run **Evaluate native PGO candidate** from the PR head. After reviewing the copied code, allow its jobs onto the protected runners. A new commit or closing and reopening this same-repository PR triggers another attempt. No staging or production deployment is needed for this preview.
7. Open the run and verify `prepare`, both `evaluate` matrix jobs, and `report`. Each device job builds baseline and instrumented binaries, verifies native instrumentation, collects three complete training journeys, validates and merges their profiles, builds the optimized binary, and compares both binaries in both build orders. Inspect `pgo-evaluation-plan`, `pgo-evaluation-android`, `pgo-evaluation-ios` and `pgo-evaluation-report`. Confirm the plan matches the App head and native gitlink, both platform results report `status: passed`, and their samples cover startup, warm navigation and the heavy report. Inspect the private runner logs for unexpected JavaScript errors. A green report job alone does not mean device evaluation succeeded; failed platform results remain visible in the report. Preview runs publish artifacts and a summary without commenting on a deployment checklist.

`workflow_run` and the manual **Run workflow** entry point require the workflow to exist on the default branch. They are separate from the PR trigger above. After the reviewed workflow and prerequisites land upstream, a new native staging or production deployment records its candidate metadata and starts evaluation automatically. To repeat one, select its completed deployment run ID as `producer_run_id` and choose `both`, `android` or `ios`. Older deployments without the `pgo-native-candidate-<attempt>` artifact cannot be evaluated through that entry point. Results attach only to the matching deployment checklist, and evaluation never changes the binary selected for deployment.
