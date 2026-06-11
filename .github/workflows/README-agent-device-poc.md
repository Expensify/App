# agent-device CI sanity checks (Android POC)

Proof-of-concept implementation of the research artifact
[`agent-device-ci-research.html`](../../../Expensify/App/agent-device-ci-research.html)
— "Triggering agent-device sanity checks at every PR stage."

This POC implements phases **P1** (prove the Android device lane in CI)
and **P2** (on-demand command + PR QA-step ingestion) on default GitHub
free `ubuntu-latest` runners with no external device infra.

## Pieces

| File | Role |
| --- | --- |
| [`agentDeviceSanity.yml`](agentDeviceSanity.yml) | Dispatcher. Reacts to `/agent-device` PR comments, the `agent-device` label, or manual dispatch. Gates on `isAuthorizedContributor`, parses QA Steps out of the PR body, hands off to the reusable run workflow. |
| [`agentDeviceRun.yml`](agentDeviceRun.yml) | Reusable Android device job. Boots an emulator via `reactivecircus/android-emulator-runner`, downloads the POC APK, runs the QA script, uploads evidence, publishes JUnit, posts a PR comment. |
| [`../../scripts/ci/agent-device-qa.sh`](../../scripts/ci/agent-device-qa.sh) | Runs inside the booted emulator. Install + open + randomized sign-in, then P1 fixed sanity (`agent-device test`) + P2 QA-step runner (Cursor Agent CLI, headless). |

## Triggers

The workflow is **on-demand only** — nothing runs unless someone asks.
Any of the three triggers below works at any PR stage (draft, ready,
approved):

1. **Comment** on a PR: `/agent-device`
2. **Label** a PR with `agent-device`
3. **workflow_dispatch** from the Actions tab with a `pr` number

The dispatcher gates every invocation on the existing
[`isAuthorizedContributor`](../actions/javascript/isAuthorizedContributor/action.yml)
action, so fork PRs need an authorized actor before any device job
starts.

## What runs

Inside the booted Android emulator:

1. **Install + open** the POC APK.
2. **Sign in** with a one-shot randomized email
   (`<name>_<surname>+<rand>@gmail.com`) via the existing
   [`sign-in.ad`](../../.claude/skills/agent-device/flows/macros/sign-in.ad)
   macro. The randomized address per-run avoids account flagging and
   removes the need for OTP wiring in the POC.
3. **P1 — hard signal.** Run a fixed sanity suite via `agent-device
   test`: sign-in + [`open-search-router.ad`](../../.claude/skills/agent-device/flows/tests/open-search-router.ad).
   Produces JUnit (`out/junit.xml`) that drives the GitHub check.
