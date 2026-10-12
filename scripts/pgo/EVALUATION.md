# Native PGO evaluation

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

The configured application and bundle identifiers must match the identifiers produced by the candidate's native configuration, environment and provisioning profile. These selectors do not rewrite native identifiers. A dedicated physical runner can use an existing matching identifier.

The account must already be signed in to the dedicated application. Authentication is never automated. The fixture must explicitly authorize the heavy account and any training messages to its personal chat. Other reports are read-only. Keep account fixtures, environment files and signing credentials on the protected runner. Store device serials and private fixture/environment paths in repository secrets so the Actions environment banner masks them. Application identifiers and nonsecret signing settings can use repository variables. Do not store fixture or environment contents in variables or artifacts.

The runner builds a baseline and instrumented Release, verifies instrumentation, then collects three complete journeys. It validates the archived profiles before building the optimized candidate. Android uses R8 while disabling FullStory build processing and upload phases. The runtime SDK may remain present. These dedicated evaluation builds are not store-equivalent releases.

The runner records twenty samples per binary for heavy report navigation, separate warm navigation and cold startup. It repeats each workload with the opposite binary order. Each binary gets a five-second cool-down followed by one discarded warm-up before the measured samples. Thermal state is not verified. Warm navigation paths overlap training, and the heavy report first-layout span may stop at a skeleton rather than fully loaded content.

Android frame telemetry is optional. Reports retain available native janky-frame counts and explicitly count unavailable observations. Those counters cover automation windows, with unverified reset and isolation boundaries. They do not establish isolated scrolling performance. No iOS frame metric is reported.

Before and after each accepted stage, the runner checks the candidate commits, evaluated source contents, toolchain, fixed environment, fixture, profile and artifact hashes. The reviewed measurement code is an explicit overlay on the candidate, with its own hash. For iOS, generated CocoaPods lock files must match across all three build modes. The runner retains those locks privately and restores only the original tracked lockfile bytes before checking source consistency.

Public artifacts contain numeric observations, distributions and hashes. Raw device output, screenshots, fixtures, environment values and detailed errors remain private on the runner. Private evidence lives under the candidate's ignored evaluation directory and needs a runner retention policy. Compiler consumption remains unverified in the public result unless execution evidence is independently established.

Automatic evaluations follow completed trusted staging or production deploy runs. A manual rerun selects a producer run ID and its current immutable attempt. The exact approved same-repository preview branch can run before merge. Forks and arbitrary heads cannot access device jobs. Preview reports stay in workflow summaries and artifacts. A deployment report can update only its version-matching labelled historical checklist; otherwise the workflow visibly skips the comment. Evaluation never promotes or replaces the ordinary native artifact.
