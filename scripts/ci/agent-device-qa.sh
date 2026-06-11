#!/usr/bin/env bash
#
# agent-device-qa.sh
#
# Runs inside the booted Android emulator (called from the `script:`
# block of reactivecircus/android-emulator-runner). Drives the POC APK
# through:
#
#   1. install + open
#   2. randomized sign-in (P1 hard signal)
#   3. fixed P1 sanity flow (open-search-router) via `agent-device test`
#   4. P2 QA-step runner: a Claude Code headless agent that interprets
#      $QA_STEPS, maps each step to a known .ad flow under
#      .claude/skills/agent-device/flows/, or improvises agent-device
#      actions when no flow matches.
#
# Outputs all evidence (JUnit, screenshots, summary) into $ARTIFACTS_DIR.
# Infra failures (emulator/network/install) are classified separately
# from assertion failures so a red check means "your PR broke something."
#
# Environment (provided by the workflow):
#   APK_PATH          absolute path to the downloaded Expensify-adhoc.apk
#   BUNDLE_ID         android package id (detected via aapt2)
#   ARTIFACTS_DIR     absolute path for JUnit + screenshots + summary
#   QA_STEPS          PR-body QA Steps text (free-form markdown)
#   PR_NUMBER         PR number (used only for log breadcrumbs)
#   CURSOR_API_KEY    API key for the Cursor Agent QA-step runner (P2).
#                     Get one at cursor.com/dashboard/integrations (user
#                     key) or Team Settings -> Service accounts (team).

set -uo pipefail

# ---------- Required env --------------------------------------------------
for v in APK_PATH BUNDLE_ID ARTIFACTS_DIR QA_STEPS; do
  if [ -z "${!v:-}" ]; then
    echo "Missing required env: $v" >&2
    exit 2
  fi
done

mkdir -p "$ARTIFACTS_DIR/artifacts" "$ARTIFACTS_DIR/screenshots"
JUNIT_PATH="$ARTIFACTS_DIR/junit.xml"
SUMMARY_PATH="$ARTIFACTS_DIR/summary.md"

# Initialise the exit codes early so write_summary can always reference
# them, even when a phase aborts before running.
P1_EXIT=1
P2_EXIT=0
INFRA_FAILURE=0

# ---------- Helpers (defined before any use) ------------------------------
mark_infra_failure() {
  INFRA_FAILURE=1
  echo "::error title=Infra failure::$1"
}

write_summary() {
  local outcome="$1"
  local note="${2:-}"
  {
    echo "### Outcome"
    echo
    echo "- **P1 sanity (hard signal):** $( [ "$P1_EXIT" -eq 0 ] && echo PASS || echo FAIL ) (exit $P1_EXIT)"
    echo "- **P2 QA-step runner (advisory):** $( [ "$P2_EXIT" -eq 0 ] && echo PASS || echo FAIL ) (exit $P2_EXIT)"
    echo "- **Run classification:** $outcome"
    if [ -n "$note" ]; then
      echo
      echo "> $note"
    fi
    echo
    echo "### P2 (QA-step runner) details"
    echo
    if [ -s "${P2_SUMMARY:-}" ]; then
      cat "$P2_SUMMARY"
    else
      echo "_no summary written_"
    fi
    echo
    echo "### Evidence"
    echo
    echo "- JUnit: \`out/junit.xml\` (P1) and \`out/junit-p2.xml\` (P2)"
    echo "- Screenshots and recordings under \`out/screenshots/\` and \`out/artifacts/\`"
  } > "$SUMMARY_PATH"
}

abort_infra() {
  mark_infra_failure "$1"
  write_summary "infra-failure" "An infrastructure failure was detected; this is NOT a PR fault."
  # Exit 0 so the workflow step succeeds even on infra failure - the PR
  # comment + summary make the classification visible without flagging
  # the PR red.
  exit 0
}

# ---------- Randomized email (per plan: no OTP wiring) --------------------
NAMES=(alex sam riley jordan taylor casey morgan jamie skyler quinn)
SURNAMES=(rivers stone hayes parker reed brooks blake mercer hale dale)
NAME="${NAMES[$RANDOM % ${#NAMES[@]}]}"
SURNAME="${SURNAMES[$RANDOM % ${#SURNAMES[@]}]}"
RAND_DIGITS=$((RANDOM % 99999))
EMAIL="${NAME}_${SURNAME}+${RAND_DIGITS}@gmail.com"
echo "Generated test email: $EMAIL"

