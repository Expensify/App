#!/usr/bin/env bash
set -euo pipefail

BOOT="false"
POSITIONAL=()
for arg in "$@"; do
  if [[ "$arg" == "--boot" ]]; then
    BOOT="true"
  else
    POSITIONAL+=("$arg")
  fi
done
set -- "${POSITIONAL[@]}"

SPAN="${1:?span name required}"
RUNS="${2:-10}"
PLATFORM="${3:-ios}"
APP_ID="${APP_ID:-com.expensify.chat.dev}"
LOG_PID=""
FLOW_ENV_ARGS=()
RESET_FLOW=""
# The repository replay wrapper enforces this deadline outside the Agent Device daemon.
REPLAY_TIMEOUT_MS="${REPLAY_TIMEOUT_MS:-120000}"
export AGENT_DEVICE_STATE_DIR="${AGENT_DEVICE_STATE_DIR:-$HOME/.agent-device-expensify-headless}"
# A separate state dir does not isolate the device-claim registry, which defaults to
# ~/.agent-device/device-claims. Without this the runner cannot acquire a device that any
# other agent-device session already claims, and fails with DEVICE_IN_USE.
export AGENT_DEVICE_CLAIMS_DIR="${AGENT_DEVICE_CLAIMS_DIR:-$AGENT_DEVICE_STATE_DIR/device-claims}"

if ! [[ "$REPLAY_TIMEOUT_MS" =~ ^[0-9]+$ ]] || [[ "$REPLAY_TIMEOUT_MS" -lt 1 ]]; then
  echo "REPLAY_TIMEOUT_MS must be a positive integer." >&2
  exit 1
fi

if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" ]]; then
  echo "Platform must be 'ios' or 'android'." >&2
  exit 1
fi

if ! [[ "$RUNS" =~ ^[0-9]+$ ]] || [[ "$RUNS" -lt 1 ]]; then
  echo "Runs must be a positive integer." >&2
  exit 1
fi

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(git rev-parse --show-toplevel)"
FLOWS_DIR="$SKILL_DIR/flows"
REPLAY_RUNNER="$SKILL_DIR/scripts/replay-with-deadline.mjs"
FLOW=""
MATCHING_FLOWS=()
while IFS= read -r -d '' candidate; do
  if grep -q "^# @span[[:space:]]\+${SPAN}\$" "$candidate" 2>/dev/null; then
    MATCHING_FLOWS+=("$candidate")
  fi
done < <(find "$FLOWS_DIR" -name '*.ad' -type f -print0 2>/dev/null)

if [[ "${#MATCHING_FLOWS[@]}" -eq 0 ]]; then
  echo "No flow declares '@span $SPAN'. Available:" >&2
  find "$FLOWS_DIR" -name '*.ad' -type f -exec grep -h '^# @span[[:space:]]\+' {} + 2>/dev/null | awk '{print $3}' | sort -u >&2
  exit 1
fi
# Exactly one flow owns each span, so measurement never picks by filesystem order.
if [[ "${#MATCHING_FLOWS[@]}" -gt 1 ]]; then
  echo "Multiple flows declare '@span $SPAN'; exactly one flow must own each span:" >&2
  printf '  %s\n' "${MATCHING_FLOWS[@]}" >&2
  exit 1
fi
FLOW="${MATCHING_FLOWS[0]}"

