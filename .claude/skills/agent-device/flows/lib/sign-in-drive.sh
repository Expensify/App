#!/usr/bin/env bash
# Agent-control drive library for the New Expensify sign-in flow (agent-device).
#
# Owns App-screen knowledge and steering decisions ONLY: selector constants,
# snapshot classifiers, waits, onboarding clearing, and the sign-in drive loop.
# The caller owns the session lifecycle (open/close/record), account minting,
# retries, and any CI protocol. This is the canonical home; Melvin's
# .github/scripts/melvin-app-drive.sh is a staging mirror that wins while it
# exists (see resolve_app_drive in Melvin's melvin-session.sh).
#
# Dual use:
#   1) Source it (with PLATFORM and SESSION set), then call:
#        drive_sign_in <email> <macro-path>
#      Returns: 0 landed | 1 retryable failure (caller may mint a new email
#      and retry) | 2 fatal (caller must abort; DRIVE_ABORT_REASON is set).
#      Logs through the caller's human() if defined (stderr fallback).
#      Never emits protocol lines, never exits the process, never opens,
#      closes, or records.
#   2) Run it standalone against an already-open agent-device session:
#        sign-in-drive.sh --platform web|android --session <name> --email <email> [--macro <path>]
#      Default macro: the sibling flows/macros/sign-in.ad.
#
# Env knobs:
#   MELVIN_SNAP_TIMEOUT_MS        snapshot timeout (default 15000)
#   MELVIN_LOGIN_WAIT_SECS        login-field wait budget in secs (default 40)
#   MELVIN_POST_REPLAY_WAIT_SECS  post-replay classify budget in secs (default 25 web / 50 android)

[[ -n "${SIGN_IN_DRIVE_LOADED:-}" ]] && return 0 2>/dev/null
SIGN_IN_DRIVE_LOADED=1

# Fall back to a local stderr logger when the caller doesn't provide one.
if ! declare -F human >/dev/null; then
  human() { echo "$*" >&2; }
fi

# --- selector constants (one source of truth for .ad fallback, classifiers, waits) ---
readonly SEL_LOGIN_FIELD='id="username" || role="textfield" label="Phone or email" || label="Phone or email"'
readonly SEL_CONTINUE='role="button" label="Continue" || label="Continue"'
readonly SEL_NAME_FIELD='label="First name" || label="Full name" || role="textfield"'
# Web wait-union markers. Apostrophe-free substrings dodge the straight-vs-curly
# apostrophe mismatch (the snapshot classifiers keep both variants instead).
readonly WAIT_ONBOARDING='role="button" label="Skip" || label="Skip" || label="Something else" || text="your work email" || text="your name"'
readonly WAIT_LANDED='role="button" label="Search" || text="Welcome"'
readonly WAIT_MAGIC='text="magic code"'
readonly WAIT_JOIN='role="button" label="Join" || label="Join"'

# Set on fatal drive outcomes (return code 2) for the caller to surface.
DRIVE_ABORT_REASON=""

# --- snapshot capture ---
# One `snapshot` per poll instead of N `is exists` probes: every probe costs a
# full hierarchy capture (Android p95 ~11s), so classifying one capture is strictly
# cheaper. SNAP holds the latest full tree as text (bash-only; not model context).
# Full tree (no -i): onboarding classifiers need non-interactive text prompts.
SNAP=""

take_snap() {
  SNAP="$(agent-device snapshot --force-full --timeout "${MELVIN_SNAP_TIMEOUT_MS:-15000}" \
    --platform "$PLATFORM" --session "$SESSION" 2>/dev/null || true)"
  # Android a11y hierarchy dumps time out waiting for UI idle. An empty
  # capture would blind every classifier — force a dump via screenshot (no
  # idle wait) and retry once before giving up on this poll.
  if [[ -z "$SNAP" && "$PLATFORM" = android ]]; then
    agent-device screenshot "${GITHUB_WORKSPACE:-/tmp}/artifacts/melvin-snap-force.png" \
      --platform "$PLATFORM" --session "$SESSION" >/dev/null 2>&1 || true
    SNAP="$(agent-device snapshot --force-full --timeout "${MELVIN_SNAP_TIMEOUT_MS:-15000}" \
      --platform "$PLATFORM" --session "$SESSION" 2>/dev/null || true)"
  fi
  if [[ -z "$SNAP" ]]; then
    human "sign-in-drive: snapshot empty after retry"
  fi
}

