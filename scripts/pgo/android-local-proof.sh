#!/usr/bin/env bash

set -euo pipefail

readonly NDK_VERSION="27.1.12297006"
readonly ANDROID_NDK_HOME="/Users/chris/Library/Android/sdk/ndk/$NDK_VERSION"

readonly ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly PACKAGE_NAME="org.me.mobiexpensifyg"
readonly RELEASE_BUILD_VARIANT="Release"

readonly PROFILE_DIR="$ROOT_DIR/.pgo/android/arm64-v8a"
readonly APK_DIR="$PROFILE_DIR/apk"
readonly BENCHMARK_DIR="$ROOT_DIR/.pgo/android/benchmarks"
readonly ANDROID_DIR="$ROOT_DIR/Mobile-Expensify/Android"
readonly GRADLE_RELEASE_APK_PATH="$ANDROID_DIR/build/outputs/apk/release/Expensify-release.apk"
readonly RELEASE_APK_PATH="$APK_DIR/Expensify-release.apk"
readonly INSTRUMENTED_APK_PATH="$APK_DIR/Expensify-release-instrumented.apk"
readonly OPTIMIZED_APK_PATH="$APK_DIR/Expensify-release-optimized.apk"
readonly RELEASE_BENCHMARK_PATH="$BENCHMARK_DIR/release.csv"
readonly OPTIMIZED_BENCHMARK_PATH="$BENCHMARK_DIR/pgo-optimized.csv"
readonly DEVICE_PROFILE_DIR="/sdcard/Android/data/$PACKAGE_NAME/cache"
readonly START_ACTIVITY="$PACKAGE_NAME/.ExpensifyActivityBase"
readonly APP_READY_LOG_TAG="NewDotStartup"
readonly APP_READY_LOG_MESSAGE="APP_READY"
readonly DEFAULT_STARTUP_RUNS=10
readonly DEFAULT_APP_READY_TIMEOUT_SECONDS=30
readonly STARTUP_RELAUNCH_DELAY_SECONDS=0.5
readonly PROFILE_DUMP_TIMEOUT_SECONDS=5

APP_READY_DURATION_MS=""

function usage() {
    echo "Usage: $0 {build-release|build-instrumented|build-optimized|verify-instrumented|install-release|install-instrumented|install-optimized|record-startups [runs] [ready-timeout-seconds]|benchmark-release [runs] [ready-timeout-seconds]|benchmark-optimized [runs] [ready-timeout-seconds]|benchmark [runs] [ready-timeout-seconds]|compare-benchmarks|dump|pull|merge}"
}

function ndk_tool() {
    local tool_name="$1"
    local ndk_root="${ANDROID_NDK_HOME:-${ANDROID_NDK_ROOT:-}}"
    if [[ -z "$ndk_root" ]]; then
        echo "Set ANDROID_NDK_HOME (or ANDROID_NDK_ROOT) to the NDK used by the build." >&2
        exit 1
    fi

    local host_tag="darwin-x86_64"
    if [[ "$(uname -s)" == "Linux" ]]; then
        host_tag="linux-x86_64"
    fi
    echo "$ndk_root/toolchains/llvm/prebuilt/$host_tag/bin/$tool_name"
}

function gradle() {
    (
        cd "$ANDROID_DIR"
        ./gradlew "$@"
    )
}

function build_instrumented() {
    gradle ":assemble$RELEASE_BUILD_VARIANT" \
        -PpatchedArtifacts.forceBuildFromSource=true \
        -PreactNativeArchitectures=arm64-v8a \
        -PpgoMode=generate
    copy_release_apk "$INSTRUMENTED_APK_PATH"
}

function build_release() {
    gradle ":assemble$RELEASE_BUILD_VARIANT" \
        -PpatchedArtifacts.forceBuildFromSource=true \
        -PreactNativeArchitectures=arm64-v8a \
        -PpgoMode=off
    copy_release_apk "$RELEASE_APK_PATH"
}

function build_optimized() {
    if [[ ! -f "$PROFILE_DIR/newdot.profdata" ]]; then
        echo "Missing $PROFILE_DIR/newdot.profdata. Run merge first." >&2
        exit 1
    fi

    gradle ":assemble$RELEASE_BUILD_VARIANT" \
        -PpatchedArtifacts.forceBuildFromSource=true \
        -PreactNativeArchitectures=arm64-v8a \
        -PpgoMode=use \
        -PpgoProfile="$PROFILE_DIR/newdot.profdata"
    copy_release_apk "$OPTIMIZED_APK_PATH"
}

