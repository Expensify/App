#!/bin/bash
# Time the required lint check both ways, with ESLint's cache in the same warm state CI sees.
#
# CI restores node_modules/.cache/eslint from an earlier run, so on a normal PR every file is a
# cache hit except the ones the PR touched. This reproduces that by priming the cache with the
# dirty files held back, snapshotting it, then timing a whole-repo run against the restored
# snapshot. oxlint has no cache, so it is timed once as-is.
#
#   ./oxlint-migration/compareWarmCache.sh                    # 10 files changed vs the base branch
#   ./oxlint-migration/compareWarmCache.sh src/pages/Foo.tsx   # these exact files are dirty
#   ./oxlint-migration/compareWarmCache.sh --dirty=0          # every file cached (best case for ESLint)
#   ./oxlint-migration/compareWarmCache.sh --dirty=branch     # every file changed vs the base branch
#   ./oxlint-migration/compareWarmCache.sh --runs=3           # repeat the warm run, report each
#   ./oxlint-migration/compareWarmCache.sh --fresh            # re-prime even if a snapshot exists
#
# Pick the dirty files deliberately. `--dirty=N` takes the first N paths alphabetically, which on a
# config-heavy branch is all .mjs and skips the TypeScript program the type-aware rules load, so it
# reads faster than a real PR. Name a couple of src/**/*.tsx files to match one.
set -euo pipefail

ROOT_DIR=$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")
cd "$ROOT_DIR"

CACHE=node_modules/.cache/eslint
SNAPSHOT=node_modules/.cache/eslint.warm-snapshot
STAMP=node_modules/.cache/eslint.warm-stamp
LOG_DIR=/tmp/oxlint-warm-compare
BASE_REF=${BASE_REF:-origin/main}

DIRTY_SPEC=10
RUNS=1
FRESH=0
EXPLICIT_FILES=()
for arg in "$@"; do
    case "$arg" in
        --dirty=*) DIRTY_SPEC="${arg#*=}" ;;
        --runs=*) RUNS="${arg#*=}" ;;
        --fresh) FRESH=1 ;;
        --*)
            echo "unknown option: $arg" >&2
            exit 1
            ;;
        *)
            if [[ ! -f "$arg" ]]; then
                echo "not a file: $arg" >&2
                exit 1
            fi
            EXPLICIT_FILES+=("$arg")
            ;;
    esac
done
if [[ ! "$RUNS" =~ ^[1-9][0-9]*$ ]]; then
    echo "--runs must be a positive integer" >&2
    exit 1
fi
if [[ ! "$DIRTY_SPEC" =~ ^([0-9]+|branch)$ ]]; then
    echo "--dirty must be a number or 'branch'" >&2
    exit 1
fi

mkdir -p "$LOG_DIR"

