#!/usr/bin/env bash

set -euo pipefail

readonly ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly ANDROID_DIR="$ROOT_DIR/Mobile-Expensify/Android"
readonly PACKAGE_NAME="org.me.mobiexpensifyg"
readonly PROFILE_DIR="$ROOT_DIR/.pgo/android/arm64-v8a"
readonly BUILD_VARIANT="Release"

function usage() {
    echo "Usage: $0 {build-instrumented|dump|pull|merge|build-optimized}"
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

case "${1:-}" in
    build-instrumented)
        gradle ":assemble$BUILD_VARIANT" \
            -PpatchedArtifacts.forceBuildFromSource=true \
            -PreactNativeArchitectures=arm64-v8a \
            -PpgoMode=generate
        ;;
    dump)
        adb shell am broadcast \
            -a "$PACKAGE_NAME.action.WRITE_PGO_PROFILES" \
            -n "$PACKAGE_NAME/.PgoProfileReceiver"
        ;;
    pull)
        rm -rf "$PROFILE_DIR/raw"
        mkdir -p "$PROFILE_DIR/raw"
        adb exec-out run-as "$PACKAGE_NAME" tar -C cache -cf - . | tar -C "$PROFILE_DIR/raw" -xf -
        find "$PROFILE_DIR/raw" -name '*.profraw' -print
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
        ;;
    build-optimized)
        if [[ ! -f "$PROFILE_DIR/newdot.profdata" ]]; then
            echo "Missing $PROFILE_DIR/newdot.profdata. Run merge first." >&2
            exit 1
        fi
        gradle ":app:assemble$BUILD_VARIANT" \
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