function copy_release_apk() {
    local archived_apk_path="$1"
    if [[ ! -f "$GRADLE_RELEASE_APK_PATH" ]]; then
        echo "Missing built release APK at $GRADLE_RELEASE_APK_PATH." >&2
        exit 1
    fi

    mkdir -p "$APK_DIR"
    cp -f "$GRADLE_RELEASE_APK_PATH" "$archived_apk_path"
    echo "Copied release APK: $archived_apk_path"
}

function install_apk() {
    local apk_path="$1"
    if [[ ! -f "$apk_path" ]]; then
        echo "Missing APK at $apk_path. Build the APK first." >&2
        exit 1
    fi

    adb install -r "$apk_path"
    echo "Installed APK: $apk_path"
}

function dump_profiles() {
    adb logcat -c
    adb shell am broadcast \
        -a "$PACKAGE_NAME.action.WRITE_PGO_PROFILES" \
        -n "$PACKAGE_NAME/.PgoProfileReceiver"

    wait_for_profile_dump
}

function wait_for_profile_dump() {
    local started_at="$SECONDS"

    while ((SECONDS - started_at < PROFILE_DUMP_TIMEOUT_SECONDS)); do
        local profile_logs
        profile_logs="$(adb logcat -d -s 'PgoProfileReceiver:I' '*:S')"

        if [[ "$profile_logs" =~ Wrote\ ([1-9][0-9]*)\ LLVM\ PGO\ profile ]]; then
            echo "${BASH_REMATCH[0]}(s)."
            return 0
        fi
        if [[ "$profile_logs" == *"Ignoring PGO profile request in a non-instrumented build."* ]]; then
            echo "The installed APK is not instrumented. Build and install build-instrumented before recording profiles; build-optimized cannot generate .profraw files." >&2
            return 1
        fi
        if [[ "$profile_logs" == *"Wrote 0 LLVM PGO profile(s)."* ]]; then
            echo "The receiver found no instrumented native libraries in the installed APK. Rebuild and install build-instrumented before recording profiles." >&2
            return 1
        fi

        sleep 0.1
    done

    echo "The PGO receiver did not confirm a profile write within ${PROFILE_DUMP_TIMEOUT_SECONDS}s." >&2
    adb logcat -d -s 'PgoProfileReceiver:I' '*:S' >&2
    return 1
}

function pull_profiles() {
    rm -rf "$PROFILE_DIR/raw"
    mkdir -p "$PROFILE_DIR/raw"
    adb pull "$DEVICE_PROFILE_DIR/." "$PROFILE_DIR/raw"

    local -a profiles=()
    local profile
    while IFS= read -r profile; do
        profiles+=("$profile")
    done < <(find "$PROFILE_DIR/raw" -name '*.profraw' -type f)

    if [[ "${#profiles[@]}" -eq 0 ]]; then
        echo "No .profraw files found in $DEVICE_PROFILE_DIR. Run dump first." >&2
        exit 1
    fi
    printf '%s\n' "${profiles[@]}"
}

function merge_profiles() {
    mkdir -p "$PROFILE_DIR"

    local -a profiles=()
    local profile
    while IFS= read -r profile; do
        profiles+=("$profile")
    done < <(find "$PROFILE_DIR/raw" -name '*.profraw' -type f)

    if [[ "${#profiles[@]}" -eq 0 ]]; then
        echo "No .profraw files found. Run dump and pull first." >&2
        exit 1
    fi

    "$(ndk_tool llvm-profdata)" merge --output="$PROFILE_DIR/newdot.profdata" "${profiles[@]}"
    "$(ndk_tool llvm-profdata)" show --all-functions "$PROFILE_DIR/newdot.profdata" > "$PROFILE_DIR/newdot.profdata.txt"
    echo "Merged PGO profile: $PROFILE_DIR/newdot.profdata"
}