# The dirty set: the files a hypothetical PR touched, so the ones CI's restored cache would miss.
DIRTY_FILES=()
if [[ ${#EXPLICIT_FILES[@]} -gt 0 ]]; then
    DIRTY_FILES=("${EXPLICIT_FILES[@]}")
elif [[ "$DIRTY_SPEC" != "0" ]]; then
    if ! git rev-parse --verify --quiet "$BASE_REF" >/dev/null; then
        echo "$BASE_REF not found; set BASE_REF to an existing ref" >&2
        exit 1
    fi
    CHANGED=$(git diff --name-only --diff-filter=d "$BASE_REF"...HEAD -- '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.cjs' | sort)
    if [[ -z "$CHANGED" ]]; then
        echo "no lintable files changed vs $BASE_REF; use --dirty=0" >&2
        exit 1
    fi
    if [[ "$DIRTY_SPEC" != "branch" ]]; then
        CHANGED=$(printf '%s\n' "$CHANGED" | head -n "$DIRTY_SPEC")
    fi
    while IFS= read -r file; do
        DIRTY_FILES+=("$file")
    done <<<"$CHANGED"
fi

# Match scripts/lint.ts exactly: a different flag set is a different cache, and the prime is wasted.
# Concurrency and heap default to what the CI job sets (.github/workflows/lint.yml:83-84) rather than
# what scripts/lint.ts defaults to, both because CI is what this reproduces and because
# `--concurrency=auto` gives every core its own worker at ~12 GB of type-aware program each, which
# the OS kills long before the run finishes. compareFullRepo.sh hit the same wall.
export ESLINT_CONCURRENCY="${ESLINT_CONCURRENCY:-2}"
export NODE_OPTIONS="${NODE_OPTIONS:---max_old_space_size=14336}"
export SEATBELT_FROZEN="${SEATBELT_FROZEN:-0}"
ESLINT_FLAGS=(--cache --cache-location="$CACHE" --cache-strategy content --quiet
    "--concurrency=$ESLINT_CONCURRENCY" --no-warn-ignored)

STAMP_VALUE=$(printf '%s\n' ${DIRTY_FILES[@]+"${DIRTY_FILES[@]}"} | shasum | cut -d' ' -f1)
if [[ "$FRESH" == 1 || ! -s "$SNAPSHOT" || $(cat "$STAMP" 2>/dev/null || true) != "$STAMP_VALUE" ]]; then
    IGNORE_FLAGS=()
    for file in ${DIRTY_FILES[@]+"${DIRTY_FILES[@]}"}; do
        IGNORE_FLAGS+=(--ignore-pattern "$file")
    done
    echo "Priming ESLint cache with ${#DIRTY_FILES[@]} file(s) held back (cold, several minutes)..."
    rm -f "$CACHE"
    SECONDS=0
    npx eslint . "${ESLINT_FLAGS[@]}" ${IGNORE_FLAGS[@]+"${IGNORE_FLAGS[@]}"} >"$LOG_DIR/prime.log" 2>&1 || true
    COLD_SECONDS=$SECONDS
    # ESLint exits non-zero on findings, which is fine, but it writes no cache if it was killed
    # part-way. Without this check the run below would silently time a cold lint as a warm one.
    if [[ ! -s "$CACHE" ]]; then
        echo "prime wrote no cache after ${COLD_SECONDS}s; it was killed. See $LOG_DIR/prime.log" >&2
        echo "lower the worker count, e.g. ESLINT_CONCURRENCY=1 $0 $*" >&2
        exit 1
    fi
    echo "$COLD_SECONDS" >"$LOG_DIR/prime.time"
    cp "$CACHE" "$SNAPSHOT"
    echo "$STAMP_VALUE" >"$STAMP"
else
    COLD_SECONDS=$(cat "$LOG_DIR/prime.time" 2>/dev/null || echo '?')
    echo "Reusing primed cache snapshot (pass --fresh to re-prime)"
fi

# A timed run writes the dirty files into the cache, so restore the snapshot before each one.
WARM_TIMES=()
for ((i = 1; i <= RUNS; i++)); do
    cp "$SNAPSHOT" "$CACHE"
    echo "Warm ESLint run $i/$RUNS (npm run lint, whole repo)..."
    SECONDS=0
    npm run lint >"$LOG_DIR/warm-$i.log" 2>&1 || true
    WARM_TIMES+=("$SECONDS")
done

# `--quiet` mirrors the flag scripts/lint.ts passes ESLint. It is a no-op while every oxlint finding
# here is an error, and becomes the matching flag if the seatbelt counterpart lands as a downgrade to
# warning. Set OXLINT_SILENT=1 to drop diagnostic output entirely, which is what the check costs once
# the findings are baselined rather than printed 4498 at a time.
OXLINT_FLAGS=(--type-aware --quiet)
if [[ -n "${OXLINT_SILENT:-}" ]]; then
    OXLINT_FLAGS+=(--silent)
fi
echo "oxlint run (whole repo, ${OXLINT_FLAGS[*]}, no cache)..."
SECONDS=0
npx oxlint "${OXLINT_FLAGS[@]}" >"$LOG_DIR/oxlint.log" 2>&1 || true
OXLINT_SECONDS=$SECONDS

echo
echo "dirty files: ${#DIRTY_FILES[@]}   base ref: $BASE_REF   logs: $LOG_DIR"
printf 'ESLint cold prime  %6ss\n' "$COLD_SECONDS"
for ((i = 1; i <= RUNS; i++)); do
    printf 'ESLint warm run %-2s %6ss\n' "$i" "${WARM_TIMES[i - 1]}"
done
printf 'oxlint             %6ss\n' "$OXLINT_SECONDS"
if [[ "$OXLINT_SECONDS" -gt 0 ]]; then
    BEST_WARM=$(printf '%s\n' "${WARM_TIMES[@]}" | sort -n | head -1)
    awk -v w="$BEST_WARM" -v o="$OXLINT_SECONDS" 'BEGIN {printf "warm ESLint / oxlint = %.2fx\n", w / o}'
    if [[ "$COLD_SECONDS" != '?' ]]; then
        awk -v c="$COLD_SECONDS" -v o="$OXLINT_SECONDS" 'BEGIN {printf "cold ESLint / oxlint = %.2fx\n", c / o}'
    fi
fi