snap_has() { printf '%s' "$SNAP" | grep -qiF -- "$1"; }

# Native verb per platform: press on android, click on web.
press_label() {
  local sel="role=\"button\" label=\"$1\" || label=\"$1\""
  local verb=click
  [[ "$PLATFORM" = android ]] && verb=press
  agent-device "$verb" "$sel" --platform "$PLATFORM" --session "$SESSION" 2>/dev/null || true
}

# Dismiss splash / runtime permission / ANR overlays that block the login hierarchy.
# Uses the current SNAP; refreshes and loops while it keeps hitting.
dismiss_android_noise() {
  [[ "$PLATFORM" = android ]] || return 0
  local round label
  for round in 1 2 3 4 5; do
    [[ -n "$SNAP" ]] || take_snap
    local hit=0
    for label in \
      "While using the app" \
      "Allow" \
      "Only this time" \
      "Don't allow" \
      $'Don\u2019t allow' \
      "OK" \
      "Got it" \
      "Wait" \
      "Close app"; do
      if snap_has "\"${label}\""; then
        human "sign-in-drive: dismiss '${label}' (${round})"
        press_label "$label"
        hit=1
        sleep 1
        break
      fi
    done
    [[ "$hit" -eq 1 ]] || break
    take_snap
  done
}

# Let the UI settle after open. Android: sleep + dismiss dialogs + screenshot
# (forces hierarchy dump; avoids wait-for-idle flake before sign-in).
settle_after_open() {
  case "$PLATFORM" in
    android)
      human "sign-in-drive: android settle after open"
      mkdir -p "${GITHUB_WORKSPACE:-/tmp}/artifacts"
      sleep 8
      dismiss_android_noise
      agent-device screenshot "${GITHUB_WORKSPACE:-/tmp}/artifacts/melvin-settle-after-open.png" \
        --platform "$PLATFORM" --session "$SESSION" >/dev/null 2>&1 || true
      sleep 2
      dismiss_android_noise
      ;;
    web)
      # wait_for_login_field polls from second 0 — no blind settle needed.
      ;;
  esac
}

# --- pure classifiers over the current SNAP (no device I/O) ---

snap_login_field() { snap_has '"Phone or email"'; }

snap_onboarding() {
  snap_has "What's your work email?" || snap_has $'What\u2019s your work email?' \
    || snap_has "What's your name?" || snap_has $'What\u2019s your name?' \
    || snap_has '"Add work email"' || snap_has '"Work email"' \
    || snap_has 'Onboarding progress' || snap_has 'connect your work email'
}

# snap_has is case-insensitive — one variant covers all casings.
snap_magic_wall() { snap_has 'magic code'; }

snap_landed() {
  snap_onboarding && return 1
  snap_has '"Welcome"' || snap_has '"Home"' || snap_has '"Search"'
}

# Wait for the login field (or onboarding), platform-split:
# - web: one native reactive `wait` on a selector union, then ONE classify
#   snapshot (wait's rc proves *a* match, not *which*). No fixed sleeps.
# - android: hardened bash poll — a single long `wait` dies on a11y idle
#   timeouts, and noise dismissal must run between polls. Wall-clock bounded:
#   android snapshots can take 10s+ each, so counting iterations would
#   silently multiply the budget.
# Returns: 0 login field ready, 2 already in onboarding, 1 timeout.
wait_for_login_field() {
  local budget_secs="${MELVIN_LOGIN_WAIT_SECS:-40}"
  mkdir -p "${GITHUB_WORKSPACE:-/tmp}/artifacts"
  if [[ "$PLATFORM" = web ]]; then
    agent-device wait "$SEL_LOGIN_FIELD || $WAIT_ONBOARDING" $((budget_secs * 1000)) \
      --platform "$PLATFORM" --session "$SESSION" >/dev/null 2>&1 || return 1
    take_snap
    if snap_login_field; then
      return 0
    fi
    if snap_onboarding || snap_has '"Skip"'; then
      return 2
    fi
    return 1
  fi
  local deadline=$((SECONDS + budget_secs))
  while [[ "$SECONDS" -lt "$deadline" ]]; do
    take_snap
    if snap_login_field; then
      return 0
    fi
    if snap_onboarding || snap_has '"Skip"'; then
      return 2
    fi
    dismiss_android_noise
    sleep 2
  done
  return 1
}

