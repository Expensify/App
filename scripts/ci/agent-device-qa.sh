#!/usr/bin/env bash
#
# agent-device-qa.sh
#
# Runs inside the booted Android emulator (called from the `script:`
# block of reactivecircus/android-emulator-runner). Drives the POC APK
# through:
#
#   1. install + open
#   2. P1 (HARD SIGNAL) - cursor-agent runs a FIXED sanity prompt:
#      sign in with a randomized email and verify the Inbox renders.
#      Emits its own JUnit by parsing the agent's "RESULT: PASS|FAIL"
#      final line. P1 failure -> the workflow step fails -> CI red.
#   3. P2 (ADVISORY) - cursor-agent runs a DYNAMIC prompt built from
#      the PR's QA Steps. Produces its own JUnit + markdown summary.
#
# Everything from `open` onward is wrapped in a screen recording so
# the evidence artifact always includes `out/recording.mp4`.
#
# We intentionally do NOT call `agent-device replay`/`agent-device test`
# on hand-written `.ad` macros: maintaining selectors against a moving
# app is the exact tax this POC is trying to remove. The agent rediscovers
# the screen on every run via `agent-device snapshot` + tap/fill.
#
# Outputs all evidence (JUnit, screenshots, logs, summary, recording)
# into $ARTIFACTS_DIR. Infra failures (emulator/network/install/missing
# CLI) are classified separately from agent assertion failures so a red
# check always means "your PR (or the app under test) broke something."
#
# Environment (provided by the workflow):
#   APK_PATH          absolute path to the downloaded Expensify-adhoc.apk
#   BUNDLE_ID         android package id (detected via aapt2)
#   ARTIFACTS_DIR     absolute path for JUnit + screenshots + summary
#   QA_STEPS          PR-body QA Steps text (free-form markdown)
#   PR_NUMBER         PR number (used only for log breadcrumbs)
#   CURSOR_API_KEY    API key for cursor-agent (drives both P1 and P2).
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
P1_JUNIT="$ARTIFACTS_DIR/junit-p1.xml"
P2_JUNIT="$ARTIFACTS_DIR/junit-p2.xml"
P2_SUMMARY="$ARTIFACTS_DIR/p2-summary.md"
P1_LOG="$ARTIFACTS_DIR/p1-agent.log"
P2_LOG="$ARTIFACTS_DIR/p2-agent.log"
P1_PROMPT="$ARTIFACTS_DIR/p1-prompt.md"
P2_PROMPT="$ARTIFACTS_DIR/p2-prompt.md"
QA_STEPS_FILE="$ARTIFACTS_DIR/qa-steps.md"

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

# Emit a single-test JUnit XML so CI publishers (and the artifact
# consumer) see a uniform schema regardless of which agent produced it.
emit_junit() {
  local out="$1"
  local suite="$2"
  local case_name="$3"
  local exit_code="$4"
  local log_file="$5"
  local failures=0
  local failure_block=""
  if [ "$exit_code" -ne 0 ]; then
    failures=1
    local last=""
    if [ -s "$log_file" ]; then
      last=$(tail -c 4000 "$log_file" | sed 's/]]>/]] >/g')
    fi
    failure_block="<failure message=\"${suite} did not report RESULT: PASS\"><![CDATA[
${last}
]]></failure>"
  fi
  cat > "$out" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="${suite}" tests="1" failures="${failures}">
    <testcase classname="${suite}" name="${case_name}">${failure_block}</testcase>
  </testsuite>
</testsuites>
EOF
}

# Returns 0 if the agent's log ends with `RESULT: PASS`, 1 otherwise.
# Looking only at the final RESULT: line lets the model rephrase or
# retry mid-run without poisoning the verdict.
parse_agent_result() {
  local log_file="$1"
  if [ ! -s "$log_file" ]; then return 1; fi
  local last
  last=$(grep -E '^RESULT: (PASS|FAIL)' "$log_file" | tail -1 || true)
  case "$last" in
    "RESULT: PASS"*) return 0 ;;
    *)               return 1 ;;
  esac
}

