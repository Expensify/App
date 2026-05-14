import * as Sentry from '@sentry/react-native';
import type {OnyxKey} from 'react-native-onyx';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import {markManualAppStartupLastNetworkStart, measureManualAppStartupLastNetworkComplete} from './startupNetworkPerformance';

type AppStartupInactiveSpan = ReturnType<typeof Sentry.startInactiveSpan>;

/**
 * Commands whose initial fetch participates in prefetch + startup-critical HTTP benchmarking.
 * Matches URL segment after `/api/` for OpenApp and ReconnectApp.
 */
const STARTUP_HANDSHAKE_PREFETCH_COMMANDS = new Set<string>([WRITE_COMMANDS.OPEN_APP, SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP]);

/** URL path segment after `/api/` — aligns with skew + startup benchmark logic previously in HttpUtils. */
const API_COMMAND_SEGMENT_REGEX = /\/api\/([^&?]+)\??.*/;

let hasEmittedStartupLastNetworkComplete = false;

let startupLastNetworkWallClockStartMsHighRes: number | undefined;

let manualAppStartupLastNetworkSpan: AppStartupInactiveSpan | undefined;

function isStartupPrefetchCommand(commandName: string): boolean {
    return STARTUP_HANDSHAKE_PREFETCH_COMMANDS.has(commandName);
}

function endManualAppStartupLastNetworkSpanWithCanceledOutcome(): void {
    if (!manualAppStartupLastNetworkSpan) {
        return;
    }
    manualAppStartupLastNetworkSpan.setAttribute(CONST.TELEMETRY.ATTRIBUTE_CANCELED, true);
    manualAppStartupLastNetworkSpan.setStatus({code: 1});
    manualAppStartupLastNetworkSpan.end();
    manualAppStartupLastNetworkSpan = undefined;
}

/** Superseded benchmark span when a new ManualAppStartup tracing window starts before the previous HTTP landed. */
function discardManualAppStartupLastNetworkSpanAsStale(): void {
    endManualAppStartupLastNetworkSpanWithCanceledOutcome();
}

/** Adds prefetchKey headers for NitroFetch startup warming when the command qualifies. */
function withPrefetchHeadersWhenStartupHandshake<TKey extends OnyxKey>(request: Request<TKey>): Request<TKey> {
    if (!isStartupPrefetchCommand(request.command)) {
        return request;
    }
    return {
        ...request,
        headers: {...(request.headers ?? {}), prefetchKey: request.command},
    };
}

/** Log prefetch scheduling — dev-only benchmarking path. */
function logPrefetchSchedulingForBench(context: Readonly<{url: string; method: string; body: unknown; headers: Record<string, string>}>) {
    if (!context.headers.prefetchKey) {
        return;
    }
    // eslint-disable-next-line no-console -- NitroFetch / startup benchmarking noise (Log omits release logcat)
    console.warn('[NitroFetchBenchmarks][HttpUtils] Prefetching request', context);
}

function logFetchDurationForBench(url: string, durationMs: number): void {
    // eslint-disable-next-line no-console -- NitroFetch / startup benchmarking noise
    console.warn(`[NitroFetchBenchmarks] fetch took ${durationMs}ms (${url})`);
}

/**
 * ManualAppStartup begins (same wall-clock anchor as that span): User Timing marks + a separate Sentry span for
 * “startup → first OpenApp/Reconnect HTTP settled”. Not parented under ManualAppStartup so it can outlive that span
 * without invalid nesting; it still ends only when the request finishes (or is superseded by a newer startup benchmark).
 */
function notifyManualAppStartupTracingStarted(benchmarkWallClockStartMsHighRes: number): void {
    startupLastNetworkWallClockStartMsHighRes = benchmarkWallClockStartMsHighRes;
    hasEmittedStartupLastNetworkComplete = false;

    discardManualAppStartupLastNetworkSpanAsStale();
    markManualAppStartupLastNetworkStart(benchmarkWallClockStartMsHighRes);

    manualAppStartupLastNetworkSpan = Sentry.startInactiveSpan({
        name: CONST.TELEMETRY.SPAN_APP_STARTUP_LAST_NETWORK,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP_LAST_NETWORK,
    });
}

function logManualAppStartupParentEndedForBench(durationMs: number, spanAttributes: Pick<ReturnType<typeof Sentry.spanToJSON>, 'data'>['data']): void {
    // eslint-disable-next-line no-console -- NitroFetch / startup benchmarking noise
    console.warn('[NitroFetchBenchmarks][ManualAppStartup] Ending span', {
        durationMs,
        timestamp: performance.now(),
        attributes: spanAttributes ?? {},
    });
}

/** OpenApp/Reconnect HTTP chain settled once; User Timing measure + benchmark logs + finalize standalone Sentry span. */
function notifyStartupCriticalHttpCompletedIfApplicable(context: Readonly<{url: string; apiCommandSegment: string | undefined}>): void {
    const commandSegment = context.apiCommandSegment;
    const isStartupHandshakeHttp = !!commandSegment && STARTUP_HANDSHAKE_PREFETCH_COMMANDS.has(commandSegment);
    if (!isStartupHandshakeHttp) {
        return;
    }
    if (hasEmittedStartupLastNetworkComplete) {
        return;
    }
    const benchmarkWallStartMsHighRes = startupLastNetworkWallClockStartMsHighRes;
    if (benchmarkWallStartMsHighRes === undefined) {
        return;
    }

    hasEmittedStartupLastNetworkComplete = true;
    const now = performance.now();
    const durationSinceStartupWallClockMs = Math.round(now - benchmarkWallStartMsHighRes);
    // eslint-disable-next-line no-console -- NitroFetch / startup benchmarking noise
    console.warn('[NitroFetchBenchmarks][ManualAppStartup] OpenApp/ReconnectApp request completed', {
        durationMs: durationSinceStartupWallClockMs,
        timestamp: now,
        url: context.url,
    });

    measureManualAppStartupLastNetworkComplete();

    const benchSpanStillOpen = manualAppStartupLastNetworkSpan;
    if (!benchSpanStillOpen) {
        return;
    }

    manualAppStartupLastNetworkSpan = undefined;

    benchSpanStillOpen.setStatus({code: 1});
    benchSpanStillOpen.setAttributes({
        [CONST.TELEMETRY.ATTRIBUTE_MANUAL_APP_STARTUP_LAST_NETWORK_WALL_MS]: durationSinceStartupWallClockMs,
        [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: commandSegment,
    });
    benchSpanStillOpen.end();
}

function extractApiCommandSegmentFromApiUrl(apiUrl: string): string | undefined {
    const commandSegmentMatch = apiUrl.match(API_COMMAND_SEGMENT_REGEX)?.[1];
    return commandSegmentMatch;
}

export {
    extractApiCommandSegmentFromApiUrl,
    logFetchDurationForBench,
    logManualAppStartupParentEndedForBench,
    logPrefetchSchedulingForBench,
    notifyManualAppStartupTracingStarted,
    notifyStartupCriticalHttpCompletedIfApplicable,
    withPrefetchHeadersWhenStartupHandshake,
};
