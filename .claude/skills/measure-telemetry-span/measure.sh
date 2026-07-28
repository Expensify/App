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

if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" ]]; then
  echo "Platform must be 'ios' or 'android'." >&2
  exit 1
fi

if ! [[ "$RUNS" =~ ^[0-9]+$ ]] || [[ "$RUNS" -lt 1 ]]; then
  echo "Runs must be a positive integer." >&2
  exit 1
fi

REPO="$(git rev-parse --show-toplevel)"
FLOWS_DIR="$REPO/.claude/skills/agent-device/flows"
FLOW=""
while IFS= read -r -d '' candidate; do
  if grep -q "^# @tag[[:space:]]\+sentry-${SPAN}\$" "$candidate" 2>/dev/null; then
    FLOW="$candidate"
    break
  fi
done < <(find "$FLOWS_DIR" -name '*.ad' -type f -print0 2>/dev/null)

if [[ -z "$FLOW" ]]; then
  echo "No flow declares '@tag sentry-$SPAN'. Available:" >&2
  find "$FLOWS_DIR" -name '*.ad' -type f -exec grep -h '^# @tag[[:space:]]\+sentry-' {} + 2>/dev/null | sed 's/.*sentry-//' | sort -u >&2
  exit 1
fi

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

reset_if_needed() {
  if [[ -n "$RESET_FLOW" ]]; then
    echo "Resetting with: $RESET_FLOW" >&2
    agent-device replay "$RESET_FLOW" >&2
    return
  fi

  # No @reset declared: relaunch the app so the next replay starts from the flow's @pre state
  # instead of the previous run's @post state (Codex review r3191676565).
  agent-device open "$APP_ID" --platform "$PLATFORM" --relaunch >&2
  sleep 5
  if [[ "$PLATFORM" == "android" ]]; then
    wait_until_android_ui_ready
  fi
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

  agent-device open "$APP_ID" --platform "$PLATFORM" --relaunch >&2
  sleep 5
  if [[ "$PLATFORM" == "android" ]]; then
    wait_until_android_ui_ready
  fi

  LOG_PID=$(start_log "$raw")
  agent-device replay "$FLOW" ${FLOW_ENV_ARGS[@]+"${FLOW_ENV_ARGS[@]}"} >&2 # warmup
  reset_if_needed
  sleep 1

  for i in $(seq 1 "$RUNS"); do
    echo "Run $i/$RUNS" >&2
    agent-device replay "$FLOW" ${FLOW_ENV_ARGS[@]+"${FLOW_ENV_ARGS[@]}"} >&2
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
