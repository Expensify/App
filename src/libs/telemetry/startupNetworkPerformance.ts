import CONST from '@src/CONST';

function getPerformanceAPI(): Performance | undefined {
    return globalThis.performance;
}

/**
 * Start mark for ManualAppStartup → OpenApp/ReconnectApp `performance.measure`.
 * `startTime` is high-res (same clock as `performance.now()`): `nativeAppEpochMs - performance.timeOrigin` when Nitro time is used in activeSpans, else `performance.now()` at span start.
 */
function markManualAppStartupLastNetworkStart(startTime: number) {
    const perf = getPerformanceAPI();
    if (!perf?.mark) {
        return;
    }
    try {
        perf.clearMarks(CONST.TELEMETRY.PERFORMANCE_MARK_MANUAL_APP_STARTUP_LAST_NETWORK_START);
        perf.clearMarks(CONST.TELEMETRY.PERFORMANCE_MARK_MANUAL_APP_STARTUP_LAST_NETWORK_END);

        perf.mark(CONST.TELEMETRY.PERFORMANCE_MARK_MANUAL_APP_STARTUP_LAST_NETWORK_START, {startTime});
    } catch {
        // Startup-only dev / profiling path — never break requests
    }
}

/**
 * Closes the range when OpenApp/ReconnectApp `fetch` completes and records `performance.measure`.
 */
function measureManualAppStartupLastNetworkComplete() {
    const perf = getPerformanceAPI();
    if (!perf?.mark || !perf.measure) {
        return;
    }
    try {
        perf.mark(CONST.TELEMETRY.PERFORMANCE_MARK_MANUAL_APP_STARTUP_LAST_NETWORK_END);
        perf.clearMeasures(CONST.TELEMETRY.PERFORMANCE_MEASURE_MANUAL_APP_STARTUP_LAST_NETWORK);
        perf.measure(
            CONST.TELEMETRY.PERFORMANCE_MEASURE_MANUAL_APP_STARTUP_LAST_NETWORK,
            CONST.TELEMETRY.PERFORMANCE_MARK_MANUAL_APP_STARTUP_LAST_NETWORK_START,
            CONST.TELEMETRY.PERFORMANCE_MARK_MANUAL_APP_STARTUP_LAST_NETWORK_END,
        );
    } catch {
        // Missing start mark (e.g. span never started) — ignore
    }
}

export {markManualAppStartupLastNetworkStart, measureManualAppStartupLastNetworkComplete};