function record_startups() {
    local runs="${1:-$DEFAULT_STARTUP_RUNS}"
    local ready_timeout_seconds="${2:-$DEFAULT_APP_READY_TIMEOUT_SECONDS}"

    validate_startup_arguments "$runs" "$ready_timeout_seconds"

    echo "Clearing previous device PGO profiles from $DEVICE_PROFILE_DIR."
    adb shell "rm -f '$DEVICE_PROFILE_DIR'/newdot-*.profraw"

    local run
    for ((run = 1; run <= runs; run++)); do
        echo "Recording cold-process startup $run/$runs."
        adb shell am force-stop "$PACKAGE_NAME"
        sleep "$STARTUP_RELAUNCH_DELAY_SECONDS"
        adb logcat -c
        adb shell am start -W -n "$START_ACTIVITY"
        wait_for_app_ready "$ready_timeout_seconds"
        dump_profiles
    done

    pull_profiles
    merge_profiles
}

function validate_startup_arguments() {
    local runs="$1"
    local ready_timeout_seconds="$2"

    if [[ ! "$runs" =~ ^[1-9][0-9]*$ ]]; then
        echo "Startup run count must be a positive integer, received: $runs" >&2
        exit 1
    fi
    if [[ ! "$ready_timeout_seconds" =~ ^[1-9][0-9]*$ ]]; then
        echo "App-ready timeout must be a positive integer, received: $ready_timeout_seconds" >&2
        exit 1
    fi
}

function measure_startup() {
    local ready_timeout_seconds="$1"

    adb shell am force-stop "$PACKAGE_NAME"
    sleep "$STARTUP_RELAUNCH_DELAY_SECONDS"
    adb logcat -c
    adb shell am start -W -n "$START_ACTIVITY"
    wait_for_app_ready "$ready_timeout_seconds"

    if [[ -z "$APP_READY_DURATION_MS" ]]; then
        echo "APP_READY did not contain a numeric durationMs marker. Rebuild the APK with the startup metric changes." >&2
        return 1
    fi
}

function benchmark_startups() {
    local label="$1"
    local benchmark_path="$2"
    local runs="$3"
    local ready_timeout_seconds="$4"

    validate_startup_arguments "$runs" "$ready_timeout_seconds"
    mkdir -p "$BENCHMARK_DIR"

    echo "Running one unmeasured warm-up startup for $label."
    measure_startup "$ready_timeout_seconds"

    printf 'run,duration_ms\n' > "$benchmark_path"
    local run
    for ((run = 1; run <= runs; run++)); do
        echo "Benchmarking $label cold-process startup $run/$runs."
        measure_startup "$ready_timeout_seconds"
        printf '%d,%s\n' "$run" "$APP_READY_DURATION_MS" >> "$benchmark_path"
    done

    echo "Recorded $runs $label startup samples: $benchmark_path"
}

function benchmark_stats() {
    local benchmark_path="$1"

    awk -F, '
        function percentile(fraction, position, lower_index, remainder) {
            position = 1 + (count - 1) * fraction
            lower_index = int(position)
            remainder = position - lower_index
            if (lower_index >= count) {
                return values[count]
            }
            return values[lower_index] + remainder * (values[lower_index + 1] - values[lower_index])
        }
        NR > 1 && $2 ~ /^[0-9]+$/ {
            values[++count] = $2
            sum += $2
        }
        END {
            if (count == 0) {
                exit 1
            }
            for (i = 1; i <= count; i++) {
                for (j = i + 1; j <= count; j++) {
                    if (values[i] > values[j]) {
                        temporary = values[i]
                        values[i] = values[j]
                        values[j] = temporary
                    }
                }
            }
            printf "%d %.2f %.2f %.2f %.2f %.2f %.2f %d %d\n", count, sum / count, percentile(0.50), percentile(0.75), percentile(0.90), percentile(0.95), percentile(0.99), values[1], values[count]
        }
    ' "$benchmark_path"
}

function percentage_improvement() {
    local release_value="$1"
    local optimized_value="$2"

    awk -v release="$release_value" -v optimized="$optimized_value" 'BEGIN { printf "%.2f", ((release - optimized) / release) * 100 }'
}