# ---------- Preflight: emulator reachable --------------------------------
echo "::group::Preflight"
if ! adb devices | grep -q "emulator-"; then
  abort_infra "No emulator device visible to adb."
fi
adb wait-for-device
# Wait for boot completion with a hard cap so a stuck boot becomes infra.
boot_completed=""
for _ in $(seq 1 60); do
  boot_completed="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r\n')"
  if [ "$boot_completed" = "1" ]; then break; fi
  sleep 2
done
if [ "$boot_completed" != "1" ]; then
  abort_infra "Emulator did not finish booting within 120s."
fi
adb shell input keyevent 82 || true
echo "Emulator booted; adb devices:"
adb devices
echo "::endgroup::"

# ---------- Install + open -----------------------------------------------
echo "::group::Install + open"
if ! agent-device install "$BUNDLE_ID" "$APK_PATH" --platform android; then
  abort_infra "agent-device install failed for $BUNDLE_ID."
fi
if ! agent-device open "$BUNDLE_ID" --platform android; then
  abort_infra "agent-device open failed for $BUNDLE_ID."
fi
agent-device screenshot --output "$ARTIFACTS_DIR/screenshots/00-launch.png" \
  --platform android >/dev/null 2>&1 || true
echo "::endgroup::"

# ---------- P1: fixed sanity suite ---------------------------------------
# Two-phase, matching the agent-device SKILL.md pattern:
#   1. `agent-device replay` the sign-in macro (macros are not picked up
#      by `agent-device test`, which only considers tests/*.ad files).
#   2. `agent-device test` the actual signed-in test(s), producing the
#      JUnit hard signal with retries + per-test artifacts.
echo "::group::P1 - sign-in (replay)"
SKILLS_DIR=".claude/skills/agent-device/flows"
P1_JUNIT="$ARTIFACTS_DIR/junit-p1.xml"
P1_EXIT=1

set +e
agent-device replay \
  "$SKILLS_DIR/macros/sign-in.ad" \
  --platform android \
  -e "EMAIL=$EMAIL"
SIGNIN_EXIT=$?
set -e
echo "Sign-in exit: $SIGNIN_EXIT"
echo "::endgroup::"

if [ "$SIGNIN_EXIT" -ne 0 ]; then
  # Sign-in failure isn't infra - it's a real PR-relevant signal (the
  # app couldn't get past sign-in). Skip the test suite and report.
  echo "Sign-in failed; skipping P1 test suite."
  P1_EXIT="$SIGNIN_EXIT"
  agent-device screenshot --output "$ARTIFACTS_DIR/screenshots/01-signin-failed.png" \
    --platform android >/dev/null 2>&1 || true
else
  echo "::group::P1 - fixed sanity suite (test)"
  set +e
  agent-device test \
    "$SKILLS_DIR/tests/open-search-router.ad" \
    --platform android \
    --report-junit "$P1_JUNIT" \
    --artifacts-dir "$ARTIFACTS_DIR/artifacts" \
    --retries 1 \
    --timeout 180000
  P1_EXIT=$?
  set -e

  if [ ! -s "$P1_JUNIT" ]; then
    # agent-device test exited without writing a JUnit. Could be a tool
    # usage error or a real runner crash - either way it's not the PR's
    # fault, but flag it distinctly from a clean assertion failure.
    mark_infra_failure "P1 test runner produced no JUnit report (tool error or runner crash; see job log)."
  fi
  echo "P1 exit: $P1_EXIT"
  echo "::endgroup::"
fi

# ---------- P2: QA-step runner (Cursor Agent CLI, headless) --------------
# Free-form QA Steps -> .ad flows or improvised agent-device actions.
# Per the research doc this path is *advisory* until trust is built; the
# P1 suite remains the hard signal.
#
# Tooling note: cursor-agent does not expose a Claude-Code-style
# `--allowedTools` whitelist. The CI runner is ephemeral, so we rely on
# the prompt to constrain the agent to `agent-device` invocations and
# the workspace's flow library. Tightening this later (stdio MCP server
# wrapping agent-device) is tracked in the POC README.
echo "::group::P2 - QA-step runner (cursor-agent)"
P2_JUNIT="$ARTIFACTS_DIR/junit-p2.xml"
P2_SUMMARY="$ARTIFACTS_DIR/p2-summary.md"
QA_STEPS_FILE="$ARTIFACTS_DIR/qa-steps.md"
printf '%s\n' "$QA_STEPS" > "$QA_STEPS_FILE"

