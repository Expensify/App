#!/usr/bin/env bash
: <<'COMMENT'
Phase-0 Android smoke for the Expensify dev APK.

Runs INSIDE reactivecircus/android-emulator-runner@v2's `script:` block,
which means the emulator is already booted and `adb` sees it. This script
installs the APK, brings up Metro, launches the app via agent-device,
waits for the SignIn UI to fully hydrate, fills the email field, presses
Continue, and verifies the magic-code screen appears. Captures screenshots,
snapshots, foreground-app dumps, and logcat along the way.

The flow stops short of typing the magic code — that input is a 6-cell
composite component that rejects programmatic input in every way we've
tried (fill, type, adb shell input text, paste). Solving it properly is
Phase 1: a developmentE2eDebug build variant that reads a pre-seeded Onyx
state from a 1Password-backed secret.
COMMENT

set -euo pipefail

ART=artifacts
SESSION=ci
APP=com.expensify.chat.dev
APK_GLOB="android/app/build/outputs/apk/development/debug/*.apk"
METRO_READY_TIMEOUT=120
SIGNIN_LOAD_TIMEOUT=360 # JS bundle delivery + React mount + Onyx hydrate.
                        : <<'COMMENT'
                        Free 2-core ubuntu-latest is much slower than
                        local Pixel 8 — observed ~290s on a real run,
                        so 360 gives ~70s safety margin.
                        COMMENT
ADVANCE_TIMEOUT=60      # SignIn -> magic-code transition after Continue
SMOKE_EMAIL=rustam.zeinalov@callstack.com

mkdir -p "$ART"

: <<'COMMENT'
Cleanup must run no matter what — kill background jobs and release the
agent-device session so a re-run of the workflow doesn't trip the
"session already bound" guard.
COMMENT
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

: <<'COMMENT'
Dev APK fetches its JS bundle over localhost:8081, which the emulator
reaches through the host loopback via adb-reverse.
COMMENT
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

: <<'COMMENT'
--relaunch forces a clean process so we capture the cold-start path
rather than whatever happened to be running on the runner.
COMMENT
agent-device open "$APP" \
  --platform android \
  --serial "$SERIAL" \
  --session "$SESSION" \
  --relaunch

: <<'COMMENT'
Cold-start MP4 of the boot animation. Bounded — we don't want to
inherit the 180s `adb screenrecord` cap by accident.
COMMENT
agent-device record start "$ART/cold-start.mp4" --session "$SESSION" >/dev/null 2>&1 || true
sleep 6
agent-device record stop --session "$SESSION" >/dev/null 2>&1 || true

: <<'COMMENT'
Wait for the SignIn UI to fully hydrate. An empty interactive snapshot
is normal during the splash → JS-bundle → React-mount → Onyx-hydrate
sequence, so we poll until the email text-field appears. A bare sleep
bites on slower runners (the previous fork-test run captured the
splash because 8s wasn't enough for first-bundle delivery).
COMMENT
PROBE="$ART/.probe.txt"
echo "::group::wait for SignIn UI"
SECONDS=0
while [ "$SECONDS" -lt "$SIGNIN_LOAD_TIMEOUT" ]; do
  agent-device snapshot -i --session "$SESSION" > "$PROBE" 2>/dev/null || true
  if grep -q '\[text-field\] "Phone or email' "$PROBE"; then
    echo "SignIn email field detected after ${SECONDS}s"
    cp "$PROBE" "$ART/snapshot-signin.txt"
    break
  fi
  sleep 4
done
echo "::endgroup::"

# Capture state at SignIn (or at timeout, for debugging).
agent-device screenshot "$ART/landing.png" --session "$SESSION"
agent-device appstate --session "$SESSION" > "$ART/appstate.txt"

if [ "$SECONDS" -ge "$SIGNIN_LOAD_TIMEOUT" ]; then
  echo "::error::SignIn email field never appeared (timeout ${SIGNIN_LOAD_TIMEOUT}s)"
  exit 1
fi

# Hard pass criterion: app must own the foreground.
if ! grep -q "Foreground app: $APP" "$ART/appstate.txt"; then
  echo "::error::app is not in foreground after launch — see artifacts/appstate.txt"
  cat "$ART/appstate.txt"
  exit 1
fi

: <<'COMMENT'
Drive the email-submit interaction.

Use @ref discovered from the snapshot above rather than a label= selector.
The Android label is "Phone or email," (with a trailing comma) where the
iOS label has no comma; agent-device's selector form does exact-match,
so the cross-platform-friendly path is to parse the ref out of the
snapshot we already captured and act on it directly. Refs are stable
inside the same session as long as we don't re-snapshot between.
COMMENT
EMAIL_REF=$(grep -oE '@e[0-9]+ \[text-field\] "Phone or email' "$ART/snapshot-signin.txt" \
            | head -1 | grep -oE '@e[0-9]+')
CONTINUE_REF=$(grep -oE '@e[0-9]+ \[button\] "Continue"' "$ART/snapshot-signin.txt" \
              | head -1 | grep -oE '@e[0-9]+')

if [ -z "$EMAIL_REF" ] || [ -z "$CONTINUE_REF" ]; then
  echo "::error::could not parse email/continue refs from snapshot-signin.txt"
  echo "--- snapshot-signin.txt: ---"
  cat "$ART/snapshot-signin.txt"
  exit 1
fi

echo "::group::fill email ($EMAIL_REF) + press Continue ($CONTINUE_REF)"
agent-device fill "$EMAIL_REF" "$SMOKE_EMAIL" --session "$SESSION"
agent-device screenshot "$ART/email-filled.png" --session "$SESSION"
agent-device press "$CONTINUE_REF" --session "$SESSION"
echo "::endgroup::"

: <<'COMMENT'
Wait for advance to magic-code screen. Detection: the new field has
label "Magic code, 6 digits" and React identifier "validateCode".
COMMENT
echo "::group::wait for magic-code screen"
SECONDS=0
while [ "$SECONDS" -lt "$ADVANCE_TIMEOUT" ]; do
  agent-device snapshot -i --session "$SESSION" > "$PROBE" 2>/dev/null || true
  if grep -qE 'Magic code|validateCode' "$PROBE"; then
    echo "magic-code screen detected after ${SECONDS}s"
    cp "$PROBE" "$ART/snapshot-magic-code.txt"
    break
  fi
  sleep 3
done
echo "::endgroup::"

# Capture post-Continue state regardless of pass/fail.
agent-device screenshot "$ART/post-continue.png" --session "$SESSION"
agent-device snapshot -i --session "$SESSION" > "$ART/snapshot.txt" 2>/dev/null || true

if [ "$SECONDS" -ge "$ADVANCE_TIMEOUT" ]; then
  echo "::error::magic-code screen did not appear after pressing Continue"
  exit 1
fi

rm -f "$PROBE"
echo "::notice::smoke OK — email submitted, magic-code screen reached"
