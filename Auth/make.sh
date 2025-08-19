#!/bin/bash
set -e

export CC="clang-18"
export CXX="clang++-18"

# Read options from the commandline.
PRODUCTION=""
CLEAN=""
TEST=""
NO_KEYSPLITTER=""

# Use the number of dev build threads the user set in their bash profile, otherwise default to 8.
JOBS="${DEV_BUILD_THREADS:-8}"

KEEP_GOING=""
for i in "$@"
do
case $i in
    -t|--test)
    TEST="true"
    shift # past argument=value
    ;;
    --no-bedrock)
    NO_BEDROCK="true"
    shift # past argument=value
    ;;
    --no-keysplitter)
    NO_KEYSPLITTER="true"
    shift # past argument=value
    ;;
    -c|--clean)
    CLEAN="true"
    shift # past argument=value
    ;;
    -j=*|--jobs=*)
    JOBS=("${i#*=}")
    shift # past argument=value
    ;;
    -k|--keep-going)
    KEEP_GOING="--keep-going"
    ;;
    *)
            # unknown option
    ;;
esac
done

if [[ -e `which ccache` ]]; then
    # We set this export manually since not everyone has this path prepended locally in their dev env.
    export PATH=/usr/lib/ccache:$PATH
    /usr/sbin/update-ccache-symlinks

    # If TRAVIS_BRANCH is set, we're compiling on GH Actions, which means we'll want to change CC and CXX to have ccache prepended to it.
    if [[ -n "${TRAVIS_BRANCH}" ]]; then
        export CC="ccache ${CC}"
        export CXX="ccache ${CXX}"
    fi

    export CCACHE_COMPILERCHECK="mtime"

    # We have include_file_ctime and include_file_mtime since travis never modifies the header file during execution
    # and travis shouldn't care about ctime and mtime between new branches.
    export CCACHE_SLOPPINESS="pch_defines,time_macros,include_file_ctime,include_file_mtime"

    # If CCACHE_MAXSIZE is not set use, 5GB as default
    if [[ -z "${CCACHE_MAXSIZE}" ]]; then
        # Set the max cache size to 5GB
        export CCACHE_MAXSIZE="5G"
    fi

    # ccache recommends a compression level of 5 or less for faster compilations.
    # Compression speeds up the tar and untar of the cache between gh action runs.
    export CCACHE_COMPRESS="true"
    if [[ -z "${CCACHE_COMPRESSLEVEL}" ]]; then
        export CCACHE_COMPRESSLEVEL="1"
    fi


    # Use the root build directory that encapsulates Bedrock, Auth, Fuzzybot, ExpensifyBackupManager
    # For local use /vagrant, otherwise this should be set for travis in the env variables.
    if [[ -z "${CCACHE_BASEDIR}" ]]; then
        export CCACHE_BASEDIR="/vagrant"
    fi

    # print out the cache config
    ccache -p

    # Reset cache statistics.
    ccache -z
fi

# Function to run make with automatic stale dependency cleanup on failure
function run_make_with_cleanup() {
    local TARGET="$1"
    local JOBS="$2"
    local KEEP_GOING="$3"

    # Try the build and capture output
    # Using '|| true' prevents set -e from exiting, then we check PIPESTATUS
    make "$TARGET" -j "$JOBS" $KEEP_GOING 2>&1 | tee /tmp/make_output.log || true
    local MAKE_EXIT_CODE=${PIPESTATUS[0]}

    if [[ $MAKE_EXIT_CODE -eq 0 ]]; then
        # Build succeeded, clean up and return
        rm -f /tmp/make_output.log
    else
        # Build failed - check if it's a stale dependency error
        if grep -q "make: \*\*\* No rule to make target.*needed by" /tmp/make_output.log; then
            echo "Stale dependency error detected. Cleaning and retrying..."
            ./clean_stale_deps.sh
            make "$TARGET" -j "$JOBS" $KEEP_GOING
        else
            # Not a stale dependency error, propagate the failure
            rm -f /tmp/make_output.log
            return $MAKE_EXIT_CODE
        fi
        rm -f /tmp/make_output.log
    fi
}

if [ -n "$CLEAN" ]; then
    if [[ -z "$NO_BEDROCK" ]] ; then
        cd ../Bedrock
        make clean
        cd -
    fi
    make clean
else
    if [[ -z "$NO_BEDROCK" ]] ; then
        cd ../Bedrock
        run_make_with_cleanup "bedrock" "$JOBS" ""
        cd -
    fi

    run_make_with_cleanup "auth" "$JOBS" "$KEEP_GOING"

    # If test is set, make the tests.
    if [ -n "$TEST" ]; then
        run_make_with_cleanup "test" "$JOBS" "$KEEP_GOING"
        
        # Only build keysplittertest if --no-keysplitter flag is not set
        if [[ -z "$NO_KEYSPLITTER" ]]; then
            run_make_with_cleanup "keysplittertest" "$JOBS" ""
        fi
    fi

fi

# Print cache statistics.
if [[ -e `which ccache` ]]; then
    ccache -s
fi