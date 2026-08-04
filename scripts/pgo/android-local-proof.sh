#!/usr/bin/env bash

set -euo pipefail

readonly NDK_VERSION="27.1.12297006"
readonly ANDROID_NDK_HOME="/Users/chris/Library/Android/sdk/ndk/$NDK_VERSION"

readonly ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly PACKAGE_NAME="org.me.mobiexpensifyg"
readonly BUILD_VARIANT="Release"

readonly PROFILE_DIR="$ROOT_DIR/.pgo/android/arm64-v8a"
readonly ANDROID_DIR="$ROOT_DIR/Mobile-Expensify/Android"
readonly APK_PATH="$ANDROID_DIR/build/outputs/apk/release/Expensify-release.apk"
readonly DEVICE_PROFILE_DIR="/sdcard/Android/data/$PACKAGE_NAME/cache"

function usage() {
    echo "Usage: $0 {build-instrumented|verify-instrumented|install|dump|pull|merge|build-optimized}"
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

function install_apk() {
    if [[ ! -f "$APK_PATH" ]]; then
        echo "Missing APK at $APK_PATH. Build the APK first." >&2
        exit 1
    fi

    adb install -r "$APK_PATH"
}

function verify_pgo_instrumentation() (
    local apk_path="${1:-$APK_PATH}"
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
    install)
        install_apk
        ;;
    dump)
        adb shell am broadcast \
            -a "$PACKAGE_NAME.action.WRITE_PGO_PROFILES" \
            -n "$PACKAGE_NAME/.PgoProfileReceiver"
        ;;
    pull)
        rm -rf "$PROFILE_DIR/raw"
        mkdir -p "$PROFILE_DIR/raw"
        adb pull "$DEVICE_PROFILE_DIR/." "$PROFILE_DIR/raw"
        profiles=()
        while IFS= read -r profile; do
            profiles+=("$profile")
        done < <(find "$PROFILE_DIR/raw" -name '*.profraw' -type f)
        if [[ "${#profiles[@]}" -eq 0 ]]; then
            echo "No .profraw files found in $DEVICE_PROFILE_DIR. Run dump first." >&2
            exit 1
        fi
        printf '%s\n' "${profiles[@]}"
        ;;
    merge)
        mkdir -p "$PROFILE_DIR"
        profiles=()
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