RESET_DECL=$(grep -E '^# @reset[[:space:]]+' "$FLOW" | sed -E 's/^# @reset[[:space:]]+//' | head -1 || true)
if [[ -n "$RESET_DECL" ]]; then
  if [[ "$RESET_DECL" = /* ]]; then
    RESET_FLOW="$RESET_DECL"
  else
    RESET_FLOW="$REPO/$RESET_DECL"
  fi

  if [[ ! -f "$RESET_FLOW" ]]; then
    echo "Reset flow does not exist: $RESET_FLOW" >&2
    exit 1
  fi
fi

FLOW_PRE=()
FLOW_POST=()
while IFS= read -r condition; do
  FLOW_PRE+=("$condition")
done < <(sed -n 's/^# @pre[[:space:]]\{1,\}//p' "$FLOW")
while IFS= read -r condition; do
  FLOW_POST+=("$condition")
done < <(sed -n 's/^# @post[[:space:]]\{1,\}//p' "$FLOW")

TMP_DIR="$(mktemp -d)"
DURATIONS_FILE="$TMP_DIR/durations.txt"

cleanup() {
  if [[ -n "$LOG_PID" ]]; then
    kill "$LOG_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# Flow `# @param KEY description` headers: only AD_<KEY> overrides are passed via `-e KEY=VALUE`.
append_flow_env_from_ad_vars() {
  local param_lines line key env_key
  param_lines=$(grep -E '^# @param[[:space:]]+[A-Za-z_][A-Za-z0-9_]*' "$FLOW" || true)
  if [[ -z "$param_lines" ]]; then
    return
  fi

  while IFS= read -r line; do
    key=$(echo "$line" | sed -E 's/^# @param[[:space:]]+([A-Za-z_][A-Za-z0-9_]*).*/\1/')
    env_key="AD_${key}"
    if [[ -n "${!env_key:-}" ]]; then
      FLOW_ENV_ARGS+=("-e" "$key=${!env_key}")
      echo "Replay param: $key from $env_key" >&2
    fi
  done <<< "$param_lines"
}

start_log() {
  local out="$1"
  if [[ "$PLATFORM" == "ios" ]]; then
    xcrun simctl spawn booted log stream --level debug \
      --predicate "eventMessage CONTAINS \"[Sentry][$SPAN] Ending span\"" > "$out" &
  else
    adb logcat -c
    adb logcat '*:D' > "$out" &
  fi
  echo $!
}

run_replay() {
  local flow="$1"
  shift
  # A LogBox can surface at any point in the loop and it covers the controls the next replay
  # presses, so clear it before every replay rather than only after a relaunch.
  dismiss_react_native_overlays
  node "$REPLAY_RUNNER" "$flow" --timeout "$REPLAY_TIMEOUT_MS" "$@"
}

# Keyed on the LogBox error screen's own controls, which is the only surface carrying all
# three at once. The snapshot's overlay hint is not usable here: it also fires for the
# collapsed warning badge, which cannot be dismissed and does not block presses, and it stays
# absent on the full-screen error. A press that is genuinely covered fails at the replay
# instead, where the divergence report names the target.
is_logbox_error_visible() {
  local snapshot="$1"
  [[ "$snapshot" == *'"Dismiss"'* && "$snapshot" == *'"Minimize"'* && "$snapshot" == *'"Copy"'* ]]
}

dismiss_react_native_overlays() {
  local snapshot
  for _ in $(seq 1 5); do
    snapshot="$(agent-device snapshot -i 2>&1 || true)"
    if ! is_logbox_error_visible "$snapshot"; then
      return
    fi

    # `react-native dismiss-overlay` reports "verified gone" while the error screen is still
    # up, so press LogBox's own control and re-read the snapshot to confirm.
    agent-device press 'label="Dismiss"' >/dev/null 2>&1 || true
    sleep 1
  done

  echo "React Native LogBox error screen still present after 5 dismissal attempts." >&2
  return 1
}

# The flow body owns @pre/@post enforcement, but nothing makes an author write those assertions.
# Re-checking the headers here catches a flow whose metadata and body have drifted apart.
assert_flow_conditions() {
  local kind="$1"
  shift

  local selector
  for selector in "$@"; do
    # shellcheck disable=SC2016 # matching a literal ${ left by an unresolved @param
    if [[ "$selector" == *'${'* ]]; then
      echo "Skipping $kind check with unresolved interpolation: $selector" >&2
      continue
    fi

    if [[ "$kind" == "@post" ]]; then
      if agent-device wait "$selector" 10000 >/dev/null 2>&1; then
        continue
      fi
    elif agent-device is exists "$selector" >/dev/null 2>&1; then
      continue
    fi

    echo "Flow $kind not satisfied: $selector" >&2
    return 1
  done
}

count_span_lines() {
  grep -c "\\[Sentry\\]\\[$SPAN\\] Ending span" "$1" 2>/dev/null || true
}

# A replay can pass every step and still emit no span - for example when the tab button
# short-circuits because the app already sits on the destination. Fail on the first such
# replay instead of spending every run and reporting "No captured runs" at the end.
require_new_span_line() {
  local raw="$1"
  local before="$2"
  local label="$3"
  local after

  for _ in $(seq 1 10); do
    after="$(count_span_lines "$raw")"
    if [[ "$after" -gt "$before" ]]; then
      return
    fi
    sleep 1
  done

  echo "$label emitted no '[Sentry][$SPAN] Ending span' line. Current screen:" >&2
  agent-device snapshot -i >&2 || true
  return 1
}

reset_if_needed() {
  if [[ -n "$RESET_FLOW" ]]; then
    echo "Resetting with: $RESET_FLOW" >&2
    # A LogBox raised mid-navigation drops the transition it interrupted, and that is
    # intermittent, so retry the reset once. `run_replay` clears the overlay first. A second
    # failure is reported rather than measuring from the wrong screen.
    if ! run_replay "$RESET_FLOW" >&2; then
      echo "Reset failed. Clearing overlays and retrying once." >&2
      run_replay "$RESET_FLOW" >&2
    fi
    return
  fi

  # No @reset declared: relaunch the app so the next replay starts from the flow's @pre state
  # instead of the previous run's @post state (Codex review r3191676565).
  agent-device open "$APP_ID" --platform "$PLATFORM" --relaunch >&2
  sleep 5
  if [[ "$PLATFORM" == "android" ]]; then
    wait_until_android_ui_ready
  fi
  dismiss_react_native_overlays
}

# After --relaunch on Android, UIAutomator often returns Snapshot: 0 nodes briefly; warmup replay then fails @pre.
wait_until_android_ui_ready() {
  local snapshot
  for _ in $(seq 1 60); do
    snapshot="$(agent-device snapshot 2>/dev/null || true)"
    if [[ "$snapshot" == *'"Home"'* && "$snapshot" == *'"Inbox'* ]]; then
      return
    fi
    sleep 1
  done

  echo "Warning: Android UI not ready after 60s (no Home/Inbox tabs); proceeding anyway." >&2
}

measure_current_branch() {
  local raw="$TMP_DIR/capture.log"

  if [[ "$BOOT" == "true" ]]; then
    echo "Booting $PLATFORM target (agent-device boot)..." >&2
    agent-device boot --platform "$PLATFORM" >&2
  fi

  if [[ -n "$RESET_FLOW" ]]; then
    # A declared @reset owns the start state, so attach to the running app instead of
    # relaunching. A relaunch only adds the first post-launch navigation, which is where the
    # app is most likely to raise a LogBox that aborts the very transition being measured.
    agent-device open "$APP_ID" --platform "$PLATFORM" >&2
    dismiss_react_native_overlays
    reset_if_needed
  else
    agent-device open "$APP_ID" --platform "$PLATFORM" --relaunch >&2
    sleep 5
    if [[ "$PLATFORM" == "android" ]]; then
      wait_until_android_ui_ready
    fi
    dismiss_react_native_overlays
  fi

  LOG_PID=$(start_log "$raw")

  local spans_before
  spans_before="$(count_span_lines "$raw")"
  assert_flow_conditions "@pre" ${FLOW_PRE[@]+"${FLOW_PRE[@]}"}
  run_replay "$FLOW" ${FLOW_ENV_ARGS[@]+"${FLOW_ENV_ARGS[@]}"} >&2 # warmup
  assert_flow_conditions "@post" ${FLOW_POST[@]+"${FLOW_POST[@]}"}
  require_new_span_line "$raw" "$spans_before" "Warmup"
  reset_if_needed
  sleep 1

  for i in $(seq 1 "$RUNS"); do
    echo "Run $i/$RUNS" >&2
    spans_before="$(count_span_lines "$raw")"
    assert_flow_conditions "@pre" ${FLOW_PRE[@]+"${FLOW_PRE[@]}"}
    run_replay "$FLOW" ${FLOW_ENV_ARGS[@]+"${FLOW_ENV_ARGS[@]}"} >&2
    assert_flow_conditions "@post" ${FLOW_POST[@]+"${FLOW_POST[@]}"}
    require_new_span_line "$raw" "$spans_before" "Run $i/$RUNS"
    reset_if_needed
    sleep 1
  done

  kill "$LOG_PID" 2>/dev/null || true
  LOG_PID=""

  # Last N numeric durations: assumes one "[Sentry][<span>] Ending span (Nms)" line per measured replay (see SKILL.md Contract).
  grep "\\[Sentry\\]\\[$SPAN\\] Ending span" "$raw" | grep -oE "Ending span \(([0-9]+)ms\)" | grep -oE '[0-9]+' | tail -n "$RUNS" || true
}

echo "Using flow: $FLOW" >&2
if [[ -n "$RESET_FLOW" ]]; then
  echo "Using reset flow: $RESET_FLOW" >&2
fi
append_flow_env_from_ad_vars
measure_current_branch > "$DURATIONS_FILE"

awk '
  { b[++bn]=$1; bs+=$1; if(!bmin||$1<bmin)bmin=$1; if($1>bmax)bmax=$1 }
  END {
    if (!bn) { print "No captured runs."; exit 1 }
    ba=bs/bn
    printf "| Metric | value |\n"
    printf "|--------|-------|\n"
    printf "| Runs   | %5d |\n", bn
    printf "| Avg    | %4.0fms |\n", ba
    printf "| Min    | %4dms |\n", bmin
    printf "| Max    | %4dms |\n", bmax
    printf "\nSamples: "
    for (i=1; i<=bn; i++) printf "%sms%s", b[i], (i<bn ? ", " : "\n")
  }' "$DURATIONS_FILE"