# SKIP_ONBOARDING cannot skip the post-signup REPLACE into onboarding
# (App OnboardingGuard allows it) — dismiss residual prompts in-session.
# Past login: never retry .ad fill (login field gone). Fail loud if still stuck.
# Classifies one snapshot per step instead of probing per selector.
clear_onboarding() {
  local step
  for step in 1 2 3 4 5 6; do
    take_snap
    if snap_landed; then
      return 0
    fi
    if snap_has '"Skip"'; then
      human "sign-in-drive: onboarding — Skip (${step})"
      press_label "Skip"
      sleep 1
      continue
    fi
    if snap_has '"Something else"'; then
      human "sign-in-drive: onboarding — Something else (${step})"
      press_label "Something else"
      sleep 1
      continue
    fi
    if snap_has '"First name"' || snap_has '"Full name"' \
      || snap_has "What's your name?" || snap_has $'What\u2019s your name?'; then
      human "sign-in-drive: onboarding — name MelvinBot (${step})"
      agent-device fill "$SEL_NAME_FIELD" 'MelvinBot' \
        --platform "$PLATFORM" --session "$SESSION" 2>/dev/null || true
      press_label "Continue"
      sleep 1
      continue
    fi
    if [[ -z "$SNAP" ]]; then
      # Capture blind (android dump timeouts) but we KNOW we're in onboarding —
      # blind-press the ladder's most likely blocker; press no-ops if absent.
      human "sign-in-drive: onboarding clear — blind Skip (${step}, empty snap)"
      press_label "Skip"
      sleep 1
      continue
    fi
    # Nothing actionable in this capture — transition may still be rendering.
    human "sign-in-drive: onboarding clear — nothing actionable (${step})"
    sleep 1
  done
  take_snap
  snap_landed
}

# Classify the post-replay state instead of one fixed sleep + single snapshot:
# a slow transition used to read as failure and burn a retry (fresh email).
# web: one native reactive `wait` on the outcome-marker union, then ONE classify
# snapshot. android: bash poll (a11y idle timeouts on long waits; provisioning
# + first render are much slower). Classify order is load-bearing: magic before
# landed (fail fast beats retry burn), onboarding before landed (tab bar
# renders behind the onboarding modal).
# Echoes the outcome: landed | onboarding | magic | join | timeout.
classify_post_replay() {
  local default_wait=25
  [[ "$PLATFORM" = android ]] && default_wait=50
  local budget_secs="${MELVIN_POST_REPLAY_WAIT_SECS:-$default_wait}"
  if [[ "$PLATFORM" = web ]]; then
    if ! agent-device wait "$WAIT_MAGIC || $WAIT_LANDED || $WAIT_ONBOARDING || $WAIT_JOIN" $((budget_secs * 1000)) \
      --platform "$PLATFORM" --session "$SESSION" >/dev/null 2>&1; then
      echo timeout
      return
    fi
    take_snap
    if snap_magic_wall; then echo magic; return; fi
    if snap_landed; then echo landed; return; fi
    if snap_onboarding || snap_has '"Skip"'; then echo onboarding; return; fi
    if snap_has '"Join"'; then echo join; return; fi
    echo timeout
    return
  fi
  local deadline=$((SECONDS + budget_secs))
  while [[ "$SECONDS" -lt "$deadline" ]]; do
    take_snap
    if snap_magic_wall; then echo magic; return; fi
    if snap_landed; then echo landed; return; fi
    if snap_onboarding || snap_has '"Skip"'; then echo onboarding; return; fi
    if snap_has '"Join"'; then echo join; return; fi
    sleep 1
  done
  echo timeout
}