# Run cursor-agent with the standard CI flags. Returns:
#   0  -> ran (caller still must parse RESULT: line)
#   2  -> skipped because CLI / key is missing (advisory only)
#   *  -> cursor-agent exited non-zero (CLI/network error)
run_cursor_agent() {
  local prompt_file="$1"
  local log_file="$2"

  if [ -z "${CURSOR_API_KEY:-}" ]; then
    echo "CURSOR_API_KEY not set; skipping cursor-agent invocation." | tee "$log_file"
    return 2
  fi
  if ! command -v cursor-agent >/dev/null 2>&1; then
    echo "cursor-agent CLI not installed; skipping cursor-agent invocation." | tee "$log_file"
    return 2
  fi

  set +e
  # --force/--yolo and --trust are required for non-interactive CI runs
  # so the agent does not stall on approval prompts.
  cursor-agent -p \
    --model composer-2.5 \
    --force \
    --trust \
    --output-format text \
    < "$prompt_file" \
    2>&1 | tee "$log_file"
  local code=${PIPESTATUS[0]}
  set -e
  return "$code"
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
    echo "### P1 (fixed sanity) details"
    echo
    if [ -s "$P1_LOG" ]; then
      local last
      last=$(grep -E '^RESULT: (PASS|FAIL)' "$P1_LOG" | tail -1 || true)
      [ -n "$last" ] && echo "- Agent verdict: \`$last\`" || echo "- Agent verdict: _no RESULT line emitted_"
    else
      echo "- _no agent log_"
    fi
    echo
    echo "### P2 (QA-step runner) details"
    echo
    if [ -s "$P2_SUMMARY" ]; then
      cat "$P2_SUMMARY"
    else
      echo "_no summary written_"
    fi
    echo
    echo "### Evidence"
    echo
    echo "- JUnit: \`out/junit.xml\` (P1) and \`out/junit-p2.xml\` (P2)"
    echo "- Screen recording: \`out/recording.mp4\` (full session)"
    echo "- Agent logs: \`out/p1-agent.log\`, \`out/p2-agent.log\`"
    echo "- Prompts (for reproducibility): \`out/p1-prompt.md\`, \`out/p2-prompt.md\`"
    echo "- Screenshots under \`out/screenshots/\`"
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

# ---------- Start screen recording ---------------------------------------
# Wraps everything from here onwards (P1 + P2). The EXIT trap guarantees
# the recording is finalized on any exit path - including the `exit 0`
# inside abort_infra - so a partial video is still saved when the run
# aborts early. --quality 8 keeps the mp4 modest while still readable.
RECORDING_PATH="$ARTIFACTS_DIR/recording.mp4"
RECORDING_STARTED=0

stop_recording() {
  if [ "$RECORDING_STARTED" -eq 1 ]; then
    RECORDING_STARTED=0
    echo "Stopping screen recording -> $RECORDING_PATH"
    agent-device record stop --platform android >/dev/null 2>&1 || \
      echo "::warning title=Recording::record stop failed; video may be truncated."
  fi
}
trap stop_recording EXIT

echo "::group::Start screen recording"
if agent-device record start "$RECORDING_PATH" --platform android --quality 8; then
  RECORDING_STARTED=1
  echo "Recording started -> $RECORDING_PATH"
else
  echo "::warning title=Recording::record start failed; continuing without video."
fi
echo "::endgroup::"

# ---------- P1: fixed sanity, agent-driven (HARD SIGNAL) -----------------
# A fixed natural-language prompt the agent must satisfy. No .ad macros;
# the agent rediscovers the sign-in screen via `snapshot` each run.
echo "::group::P1 - agent-driven sanity (sign-in + inbox)"
cat > "$P1_PROMPT" <<EOF
You are driving the Expensify Android app via the agent-device CLI on
an ephemeral emulator inside CI. The app is already installed and
freshly OPENED (bundle id ${BUNDLE_ID}). It should be showing the
sign-in screen.

# Your job (FIXED SANITY)
1. Sign in with this exact email: ${EMAIL}
   - This is a fresh randomized address. The build bypasses OTP for
     this domain, so after submitting the email you should land on the
     signed-in home screen (Inbox / chat list) WITHOUT being prompted
     for a magic code. If you do get prompted for a code, that itself
     is a FAIL.
2. Verify the signed-in state renders. Acceptable evidence: the chat
   list, the Inbox header, the floating "+" / FAB, or the bottom-tab
   bar - anything that is unambiguously not the sign-in screen.

# Hard rules
- The ONLY shell commands you may run are \`agent-device ...\` and the
  file writes needed to capture screenshots. Do NOT run npm / git /
  curl / anything else.
- Always pass \`--platform android\` to agent-device.
- Useful subcommands: \`snapshot\`, \`find\`, \`tap\`, \`press\`,
  \`fill\`, \`scroll\`, \`wait\`, \`screenshot\`, \`logs\`.
- Take a screenshot after sign-in to:
    ${ARTIFACTS_DIR}/screenshots/p1-signed-in.png
- Time-box yourself to ~5 minutes. If the app does not appear signed
  in after a reasonable number of attempts, STOP and report FAIL.
- Do NOT touch files outside ${ARTIFACTS_DIR}.

# Final line (REQUIRED, machine-parsed)
The very last line of your output MUST be exactly one of:
    RESULT: PASS
    RESULT: FAIL <one-line reason>
Anything else on that final line will be treated as FAIL.
EOF

run_cursor_agent "$P1_PROMPT" "$P1_LOG"
P1_RUN_EXIT=$?

if [ "$P1_RUN_EXIT" -eq 2 ]; then
  # CLI/key missing is infra, not a PR failure.
  abort_infra "P1 could not run: cursor-agent or CURSOR_API_KEY is missing."
elif [ "$P1_RUN_EXIT" -ne 0 ]; then
  # cursor-agent crashed / network error -> infra.
  abort_infra "P1 cursor-agent invocation failed with exit ${P1_RUN_EXIT}; see ${P1_LOG}."
fi

if parse_agent_result "$P1_LOG"; then
  P1_EXIT=0
  echo "P1 verdict: PASS"
else
  P1_EXIT=1
  echo "P1 verdict: FAIL (no RESULT: PASS line found)"
  agent-device screenshot --output "$ARTIFACTS_DIR/screenshots/p1-fail-state.png" \
    --platform android >/dev/null 2>&1 || true
fi
emit_junit "$P1_JUNIT" "agent-device.P1" "sign_in_and_inbox" "$P1_EXIT" "$P1_LOG"
echo "::endgroup::"

# ---------- P2: PR-driven QA steps (ADVISORY) ----------------------------
echo "::group::P2 - QA-step runner (cursor-agent)"
printf '%s\n' "$QA_STEPS" > "$QA_STEPS_FILE"

{
  echo "You are running INSIDE a CI job, against a real Android emulator that"
  echo "already has the Expensify app installed and opened (bundle id ${BUNDLE_ID})."
  echo "A prior phase attempted to sign in as ${EMAIL}. Verify state via"
  echo "\`agent-device snapshot --platform android\` before acting; if you find"
  echo "yourself on the sign-in screen, you may sign in once with that same"
  echo "email (the build bypasses OTP for it)."
  echo
  echo "Your task: execute the QA Steps below and report a per-step pass/fail"
  echo "result with evidence."
  echo
  echo "Hard rules:"
  echo "- The ONLY shell commands you may run are: \`agent-device ...\`, \`ls\`,"
  echo "  \`cat\`, and the file writes needed to produce the two output files"
  echo "  listed below. Do NOT run any other shell commands."
  echo "- Always pass \`--platform android\` to agent-device. Useful subcommands:"
  echo "  snapshot, find, tap, press, fill, scroll, wait, screenshot, logs."
  echo "- Discover the UI on the fly via snapshot + find. Do NOT rely on or"
  echo "  invoke any pre-written .ad macros; this run intentionally avoids them."
  echo "- Take a screenshot after each step into ${ARTIFACTS_DIR}/screenshots/"
  echo "  named NN-<short-name>.png."
  echo "- Do NOT install, uninstall, or restart the app; just drive the running session."
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
} > "$P2_PROMPT"

run_cursor_agent "$P2_PROMPT" "$P2_LOG"
P2_RUN_EXIT=$?
if [ "$P2_RUN_EXIT" -eq 2 ]; then
  P2_EXIT=0
  echo "P2 skipped (cursor-agent or key missing) - advisory step."
  : > "$P2_SUMMARY"
  echo "P2 skipped (no cursor-agent / CURSOR_API_KEY)." > "$P2_SUMMARY"
else
  P2_EXIT=$P2_RUN_EXIT
  if [ ! -s "$P2_SUMMARY" ]; then
    echo "P2 agent produced no summary (advisory)." > "$P2_SUMMARY"
  fi
  echo "P2 exit: $P2_EXIT"
fi
echo "::endgroup::"

# ---------- Reporting ----------------------------------------------------
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
