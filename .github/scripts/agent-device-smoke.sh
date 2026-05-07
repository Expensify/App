#!/usr/bin/env bash
# Phase-0 Android smoke for the Expensify dev APK.
#
# Runs INSIDE reactivecircus/android-emulator-runner@v2's `script:` block,
# which means the emulator is already booted and `adb` sees it. This script
# installs the APK, brings up Metro, launches the app via agent-device, and
# captures landing-screen evidence (screenshot, accessibility-tree snapshot,
# foreground-app dump, logcat). It does NOT log in — Phase 0 is a build-health
# canary that proves install/launch/JS-bundle delivery without depending on
# the magic-code login flow.

set -euo pipefail

ART=artifacts
SESSION=ci
APP=com.expensify.chat.dev
APK_GLOB="android/app/build/outputs/apk/development/debug/*.apk"
METRO_READY_TIMEOUT=120

mkdir -p "$ART"

# Cleanup must run no matter what — kill background jobs and release the
# agent-device session so a re-run of the workflow doesn't trip the
# "session already bound" guard.
cleanup() {
  set +e
  agent-device record stop --session "$SESSION" >/dev/null 2>&1
  agent-device close --session "$SESSION" >/dev/null 2>&1
  jobs -p | xargs -r kill 2>/dev/null
}
trap cleanup EXIT

# Stale state from a previous run on a warm runner.
agent-device close --session "$SESSION" >/dev/null 2>&1 || true

# Logcat tee — verbose JS, warnings+errors for everything else. Async.
adb logcat -v time *:W ReactNativeJS:V ReactNative:V > "$ART/logcat.txt" &

SERIAL=$(adb get-serialno)
echo "::notice::emulator serial=$SERIAL"

# Locate the APK Rock produced earlier in the workflow.
APK=$(ls -1 $APK_GLOB 2>/dev/null | head -n 1 || true)
if [ -z "$APK" ]; then
  echo "::error::no APK found at $APK_GLOB — Rock build step likely failed"
  exit 1
fi
echo "::notice::installing $APK"
adb install -r -d -t "$APK"

# Dev APK fetches its JS bundle over localhost:8081, which the emulator
# reaches through the host loopback via adb-reverse.
adb reverse tcp:8081 tcp:8081

# Bring up Metro in the background; gate on /status before launching.
npm start >"$ART/metro.log" 2>&1 &
echo "::group::wait for Metro"
SECONDS=0
until curl -sf http://localhost:8081/status 2>/dev/null \
      | grep -q "packager-status:running"; do
  if [ "$SECONDS" -ge "$METRO_READY_TIMEOUT" ]; then
    echo "::error::Metro did not reach packager-status:running within ${METRO_READY_TIMEOUT}s"
    tail -50 "$ART/metro.log" || true
    exit 1
  fi
  sleep 2
done
echo "Metro ready after ${SECONDS}s"
echo "::endgroup::"

# --relaunch forces a clean process so we capture the cold-start path
# rather than whatever happened to be running on the runner.
agent-device open "$APP" \
  --platform android \
  --serial "$SERIAL" \
  --session "$SESSION" \
  --relaunch

# Splash + initial bundle delivery. 8s is the local-tested floor on
# Pixel 8 API 35; if the runner is slower we'll still capture the
# splash, which is itself useful evidence.
sleep 8

# Optional cold-start MP4. Bounded — we don't want to inherit the
# 180s `adb screenrecord` cap by accident.
agent-device record start "$ART/cold-start.mp4" --session "$SESSION" >/dev/null 2>&1 || true
sleep 8
agent-device record stop --session "$SESSION" >/dev/null 2>&1 || true

agent-device screenshot "$ART/landing.png" --session "$SESSION"
agent-device snapshot -i --session "$SESSION" > "$ART/snapshot.txt" || true
agent-device appstate --session "$SESSION" > "$ART/appstate.txt"

# Hard pass criterion: app must own the foreground. Anything else means
# we crashed back to launcher (or never launched at all).
if ! grep -q "Foreground app: $APP" "$ART/appstate.txt"; then
  echo "::error::app is not in foreground after launch — see artifacts/appstate.txt"
  cat "$ART/appstate.txt"
  exit 1
fi

echo "::notice::smoke OK — app reached landing screen"