# Drive one sign-in attempt from the login surface to the authenticated shell.
# Args: $1 = email to sign in with, $2 = path to the sign-in .ad macro.
# Returns: 0 landed | 1 retryable failure (caller may mint a new email and
# retry) | 2 fatal (caller must abort; DRIVE_ABORT_REASON is set).
drive_sign_in() {
  local email="$1"
  local sign_in_ad="$2"
  DRIVE_ABORT_REASON=""
  # Prefer short bash poll over a single 30s wait (android a11y idle timeouts).
  local wait_rc=0
  wait_for_login_field || wait_rc=$?
  if [[ "$wait_rc" -eq 2 ]]; then
    human "sign-in-drive: no login field — already onboarding for ${email}"
    if clear_onboarding; then
      return 0
    fi
    DRIVE_ABORT_REASON="stuck in onboarding after ${email}; not retrying login fill"
    return 2
  elif [[ "$wait_rc" -ne 0 ]]; then
    human "sign-in-drive: login field not ready; replay may still retry"
  fi
  human "sign-in-drive: replay ${sign_in_ad}"
  # Replay must share AGENT_DEVICE_STATE_DIR with open (caller exports it).
  if ! agent-device replay "$sign_in_ad" -e "EMAIL=${email}" --platform "$PLATFORM" --session "$SESSION"; then
    # Already past login (onboarding residual / signup REPLACE) — clear, don't re-fill.
    take_snap
    if snap_onboarding || snap_has '"Skip"'; then
      human "sign-in-drive: replay missed login field — try onboarding clear after ${email}"
      if clear_onboarding; then
        return 0
      fi
      DRIVE_ABORT_REASON="stuck in onboarding after ${email}; not retrying login fill"
      return 2
    fi
    # Replay's own `wait` dies on android a11y idle timeouts even when bash
    # already saw the field. Fall back to direct fill+press.
    if snap_login_field; then
      human "sign-in-drive: replay wait flaked — direct fill for ${email}"
      if agent-device fill "$SEL_LOGIN_FIELD" "${email}" \
        --platform "$PLATFORM" --session "$SESSION" \
        && agent-device press "$SEL_CONTINUE" \
          --platform "$PLATFORM" --session "$SESSION"; then
        true
      else
        human "sign-in-drive: direct fill failed for ${email}"
        return 1
      fi
    else
      human "sign-in-drive: sign-in replay failed for ${email}"
      return 1
    fi
  fi
  case "$(classify_post_replay)" in
    magic)
      # Same UI surface cannot accept a new email without navigation; do not burn retries.
      DRIVE_ABORT_REASON="magic-code wall after ${email} (account already existed?); not retrying"
      return 2
      ;;
    landed)
      return 0
      ;;
    onboarding)
      if clear_onboarding; then
        return 0
      fi
      DRIVE_ABORT_REASON="stuck in onboarding after ${email}; not retrying login fill"
      return 2
      ;;
    join)
      # Join is left in bash (not .ad): only some new-account paths show it, and timing
      # varies; keep the macro as the shared fill+Continue SSOT. After Join, require a
      # real shell marker (Welcome/Home/Search) — not Join itself.
      press_label "Join"
      sleep 2
      take_snap
      if snap_landed; then
        return 0
      fi
      if { snap_onboarding || snap_has '"Skip"'; } && clear_onboarding; then
        return 0
      fi
      ;;
  esac
  human "sign-in-drive: landing check failed after ${email}"
  return 1
}

# --- standalone entry point (sourced callers stop above: `return` in the
# loaded-guard is a no-op only when executed) ---
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  set -euo pipefail
  usage() {
    echo "usage: sign-in-drive.sh --platform web|android --session <name> --email <email> [--macro <path>]" >&2
    echo "Drives sign-in on an ALREADY-OPEN agent-device session (caller owns open/close)." >&2
    exit 2
  }
  PLATFORM="" SESSION="" EMAIL="" MACRO=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --platform) PLATFORM="${2:-}"; shift 2 ;;
      --session) SESSION="${2:-}"; shift 2 ;;
      --email) EMAIL="${2:-}"; shift 2 ;;
      --macro) MACRO="${2:-}"; shift 2 ;;
      *) usage ;;
    esac
  done
  [[ "$PLATFORM" = web || "$PLATFORM" = android ]] || usage
  [[ -n "$SESSION" && -n "$EMAIL" ]] || usage
  if [[ -z "$MACRO" ]]; then
    MACRO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/macros/sign-in.ad"
  fi
  [[ -f "$MACRO" ]] || { echo "sign-in-drive: macro not found at ${MACRO} (pass --macro)" >&2; exit 1; }
  export AGENT_DEVICE_STATE_DIR="${AGENT_DEVICE_STATE_DIR:-${HOME}/.agent-device}"
  rc=0
  drive_sign_in "$EMAIL" "$MACRO" || rc=$?
  case "$rc" in
    0) human "sign-in-drive: landed as ${EMAIL}" ;;
    2) human "sign-in-drive: fatal — ${DRIVE_ABORT_REASON}" ;;
    *) human "sign-in-drive: failed (retryable) for ${EMAIL}" ;;
  esac
  exit "$rc"
fi
