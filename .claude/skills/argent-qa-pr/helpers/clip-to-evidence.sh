#!/usr/bin/env bash
# Turn a raw screen recording into publishable QA evidence:
#   - a LONG context MP4 (the repro PLUS lead-in & aftermath — repro ± ~20s — linked for full quality)
#   - an optimized, looping GIF of the key action window (embedded INLINE in the comment)
#
# Why two artifacts:
#   * GitHub renders GIFs inline from a raw URL and auto-loops them, but a 40s GIF is 5-10 MB and
#     won't load inline — so the GIF stays SHORT (just the action), as the inline preview.
#   * A raw/blob MP4 URL does NOT inline-play in a comment, so the MP4 is *linked* — and because it's
#     only a click away it carries the LONGER context (the reviewer sees the repro in situ, not an
#     isolated 10s snippet). Default MP4 window = [gif_start - CTX, gif_end + CTX], CTX=20s.
#
# Why CFR-normalize first (the hard-won lesson): iOS `xcrun simctl io recordVideo` writes a
# VARIABLE frame rate — on a static screen it captures almost no frames, so a GIF of a settled
# "after" state comes out as a 7-frame flicker, and -ss/-t seeks on the raw are unreliable. We first
# transcode the raw to constant 30fps; then both clips seek accurately and static stretches still
# have frames. (For a CFR Android `screenrecord` mp4 this is a cheap no-op re-encode.)
#
# Usage:
#   # 1) Find your windows on the NORMALIZED clip (timestamps are accurate there):
#   clip-to-evidence.sh --contact <raw-video>          # writes /tmp/_clip_contact.png (1fps, timestamped)
#   # 2) Produce the evidence (gif window = the action; mp4 auto-pads to ±CTX unless you override):
#   clip-to-evidence.sh <raw-video> <out-basename> [gif-start] [gif-dur] [gif-width] [mp4-start] [mp4-dur]
#   # e.g. clip-to-evidence.sh ai-qa-poc/PR-93399/videos/ios-pr-raw.mov \
#   #        ai-qa-poc/PR-93399/videos/ios-pr 13 7 360      # gif = 13..20s; mp4 = 0..40s (13-20 ±20, clamped)
#
# Produces <out-basename>.mp4 (long, ~repro±20s) and <out-basename>.gif (tight action window).
# Override the context with CLIP_CONTEXT_SEC=NN, or pin the mp4 window with the 6th/7th args.
#
# RECORD LONG, CUT LATER: start the recording BEFORE the lead-in and stop it AFTER the aftermath, so
# there is genuinely ~20s of context on each side of the repro to cut to. Record the WHOLE flow
# continuously (navigate in → repro → settle), don't start/stop around just the key tap.
#   Android: adb shell screenrecord --bit-rate 8000000 --time-limit 60 /sdcard/c.mp4 &   # then run the flow
#            adb shell pkill -INT screenrecord ; adb pull /sdcard/c.mp4 <raw>
#            ^ screenrecord is SLOW to init on a loaded emulator — wait ~4s after starting it before the
#              first action. It can also DIE at a navigation surface-change; if so, re-record (or drive
#              the flow so the repro repeats a few times mid-recording, so a clean cycle survives).
#   iOS:     xcrun simctl io <udid> recordVideo --codec h264 <raw> &      # then run the flow
#            pkill -INT -f "simctl io.*recordVideo"   (SIGINT finalizes the .mov)
set -euo pipefail

# --- contact-sheet mode: CFR-normalize + emit a timestamped 1fps grid for picking windows ---
if [ "${1:-}" = "--contact" ]; then
  RAW="${2:?usage: clip-to-evidence.sh --contact <raw-video>}"
  command -v ffmpeg >/dev/null || { echo "clip-to-evidence: ffmpeg not found" >&2; exit 3; }
  ffmpeg -y -i "$RAW" -vf "fps=30,scale=540:-2" -c:v libx264 -crf 23 -preset veryfast -an /tmp/_clip_norm.mp4 >/dev/null 2>&1
  ffmpeg -y -i /tmp/_clip_norm.mp4 -vf "fps=1,scale=120:-1,drawtext=text='%{pts\:hms}':x=3:y=3:fontsize=13:fontcolor=red,tile=8x5" /tmp/_clip_contact.png >/dev/null 2>&1
  echo "wrote /tmp/_clip_norm.mp4 ($(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 /tmp/_clip_norm.mp4)s) and /tmp/_clip_contact.png — Read the PNG, pick the gif window (the repro action) on THIS timeline."
  exit 0
