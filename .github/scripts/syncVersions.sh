#!/bin/bash
# Syncs E/App and Mobile-Expensify versions and the Mobile-Expensify submodule pointer on App main.
#
# Only ever invoked by .github/workflows/syncVersions.yml, which is a manual workflow_dispatch
# restricted to mobile deployers and run as OSBotify. It is not meant to be run locally.
#
# Usage: ./.github/scripts/syncVersions.sh <check|sync|version-components>
#
#   check              Records the current submodule gitlink, updates Mobile-Expensify to its latest
#                      main, and decides what kind of sync (if any) is needed.
#   sync               Performs the sync decided by `check` and verifies the result.
#   version-components Prints the native version components derived from a version string. Pure
#                      helper, exposed so it can be unit tested.
#
# Inputs:
#   - Run from the App repo root, after checkout with submodules initialized and git configured
#     with push access to App main.
#   - GITHUB_OUTPUT: written by `check` and `sync` (defaults to /dev/null outside GitHub Actions).
#   - TARGET_VERSION (sync, optional): version to sync to. Must equal the Mobile-Expensify version,
#     since only the App side is rewritten and the final verification compares the two. Empty means
#     "use the Mobile-Expensify version".
#   - NEED_FULL_VERSION_SYNC (sync): 'true' to rewrite versions, anything else to only bump the
#     submodule pointer. Threaded from `check` so exactly one decision exists across both steps.
#   - EXPECTED_SUBMODULE_SHA (sync): Mobile-Expensify SHA `check` updated to. The submodule-only
#     path asserts against it so a checkout that moved in between is caught.
#
# Outputs (via GITHUB_OUTPUT):
#   - check: IN_SYNC, NEED_FULL_VERSION_SYNC, ACTUAL_SHA
#   - sync:  POST_SYNC_APP_VERSION
#
# Side effects:
#   - `check` is not read-only: it runs `git submodule update --remote`.
#   - `sync` commits and pushes to App main.
#   - `sync` never re-runs `git submodule update --remote`, because Mobile-Expensify main can
#     advance while Node is being set up between the two steps.
#   - Never stage with `git add -A`: setupNode leaves an untracked normalized-package-lock.json
#     in the working tree.
#
# Requirements: macOS (BSD sed, PlistBuddy), bash 3.2, git, jq, and npm for the full sync path.
# The version math mirrors generateAndroidVersionCode in scripts/bumpVersion.ts.

set -euo pipefail

GITHUB_OUTPUT="${GITHUB_OUTPUT:-/dev/null}"
TARGET_VERSION="${TARGET_VERSION:-}"
NEED_FULL_VERSION_SYNC="${NEED_FULL_VERSION_SYNC:-}"
EXPECTED_SUBMODULE_SHA="${EXPECTED_SUBMODULE_SHA:-}"

# Writes a step output. Centralized so consecutive outputs don't need individual redirects.
function set_output {
    echo "$1=$2" >> "$GITHUB_OUTPUT"
}

function get_app_version {
    jq -r .version package.json
}

function get_mobile_expensify_version {
    jq -r .meta.version Mobile-Expensify/app/config/config.json
}

# Derives the native version components from an npm version such as 9.3.11-48, and sets:
#   SHORT_VERSION       9.3.11
#   BUILD_NUMBER        48
#   CF_VERSION          9.3.11.48
#   ANDROID_VERSION_CODE 1009031148 (prefix 10 for E/App, then two digits each for major/minor/patch/build)
function compute_version_components {
    local version="$1"

    SHORT_VERSION="${version%-*}"
    BUILD_NUMBER="${version#*-}"
    CF_VERSION="${SHORT_VERSION}.${BUILD_NUMBER}"

    local major
    local minor
    local patch
    IFS='.' read -r major minor patch <<< "$SHORT_VERSION"

    ANDROID_VERSION_CODE="10$(printf '%02d' "$major")$(printf '%02d' "$minor")$(printf '%02d' "$patch")$(printf '%02d' "$BUILD_NUMBER")"
}

function update_android_version {
    local target="$1"

    echo "Updating Android build.gradle with versionName=$target, versionCode=$ANDROID_VERSION_CODE"
    sed -i '' "s/versionName \"[0-9.-]*\"/versionName \"$target\"/" android/app/build.gradle
    sed -i '' "s/versionCode [0-9]*/versionCode $ANDROID_VERSION_CODE/" android/app/build.gradle
}

function update_ios_versions {
    echo "Updating iOS plists with CFBundleShortVersionString=$SHORT_VERSION, CFBundleVersion=$CF_VERSION"
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $SHORT_VERSION" ios/NewExpensify/Info.plist
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $CF_VERSION" ios/NewExpensify/Info.plist
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $SHORT_VERSION" ios/NotificationServiceExtension/Info.plist
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $CF_VERSION" ios/NotificationServiceExtension/Info.plist
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $SHORT_VERSION" ios/ShareViewController/Info.plist
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $CF_VERSION" ios/ShareViewController/Info.plist
}

function resolve_target_version {
    if [[ -n "$TARGET_VERSION" ]]; then
        echo "Using provided target version: $TARGET_VERSION" >&2
        echo "$TARGET_VERSION"
        return
    fi

    # Use Mobile-Expensify version as source of truth since it was pushed first
    local me_version
    me_version="$(get_mobile_expensify_version)"
    echo "Using Mobile-Expensify version as target: $me_version" >&2
    echo "$me_version"
}