if [ -z "${CURSOR_API_KEY:-}" ]; then
  echo "CURSOR_API_KEY not set; skipping P2 (advisory step)." | tee "$P2_SUMMARY"
elif ! command -v cursor-agent >/dev/null 2>&1; then
  echo "cursor-agent CLI not installed; skipping P2 (advisory step)." | tee "$P2_SUMMARY"
else
  PROMPT_FILE="$ARTIFACTS_DIR/p2-prompt.md"
  {
    echo "You are running INSIDE a CI job, against a real Android emulator that"
    echo "already has the Expensify app installed, opened and signed in as"
    echo "${EMAIL}. Your task: execute the QA Steps below and report a per-step"
    echo "pass/fail result with evidence."
    echo
    echo "Hard rules:"
    echo "- The ONLY shell commands you may run are: \`agent-device ...\`, \`ls\`,"
    echo "  \`cat\`, and the file writes needed to produce the two output files"
    echo "  listed below. Do NOT run any other shell commands."
    echo "- Use the agent-device CLI to drive the device. Available subcommands"
    echo "  include: snapshot, find, press, fill, screenshot, replay, test, logs."
    echo "  The platform is android; pass --platform android."
    echo "- Prefer existing reusable flows in ${SKILLS_DIR}. List them with the"
    echo "  workspace file tools. If a QA step matches an existing flow"
    echo "  (tests/ or macros/), replay it via:"
    echo "    agent-device replay <flow.ad> --platform android -e KEY=VAL."
    echo "- If no flow matches, improvise: snapshot -> find/press/fill -> verify."
    echo "  Take a screenshot after each step into ${ARTIFACTS_DIR}/screenshots/"
    echo "  named NN-<short-name>.png."
    echo "- Do NOT attempt to sign in, install, or open the app - that's already done."
    echo "- Do NOT touch files outside ${ARTIFACTS_DIR}."
    echo "- Time-box: aim for under 15 minutes total."
    echo
    echo "When done, write TWO files:"
    echo
    echo "1. ${P2_JUNIT}"
    echo "   A minimal JUnit XML, one <testcase> per QA step, with <failure> inside"
    echo "   any that did not pass. Wrap them in a single <testsuite name=\"qa-steps\">."
    echo
    echo "2. ${P2_SUMMARY}"
    echo "   A short markdown summary: one bullet per QA step in the form"
    echo "   \"- [x] step description\" (pass) or \"- [ ] step description - reason\""
    echo "   (fail), followed by links to the screenshots you captured."
    echo
    echo "QA Steps to execute (from PR #${PR_NUMBER:-?}):"
    echo
    cat "$QA_STEPS_FILE"
  } > "$PROMPT_FILE"

  set +e
  # --force/--yolo and --trust are required for non-interactive CI runs
  # so the agent does not stall on approval prompts.
  cursor-agent -p \
    --model composer-2.5 \
    --force \
    --trust \
    --output-format text \
    < "$PROMPT_FILE" \
    > "$ARTIFACTS_DIR/p2-agent.log" 2>&1
  P2_EXIT=$?
  set -e

  if [ ! -s "$P2_SUMMARY" ]; then
    echo "P2 agent produced no summary (advisory)." > "$P2_SUMMARY"
  fi
  echo "P2 exit: $P2_EXIT"
fi
echo "::endgroup::"

# ---------- Merge JUnits + write summary ---------------------------------
echo "::group::Reporting"
# Promote the P1 JUnit as the primary report (the hard signal).
if [ -s "$P1_JUNIT" ]; then
  cp "$P1_JUNIT" "$JUNIT_PATH"
fi

if [ "$INFRA_FAILURE" -eq 1 ]; then
  write_summary "infra-failure" "An infrastructure failure was detected; this is NOT a PR fault."
  # Surface as success at the workflow step level so we never flag the PR
  # red for infra issues; the summary makes the classification clear.
  exit 0
fi

write_summary "ok"
echo "::endgroup::"

# Hard signal: only P1 controls the job's exit code.
exit "$P1_EXIT"