fi

RAW="${1:?usage: clip-to-evidence.sh <raw-video> <out-basename> [gif-start] [gif-dur] [gif-width] [mp4-start] [mp4-dur]}"
OUT="${2:?usage: clip-to-evidence.sh <raw-video> <out-basename> [gif-start] [gif-dur] [gif-width] [mp4-start] [mp4-dur]}"
GIF_START="${3:-0}"
GIF_DUR="${4:-}"            # empty = whole clip
GIF_W="${5:-320}"
MP4_START_IN="${6:-}"      # empty = auto (gif_start - CTX)
MP4_DUR_IN="${7:-}"       # empty = auto (gif_dur + 2*CTX)
CTX="${CLIP_CONTEXT_SEC:-20}"   # seconds of context to keep each side of the repro in the MP4
MP4_W=540

command -v ffmpeg >/dev/null || { echo "clip-to-evidence: ffmpeg not found" >&2; exit 3; }
[ -f "$RAW" ] || { echo "clip-to-evidence: raw video not found: $RAW" >&2; exit 1; }

# 1) CFR-normalize the raw (fixes iOS VFR: static screens keep frames, seeks become accurate).
NORM=/tmp/_clip_norm.mp4
ffmpeg -y -i "$RAW" -vf "fps=30,scale=${MP4_W}:-2" -c:v libx264 -crf 23 -preset veryfast -an "$NORM" >/dev/null 2>&1
DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$NORM")

# 2) MP4 = LONG context window around the repro (repro ± CTX), from the normalized clip.
if [ -n "$MP4_START_IN" ]; then
  MP4_START="$MP4_START_IN"; MP4_DUR="${MP4_DUR_IN:-$(awk "BEGIN{print $DUR-$MP4_START_IN}")}"
elif [ -n "$GIF_DUR" ]; then
  MP4_START=$(awk "BEGIN{s=$GIF_START-$CTX; if(s<0)s=0; print s}")
  MP4_DUR=$(awk "BEGIN{d=$GIF_DUR+2*$CTX; m=$DUR-$MP4_START; if(d>m)d=m; print d}")
else
  MP4_START=0; MP4_DUR="$DUR"   # no gif window given → whole clip
fi
ffmpeg -y -ss "$MP4_START" -t "$MP4_DUR" -i "$NORM" -c:v libx264 -crf 28 -preset veryfast \
  -movflags +faststart -an "${OUT}.mp4" >/dev/null 2>&1

# 3) Optimized looping GIF of the TIGHT action window (palettegen/paletteuse for clean colors).
DUR_ARGS=()
[ -n "$GIF_DUR" ] && DUR_ARGS=(-t "$GIF_DUR")
# Safe expansion of a possibly-empty array under `set -u` (macOS bash 3.2 errors on "${arr[@]}" when empty).
ffmpeg -y -ss "$GIF_START" ${DUR_ARGS[@]+"${DUR_ARGS[@]}"} -i "$NORM" \
  -vf "fps=15,scale=${GIF_W}:-1:flags=lanczos,palettegen=stats_mode=diff" "/tmp/_clip_pal.png" >/dev/null 2>&1
ffmpeg -y -ss "$GIF_START" ${DUR_ARGS[@]+"${DUR_ARGS[@]}"} -i "$NORM" -i "/tmp/_clip_pal.png" \
  -lavfi "fps=15,scale=${GIF_W}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" \
  "${OUT}.gif" >/dev/null 2>&1

mp4sz=$(wc -c < "${OUT}.mp4"); gifsz=$(wc -c < "${OUT}.gif")
mp4dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${OUT}.mp4")
gifdur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${OUT}.gif")
echo "wrote ${OUT}.mp4 (${mp4dur}s, $((mp4sz/1024))KB — context window) and ${OUT}.gif (${gifdur}s, $((gifsz/1024))KB — tight action)"