function compare_benchmarks() {
    if [[ ! -f "$RELEASE_BENCHMARK_PATH" || ! -f "$OPTIMIZED_BENCHMARK_PATH" ]]; then
        echo "Missing benchmark data. Run benchmark-release and benchmark-optimized first." >&2
        exit 1
    fi

    local release_count release_average release_p50 release_p75 release_p90 release_p95 release_p99 release_min release_max
    read -r release_count release_average release_p50 release_p75 release_p90 release_p95 release_p99 release_min release_max < <(benchmark_stats "$RELEASE_BENCHMARK_PATH")
    local optimized_count optimized_average optimized_p50 optimized_p75 optimized_p90 optimized_p95 optimized_p99 optimized_min optimized_max
    read -r optimized_count optimized_average optimized_p50 optimized_p75 optimized_p90 optimized_p95 optimized_p99 optimized_min optimized_max < <(benchmark_stats "$OPTIMIZED_BENCHMARK_PATH")

    local average_improvement p50_improvement p75_improvement p90_improvement p95_improvement p99_improvement min_improvement max_improvement
    average_improvement="$(percentage_improvement "$release_average" "$optimized_average")"
    p50_improvement="$(percentage_improvement "$release_p50" "$optimized_p50")"
    p75_improvement="$(percentage_improvement "$release_p75" "$optimized_p75")"
    p90_improvement="$(percentage_improvement "$release_p90" "$optimized_p90")"
    p95_improvement="$(percentage_improvement "$release_p95" "$optimized_p95")"
    p99_improvement="$(percentage_improvement "$release_p99" "$optimized_p99")"
    min_improvement="$(percentage_improvement "$release_min" "$optimized_min")"
    max_improvement="$(percentage_improvement "$release_max" "$optimized_max")"

    echo "Positive percentages are faster; negative percentages are regressions."
    printf '%-18s %5s %10s %9s %9s %9s %9s %9s %8s %8s\n' 'Build' 'Runs' 'Average' 'P50' 'P75' 'P90' 'P95' 'P99' 'Min' 'Max'
    printf '%-18s %5d %10.2f %9.2f %9.2f %9.2f %9.2f %9.2f %8d %8d\n' 'Release' "$release_count" "$release_average" "$release_p50" "$release_p75" "$release_p90" "$release_p95" "$release_p99" "$release_min" "$release_max"
    printf '%-18s %5d %10.2f %9.2f %9.2f %9.2f %9.2f %9.2f %8d %8d\n' 'PGO optimized' "$optimized_count" "$optimized_average" "$optimized_p50" "$optimized_p75" "$optimized_p90" "$optimized_p95" "$optimized_p99" "$optimized_min" "$optimized_max"
    printf '%-18s %5s %10s %9s %9s %9s %9s %9s %8s %8s\n' 'PGO improvement' '-' "${average_improvement}%" "${p50_improvement}%" "${p75_improvement}%" "${p90_improvement}%" "${p95_improvement}%" "${p99_improvement}%" "${min_improvement}%" "${max_improvement}%"
}

function benchmark_release() {
    install_apk "$RELEASE_APK_PATH"
    benchmark_startups "release" "$RELEASE_BENCHMARK_PATH" "${1:-$DEFAULT_STARTUP_RUNS}" "${2:-$DEFAULT_APP_READY_TIMEOUT_SECONDS}"
}

function benchmark_optimized() {
    install_apk "$OPTIMIZED_APK_PATH"
    benchmark_startups "PGO optimized" "$OPTIMIZED_BENCHMARK_PATH" "${1:-$DEFAULT_STARTUP_RUNS}" "${2:-$DEFAULT_APP_READY_TIMEOUT_SECONDS}"
}

function benchmark_all() {
    local runs="${1:-$DEFAULT_STARTUP_RUNS}"
    local ready_timeout_seconds="${2:-$DEFAULT_APP_READY_TIMEOUT_SECONDS}"

    install_apk "$RELEASE_APK_PATH"
    benchmark_startups "release" "$RELEASE_BENCHMARK_PATH" "$runs" "$ready_timeout_seconds"
    install_apk "$OPTIMIZED_APK_PATH"
    benchmark_startups "PGO optimized" "$OPTIMIZED_BENCHMARK_PATH" "$runs" "$ready_timeout_seconds"
    compare_benchmarks
}

