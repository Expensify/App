#!/bin/bash

# Auto-restart webpack-dev-server on memory crashes
# This script monitors for heap out of memory errors and automatically restarts
# Usage: ./start-dev-with-auto-restart.sh [webpack-dev-server arguments]

WEBPACK_DEV_SERVER_ARGS=("$@")
readonly RESTART_DELAY=1
MAX_RESTARTS=10
RESTART_COUNT=0

echo "🚀 Starting webpack-dev-server with auto-restart (max restarts: $MAX_RESTARTS)"

run_wds () {
    npx tsx --expose-gc ./node_modules/.bin/webpack-cli serve "$1" "${WEBPACK_DEV_SERVER_ARGS[@]}" --config config/webpack/webpack.dev.ts
}

while [[ $RESTART_COUNT -lt $MAX_RESTARTS ]]; do
    echo "📊 Attempt #$((RESTART_COUNT + 1)) - Starting webpack-dev-server..."
    
    if [ $RESTART_COUNT -eq 0 ]; then
        run_wds --open
    else
        run_wds --no-open
    fi
    
    # Capture exit code
    EXIT_CODE=$?
    # Check if it was a memory-related crash
    if [ $EXIT_CODE -eq 134 ] || [ $EXIT_CODE -eq 137 ] || [ $EXIT_CODE -eq 139 ]; then
        echo "💥 Memory crash detected (exit code: $EXIT_CODE)"
        RESTART_COUNT=$((RESTART_COUNT + 1))
        
        if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
            echo "🔄 Auto-restarting... (restart #$RESTART_COUNT)"
            sleep $RESTART_DELAY
        else
            echo "❌ Max restarts reached ($MAX_RESTARTS). Exiting."
            exit 1
        fi
    elif [ $EXIT_CODE -eq 0 ]; then
        echo "✅ Webpack-dev-server exited cleanly"
        exit 0
    else
        echo "❌ Webpack-dev-server exited with error code: $EXIT_CODE"
        exit $EXIT_CODE
    fi
done

echo "❌ Maximum restart attempts reached. Please check for underlying issues."
exit 1
