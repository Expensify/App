#!/usr/bin/env bash
# Publish QA evidence (screenshots, GIFs, MP4s) to the evidence repo and print the
# base raw URL the report comment embeds images from.
#
# Usage:
#   publish-evidence.sh <pr-number> <dir> [<dir> ...]
#   # e.g. publish-evidence.sh 93296 ai-qa-poc/PR-93296/screens ai-qa-poc/PR-93296/videos
#
# Copies *.png *.jpg *.gif *.mp4 from each given dir (flattened into PR-<n>/), EXCLUDING
# any *-raw.* files (keep raw captures local; publish only the compressed/derived ones).
#
# Output (stdout, LAST line): the base raw URL, e.g.
#   https://raw.githubusercontent.com/<owner>/<repo>/main/PR-93059
# Embed in the report: screenshots/GIFs as ![](<base>/<file>.png|.gif) (render inline);
# MP4s as a [link](<base>/<file>.mp4) — GitHub does NOT inline-play raw MP4s in comments,
# so use a GIF for inline motion and link the MP4 for full quality (see methodology.md).
#
# Config — resolved as: process env > sibling .env > built-in default.
#   EVIDENCE_REPO    owner/name of the evidence repo   (REQUIRED — set in helpers/.env)
#   EVIDENCE_BRANCH  branch images live on             (default: main)
#   EVIDENCE_CACHE   local working clone path          (default: /tmp/qa-evidence)
# EVIDENCE_REPO is per-user (each user owns their own evidence repo) and lives in the
# gitignored helpers/.env — never hardcoded here. In CI set it as an env var / secret
# (process env always wins). Auth: the active `gh`/git identity needs `contents:write`
# on EVIDENCE_REPO (a fine-grained PAT or a GitHub App installation token in CI).
set -euo pipefail

PR="${1:?usage: publish-evidence.sh <pr-number> <dir> [<dir> ...]}"
shift
SRCS=("$@")
if [ "${#SRCS[@]}" -eq 0 ]; then
  echo "publish-evidence: give at least one source dir" >&2; exit 2
fi

# Load config defaults from sibling .env WITHOUT clobbering anything already in the
# environment (so CI-provided env vars take precedence over the committed/local .env).
ENV_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  while IFS='=' read -r key val; do
    case "$key" in ''|'#'*) continue ;; esac
    key="$(printf '%s' "$key" | tr -d '[:space:]')"
    [ -z "$key" ] && continue
    if [ -z "${!key:-}" ]; then export "$key=$val"; fi
  done < "$ENV_FILE"
fi

EVIDENCE_BRANCH="${EVIDENCE_BRANCH:-main}"
EVIDENCE_CACHE="${EVIDENCE_CACHE:-/tmp/qa-evidence}"

if [ -z "${EVIDENCE_REPO:-}" ]; then
  echo "publish-evidence: EVIDENCE_REPO is not set. Set it (owner/name of YOUR public" >&2
  echo "  evidence repo) in $ENV_FILE, or export it as an env var / CI secret." >&2
  exit 2
fi


# Clone once; reuse and hard-reset to the remote on later runs.
if [ -d "$EVIDENCE_CACHE/.git" ]; then
  git -C "$EVIDENCE_CACHE" fetch -q origin "$EVIDENCE_BRANCH"
  git -C "$EVIDENCE_CACHE" checkout -q "$EVIDENCE_BRANCH"
  git -C "$EVIDENCE_CACHE" reset -q --hard "origin/$EVIDENCE_BRANCH"
else
  rm -rf "$EVIDENCE_CACHE"
  gh repo clone "$EVIDENCE_REPO" "$EVIDENCE_CACHE" -- -q --branch "$EVIDENCE_BRANCH"
fi

DEST="$EVIDENCE_CACHE/PR-$PR"
mkdir -p "$DEST"
# Copy png/jpg/gif/mp4 from each source dir (flat), overwriting so re-runs refresh.
# Skip *-raw.* (raw captures stay local; only publish compressed/derived files).
copied=0
for d in "${SRCS[@]}"; do
  [ -d "$d" ] || continue
  while IFS= read -r -d '' f; do
    case "$f" in *-raw.*) continue ;; esac
    cp -f "$f" "$DEST"/ && copied=$((copied+1))
  done < <(find "$d" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.gif' -o -iname '*.mp4' \) -print0)
done
if [ "$copied" -eq 0 ]; then
  echo "publish-evidence: no publishable files (png/jpg/gif/mp4) found in: ${SRCS[*]}" >&2
  exit 1
fi

git -C "$EVIDENCE_CACHE" add "PR-$PR"
if git -C "$EVIDENCE_CACHE" diff --cached --quiet; then
  echo "publish-evidence: evidence already up to date, nothing to push" >&2
else
  git -C "$EVIDENCE_CACHE" \
      -c user.name="argent-qa-pr" \
      -c user.email="argent-qa-pr@users.noreply.github.com" \
      commit -q -m "PR-$PR: QA evidence"
  git -C "$EVIDENCE_CACHE" push -q origin "$EVIDENCE_BRANCH"
fi

echo "https://raw.githubusercontent.com/$EVIDENCE_REPO/$EVIDENCE_BRANCH/PR-$PR"
