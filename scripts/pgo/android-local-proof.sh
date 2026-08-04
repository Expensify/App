#!/usr/bin/env bash

set -euo pipefail

readonly NDK_VERSION="27.1.12297006"
readonly ANDROID_NDK_HOME="/Users/chris/Library/Android/sdk/ndk/$NDK_VERSION"

readonly ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly PACKAGE_NAME="org.me.mobiexpensifyg"
readonly INSTRUMENTED_BUILD_VARIANT="PgoInstrumented"
readonly OPTIMIZED_BUILD_VARIANT="PgoOptimized"

readonly PROFILE_DIR="$ROOT_DIR/.pgo/android/arm64-v8a"
readonly ANDROID_DIR="$ROOT_DIR/Mobile-Expensify/Android"
readonly INSTRUMENTED_APK_PATH="$ANDROID_DIR/build/outputs/apk/pgoInstrumented/Expensify-pgoInstrumented.apk"
readonly OPTIMIZED_APK_PATH="$ANDROID_DIR/build/outputs/apk/pgoOptimized/Expensify-pgoOptimized.apk"
readonly DEVICE_PROFILE_DIR="/sdcard/Android/data/$PACKAGE_NAME/cache"
readonly START_ACTIVITY="$PACKAGE_NAME/.ExpensifyActivityBase"
readonly APP_READY_LOG_TAG="NewDotStartup"
readonly APP_READY_LOG_MESSAGE="APP_READY"
readonly DEFAULT_STARTUP_RUNS=10
readonly DEFAULT_APP_READY_TIMEOUT_SECONDS=30
readonly STARTUP_RELAUNCH_DELAY_SECONDS=0.5
readonly PROFILE_DUMP_TIMEOUT_SECONDS=5

function usage() {
    echo "Usage: $0 {build-instrumented|verify-instrumented|install-instrumented|install-optimized|record-startups [runs] [ready-timeout-seconds]|dump|pull|merge|build-optimized}"
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
    gradle ":assemble$INSTRUMENTED_BUILD_VARIANT" \
        -PpatchedArtifacts.forceBuildFromSource=true \
        -PreactNativeArchitectures=arm64-v8a \
        -PpgoMode=generate
}

function build_optimized() {
    if [[ ! -f "$PROFILE_DIR/newdot.profdata" ]]; then
        echo "Missing $PROFILE_DIR/newdot.profdata. Run merge first." >&2
        exit 1
    fi

    gradle ":assemble$OPTIMIZED_BUILD_VARIANT" \
        -PpatchedArtifacts.forceBuildFromSource=true \
        -PreactNativeArchitectures=arm64-v8a \
        -PpgoMode=use \
        -PpgoProfile="$PROFILE_DIR/newdot.profdata"
}

function install_apk() {
    local apk_path="$1"
    if [[ ! -f "$apk_path" ]]; then
        echo "Missing APK at $apk_path. Build the APK first." >&2
        exit 1
    fi

    adb install -r "$apk_path"
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
    local runs="${1:-10}"
    local ready_timeout_seconds="${2:-30}"

    if [[ ! "$runs" =~ ^[1-9][0-9]*$ ]]; then
        echo "Startup run count must be a positive integer, received: $runs" >&2
        exit 1
    fi
    if [[ ! "$ready_timeout_seconds" =~ ^[1-9][0-9]*$ ]]; then
        echo "App-ready timeout must be a positive integer, received: $ready_timeout_seconds" >&2
        exit 1
    fi

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

function wait_for_app_ready() {
    local timeout_seconds="$1"
    local started_at="$SECONDS"

    echo "Waiting up to ${timeout_seconds}s for $APP_READY_LOG_TAG: $APP_READY_LOG_MESSAGE."
    while ((SECONDS - started_at < timeout_seconds)); do
        local startup_logs
        startup_logs="$(adb logcat -d -s "$APP_READY_LOG_TAG:I" '*:S')"
        if [[ "$startup_logs" == *"$APP_READY_LOG_MESSAGE"* ]]; then
            echo "NewDot reported APP_READY."
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
    build-instrumented)
        gradle ":assemble$BUILD_VARIANT" \
            -PpatchedArtifacts.forceBuildFromSource=true \
            -PreactNativeArchitectures=arm64-v8a \
            -PpgoMode=generate
        ;;
    verify-instrumented)
        verify_pgo_instrumentation
        ;;
    install | install-instrumented)
        install_apk "$INSTRUMENTED_APK_PATH"
        ;;
    install-optimized)
        install_apk "$OPTIMIZED_APK_PATH"
        ;;
    record-startups)
        record_startups "${2:-10}" "${3:-30}"
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
        if [[ ! -f "$PROFILE_DIR/newdot.profdata" ]]; then
            echo "Missing $PROFILE_DIR/newdot.profdata. Run merge first." >&2
            exit 1
        fi
        gradle ":assemble$BUILD_VARIANT" \
            -PpatchedArtifacts.forceBuildFromSource=true \
            -PreactNativeArchitectures=arm64-v8a \
            -PpgoMode=use \
            -PpgoProfile="$PROFILE_DIR/newdot.profdata"
        ;;
    *)
        usage
        exit 1
        ;;
esac