function wait_for_app_ready() {
    local timeout_seconds="$1"
    local started_at="$SECONDS"

    APP_READY_DURATION_MS=""
    echo "Waiting up to ${timeout_seconds}s for $APP_READY_LOG_TAG: $APP_READY_LOG_MESSAGE."
    while ((SECONDS - started_at < timeout_seconds)); do
        local startup_logs
        startup_logs="$(adb logcat -d -s "$APP_READY_LOG_TAG:I" '*:S')"
        if [[ "$startup_logs" == *"$APP_READY_LOG_MESSAGE"* ]]; then
            if [[ "$startup_logs" =~ APP_READY\ durationMs=([0-9]+) ]]; then
                APP_READY_DURATION_MS="${BASH_REMATCH[1]}"
                echo "NewDot reported APP_READY after ${APP_READY_DURATION_MS}ms."
            else
                echo "NewDot reported APP_READY without a numeric duration marker."
            fi
            return 0
        fi
        sleep 0.25
    done

    echo "NewDot did not report APP_READY within ${timeout_seconds}s." >&2
    adb logcat -d -s "$APP_READY_LOG_TAG:I" '*:S' >&2
    return 1
}

function verify_pgo_instrumentation() (
    local apk_path="${1:-$INSTRUMENTED_APK_PATH}"
    if [[ ! -f "$apk_path" ]]; then
        echo "Missing APK at $apk_path. Build the instrumented release first." >&2
        exit 1
    fi

    local extracted_dir
    extracted_dir="$(mktemp -d "${TMPDIR:-/tmp}/expensify-pgo-apk.XXXXXX")"
    trap 'rm -rf "$extracted_dir"' EXIT

    local llvm_readelf
    if ! llvm_readelf="$(ndk_tool llvm-readelf)"; then
        exit 1
    fi
    local llvm_nm
    if ! llvm_nm="$(ndk_tool llvm-nm)"; then
        exit 1
    fi

    local libraries=(
        libreactnative.so
        libhermesvm.so
        libjsi.so
        libExpensifyNitroUtils.so
    )
    local library
    for library in "${libraries[@]}"; do
        local apk_entry="lib/arm64-v8a/$library"
        if ! zipinfo -1 "$apk_path" | rg -Fx "$apk_entry" >/dev/null; then
            echo "Missing expected arm64 library in APK: $apk_entry" >&2
            exit 1
        fi

        local extracted_library="$extracted_dir/$library"
        unzip -p "$apk_path" "$apk_entry" > "$extracted_library"
        local section_headers
        section_headers="$("$llvm_readelf" -SW "$extracted_library")"
        if [[ "$section_headers" != *"__llvm_prf_data"* || "$section_headers" != *"__llvm_prf_cnts"* || "$section_headers" != *"__llvm_prf_names"* ]]; then
            echo "LLVM PGO instrumentation is missing from $apk_entry." >&2
            exit 1
        fi

        local dynamic_symbols
        dynamic_symbols="$("$llvm_nm" -D --defined-only "$extracted_library")"
        if [[ "$dynamic_symbols" != *"expensify_llvm_profile_set_filename"* || "$dynamic_symbols" != *"expensify_llvm_profile_write_file"* ]]; then
            echo "LLVM PGO profile-writing APIs are not exported from $apk_entry." >&2
            exit 1
        fi

        if [[ "$library" == "libExpensifyNitroUtils.so" && "$dynamic_symbols" != *"Java_org_me_mobiexpensifyg_PgoProfileWriter_writeProfiles"* ]]; then
            echo "The PGO JNI writer is missing from $apk_entry. Rebuild the native module before installing." >&2
            exit 1
        fi
        echo "Verified LLVM PGO instrumentation: $apk_entry"
    done
)

case "${1:-}" in
    build-release)
        build_release
        ;;
    build-instrumented)
        build_instrumented
        ;;
    verify-instrumented)
        verify_pgo_instrumentation
        ;;
    install | install-instrumented)
        install_apk "$INSTRUMENTED_APK_PATH"
        ;;
    install-release)
        install_apk "$RELEASE_APK_PATH"
        ;;
    install-optimized)
        install_apk "$OPTIMIZED_APK_PATH"
        ;;
    record-startups)
        record_startups "${2:-}" "${3:-}"
        ;;
    dump)
        dump_profiles
        ;;
    pull)
        pull_profiles
        ;;
    merge)
        merge_profiles
        ;;
    build-optimized)
        build_optimized
        ;;
    benchmark-release)
        benchmark_release "${2:-}" "${3:-}"
        ;;
    benchmark-optimized)
        benchmark_optimized "${2:-}" "${3:-}"
        ;;
    benchmark)
        benchmark_all "${2:-}" "${3:-}"
        ;;
    compare-benchmarks)
        compare_benchmarks
        ;;
    *)
        usage
        exit 1
        ;;
esac