4. **P2 — advisory.** Hand the PR's parsed QA Steps to the
   [Cursor Agent CLI](https://cursor.com/docs/cli/headless) running in
   headless print mode (`cursor-agent -p --force --trust --model
   composer-2.5`). The agent maps each step to a known `.ad` flow under
   `.claude/skills/agent-device/flows/` or improvises agent-device
   actions (snapshot → find/press/fill → verify), capturing per-step
   screenshots and writing `out/junit-p2.xml` + `out/p2-summary.md`.

Both produce artifacts under `out/` (uploaded as
`agent-device-evidence-pr-<n>`) and feed a per-step markdown summary
posted back to the PR as a comment.

A full **screen recording** (`out/recording.mp4`) covers everything
from sign-in through P1 and P2 — captured via `agent-device record
start/stop` and finalized in a trap so partial videos are still saved
on early aborts (e.g. infra failures).

## Free-runner constraints baked in

Standard GitHub-hosted `ubuntu-latest` = 2 vCPU / 7 GB RAM / ~14 GB
free disk. Everything below is set to make a green check on that
hardware repeatable:

- AVD: `x86_64`, `api-level 33`, `google_apis` (not `playstore`),
  `pixel_6` profile, `ram-size 3072`, `heap-size 576`, `disk-size 6G`.
- Headless launch flags: `-no-window -no-snapshot-save -noaudio
  -no-boot-anim -gpu swiftshader_indirect -camera-back none`.
- Disk pre-cleanup step removes the largest preinstalled toolchains
  before SDK install.
- KVM is enabled via a udev rule and verified (`/dev/kvm` must exist);
  missing KVM aborts the run as an **infra failure**, not a PR fault.
- An `actions/cache` step warms and caches the AVD so repeat runs
  start from a snapshot.
- `timeout-minutes: 60` with concurrency-cancel per PR so a single PR
  never queues multiple device jobs.

## Infra failure classification

`agent-device-qa.sh` distinguishes **infra failures** (no emulator
visible to adb, boot timeout, install/open failure) from **assertion
failures** (a flow's `@post` selector didn't resolve). Infra failures
exit `0` at the script level and surface as `Run classification:
infra-failure` in the PR comment so the PR is never flagged red for
runner issues.

## Secrets

| Secret | Required | Purpose |
| --- | --- | --- |
| `POC_APK_URL` | **Yes** | URL the runner curls to download the Android APK under test. Lets us rotate the artifact without touching code. For this POC, use the static S3 URL provided in the project handoff. Post-POC this is replaced by per-PR artifact resolution. |
| `CURSOR_API_KEY` | Yes for P2 | Drives the Cursor Agent QA-step runner. Without it, P2 is skipped with a note in the PR comment and only P1 produces a signal. Get one at [cursor.com/dashboard/integrations](https://cursor.com/dashboard/integrations) (personal) or **Team Settings → Service accounts** (recommended for shared CI). |

Add at `Settings → Secrets and variables → Actions → New repository secret`.

The dispatcher uses a lightweight inline authorization gate based on
GitHub's `author_association` (`OWNER` / `MEMBER` / `COLLABORATOR`)
plus `workflow_dispatch`. No `OS_BOTIFY_TOKEN` is required for the
POC. Tighten this gate (e.g. by reintroducing
[`isAuthorizedContributor`](../actions/javascript/isAuthorizedContributor/action.yml))
before any public-repo rollout.

## Scope and TODOs (post-POC)

- **APK source.** This POC downloads the APK from the URL stored in
  the `POC_APK_URL` secret. Production wiring should resolve the
  per-PR artifact produced by [`buildAdHoc.yml`](buildAdHoc.yml) (or,
  post-POC, agent-device's `install-from-source
  --github-actions-artifact` server-side resolution).
- **iOS.** Out of POC scope. Adding it later means either a Simulator
  `.app` build target or a cloud real-device lease using the existing
  Adhoc IPA (Option B in the research doc).
- **Auth hardening.** Randomized-email-only sign-in works because the
  current `sign-in.ad` macro does not require OTP. Once the magic-code
  step is needed (or to remove the "throwaway-email" footgun), wire a
  mailbox/secret-backed OTP source into the sign-in flow.
- **Tighten the QA-step runner's tool surface.** `cursor-agent` does
  not expose a Claude-Code-style `--allowedTools` whitelist. The POC
  relies on the prompt to constrain the agent to `agent-device`
  invocations. To make that a hard guarantee, wrap `agent-device` in a
  stdio MCP server and pass only that MCP to the agent.
- **Evidence privacy.** Screenshots and video are uploaded as a
  workflow artifact (7-day retention). On a public repo, also consider
  posting evidence privately and linking, plus token/PII redaction in
  captured logs.
- **Promotion to required check.** Once matched-flow assertions are
  trusted from real flake data, promote P1 from advisory to a required
  status. P2 stays advisory until QA-step → action mapping accuracy is
  measured.
- **Flow rot.** Add a scheduled run against `main` to surface
  selector/flow drift before it lands on a PR.

## Manual smoke test

```bash
gh workflow run agentDeviceSanity.yml -f pr=<your-PR-number>
```

Or comment `/agent-device` on a PR. Watch the run in the Actions tab;
evidence appears as an artifact and a results comment is posted to the
PR.