function cmd_check {
    local recorded_sha
    recorded_sha=$(git rev-parse HEAD:Mobile-Expensify)
    echo "Submodule commit recorded on App: $recorded_sha"

    git submodule update --remote

    local actual_sha
    actual_sha=$(git -C Mobile-Expensify rev-parse HEAD)
    echo "Mobile-Expensify after remote update: $actual_sha"
    set_output ACTUAL_SHA "$actual_sha"

    local app_version
    local me_version
    app_version="$(get_app_version)"
    me_version="$(get_mobile_expensify_version)"

    echo "E/App version: $app_version"
    echo "Mobile-Expensify version: $me_version"

    if [[ "$recorded_sha" != "$actual_sha" ]]; then
        echo "::warning::⚠️ Submodule pointer is behind Mobile-Expensify main (recorded $recorded_sha, latest $actual_sha)"
    fi

    if [[ "$app_version" == "$me_version" && "$recorded_sha" == "$actual_sha" ]]; then
        echo "::notice::✅ Versions and submodule are in sync ($app_version @ $actual_sha)"
        set_output IN_SYNC true
        set_output NEED_FULL_VERSION_SYNC false
        return
    fi

    set_output IN_SYNC false
    if [[ "$app_version" != "$me_version" ]]; then
        echo "::warning::⚠️ Versions are out of sync - E/App: $app_version, Mobile-Expensify: $me_version"
        set_output NEED_FULL_VERSION_SYNC true
    else
        echo "::notice::Versions match ($app_version) but App must record the latest submodule commit"
        set_output NEED_FULL_VERSION_SYNC false
    fi
}

function sync_full_version {
    local target
    target="$(resolve_target_version)"
    echo "::notice::Syncing E/App to version $target"

    # Update version using npm (this updates package.json and package-lock.json)
    npm --no-git-tag-version version "$target"

    compute_version_components "$target"
    update_android_version "$target"
    update_ios_versions

    # Commit version changes
    git add package.json package-lock.json android/app/build.gradle ios/*/Info.plist
    git commit -m "Update version to $target (sync recovery)"

    # Update submodule reference
    git add Mobile-Expensify
    git commit -m "Update Mobile-Expensify submodule version to $target (sync recovery)"

    # Push changes
    if ! git push origin main; then
        echo "::warning::Push failed, attempting rebase..."
        git fetch origin main
        git rebase origin/main
        git push origin main
    fi

    echo "::notice::✅ Successfully synced E/App to version $target"
}

function sync_submodule_only {
    local current_sha
    current_sha=$(git -C Mobile-Expensify rev-parse HEAD)
    if [[ "$current_sha" != "$EXPECTED_SUBMODULE_SHA" ]]; then
        echo "::error::Mobile-Expensify checkout ($current_sha) does not match expected main ($EXPECTED_SUBMODULE_SHA)"
        exit 1
    fi

    echo "::notice::Recording Mobile-Expensify submodule at $current_sha (versions already matched $(get_app_version))"
    git add Mobile-Expensify
    git commit -m "Bump Mobile-Expensify submodule to latest main ($current_sha)"

    if ! git push origin main; then
        echo "::warning::Push failed, attempting rebase..."
        git fetch origin main
        git rebase origin/main
        git submodule update --remote
        git add Mobile-Expensify
        if ! git diff --staged --quiet; then
            git commit -m "Bump Mobile-Expensify submodule to latest main after rebase ($(git -C Mobile-Expensify rev-parse HEAD))"
        fi
        git push origin main
    fi

    echo "::notice::✅ Submodule pointer updated on App main"
}

function verify_sync {
    local app_version
    local me_version
    app_version="$(get_app_version)"
    me_version="$(get_mobile_expensify_version)"

    if [[ "$app_version" != "$me_version" ]]; then
        echo "::error::Sync failed! Versions still don't match"
        echo "::error::E/App: $app_version, Mobile-Expensify: $me_version"
        exit 1
    fi

    git -C Mobile-Expensify fetch origin

    local recorded
    local remote_sha
    recorded=$(git rev-parse HEAD:Mobile-Expensify)
    remote_sha=$(git -C Mobile-Expensify rev-parse origin/main)
    if [[ "$recorded" != "$remote_sha" ]]; then
        echo "::error::Submodule on App main ($recorded) still differs from Mobile-Expensify origin/main ($remote_sha)"
        exit 1
    fi

    set_output POST_SYNC_APP_VERSION "$app_version"
    echo "::notice::✅ Verified versions ($app_version) and submodule match Mobile-Expensify main ($recorded)"
}

function cmd_sync {
    if [[ "$NEED_FULL_VERSION_SYNC" == 'true' ]]; then
        sync_full_version
    else
        sync_submodule_only
    fi

    verify_sync
}

function cmd_version_components {
    if [[ -z "${1:-}" ]]; then
        echo "::error::version-components requires a version argument"
        exit 1
    fi

    compute_version_components "$1"
    echo "SHORT_VERSION=$SHORT_VERSION"
    echo "BUILD_NUMBER=$BUILD_NUMBER"
    echo "CF_VERSION=$CF_VERSION"
    echo "ANDROID_VERSION_CODE=$ANDROID_VERSION_CODE"
}

function usage {
    echo "::error::Usage: $0 <check|sync|version-components>"
    exit 1
}

case "${1:-}" in
    check) cmd_check ;;
    sync) cmd_sync ;;
    version-components) cmd_version_components "${2:-}" ;;
    *) usage ;;
esac
