import Log from '@libs/Log';
import {startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import type {Span} from '@sentry/core';

import {AppStartTimeNitroModule} from '@expensify/nitro-utils';
import * as Sentry from '@sentry/react-native';

import reportModuleInitTimes from './reportModuleInitTimes';
import setupSentry from './setupSentry';

// On a prewarmed process the app can be created long before the user actually opens it, leaving a stale start time that
// would inflate the startup span to minutes/hours. Discard any start time older than this threshold as a prewarm/stale value.
const MAX_PREWARMING_APP_START_AGE_MS = 60 * 1000;

/** Markers that describe a condition of the startup rather than a stage boundary; reported as attributes, not child spans. */
const STARTUP_FLAG_MARKERS: Record<string, string> = {
    OldDotDeeplinkDeferred: 'old_dot_deeplink_deferred',
    OldDotReauthBlocked: 'old_dot_reauth_blocked',
};

/**
 * Most markers are recorded when their work finishes, so the interval ending at a marker is named
 * after it. These markers fire at the start of an event instead — name their interval after the
 * work that actually precedes them.
 */
const STARTUP_STAGE_SPAN_NAMES: Record<string, string> = {
    OldDotDisplay: 'OldDotJSBoot',
    OldDotNavigateToNewDot: 'OldDotDisplayToNavigate',
    RNSetupStart: 'OldDotToRNHandoff',
};

/**
 * Turns the named startup timestamps recorded by the native layer (see recordStartupMarker in
 * Mobile-Expensify) into backdated child spans of ManualAppStartup, so the pre-JS native head
 * of the startup is visible in Sentry instead of being one opaque block.
 */
function reportStartupMarkers(startupSpan: Span, nativeAppStartTimeMs: number) {
    try {
        // The getter only exists on binaries built with this native module version. A newer JS bundle
        // on an older HybridApp binary (Metro dev, release skew) sees undefined at runtime — no markers.
        const rawMarkers = (AppStartTimeNitroModule.appStartupMarkers as Record<string, number> | undefined) ?? {};
        const markers = Object.entries(rawMarkers)
            .filter(([, timestampMs]) => timestampMs >= nativeAppStartTimeMs)
            .sort(([, a], [, b]) => a - b);

        let previousTimestampMs = nativeAppStartTimeMs;
        let stageSpanCount = 0;
        for (const [name, timestampMs] of markers) {
            const flagAttribute = STARTUP_FLAG_MARKERS[name];
            if (flagAttribute) {
                startupSpan.setAttribute(flagAttribute, true);
                continue;
            }
            const spanName = STARTUP_STAGE_SPAN_NAMES[name] ?? name;
            const stageSpan = Sentry.startInactiveSpan({
                name: spanName,
                op: spanName,
                parentSpan: startupSpan,
                startTime: previousTimestampMs,
            });
            stageSpan.end(timestampMs);
            previousTimestampMs = timestampMs;
            stageSpanCount++;
        }

        // The remaining gap is Hermes bundle eval + JS init, ending where this telemetry setup runs.
        // Gate on stage spans, not raw markers — flag-only markers leave previousTimestampMs at app
        // start, which would mislabel the whole native head as JS init.
        if (stageSpanCount > 0) {
            const jsInitSpan = Sentry.startInactiveSpan({
                name: CONST.TELEMETRY.SPAN_STARTUP_NEW_DOT_JS_INIT,
                op: CONST.TELEMETRY.SPAN_STARTUP_NEW_DOT_JS_INIT,
                parentSpan: startupSpan,
                startTime: previousTimestampMs,
            });
            jsInitSpan.end(Date.now());
        }
    } catch (error) {
        Log.warn('[Telemetry] Failed to report native startup markers', {error});
    }
}

export default function (): void {
    setupSentry();

    let nativeAppStartTimeMs: number | undefined;
    try {
        const appStartTime = (AppStartTimeNitroModule as {readonly appStartTime: number}).appStartTime;
        const appStartAgeMs = Date.now() - appStartTime;
        if (appStartTime > 0 && appStartAgeMs >= 0 && appStartAgeMs < MAX_PREWARMING_APP_START_AGE_MS) {
            nativeAppStartTimeMs = appStartTime;
        } else {
            if (appStartTime > 0) {
                Log.warn('[Telemetry] Discarding native app start time (stale/prewarm)', {appStartTime, appStartAgeMs});
            }
            nativeAppStartTimeMs = undefined;
        }
    } catch (error) {
        Log.warn('[Telemetry] Failed to read native app start time from NitroModule', {error});
        nativeAppStartTimeMs = undefined;
    }

    const startupSpan = startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP,
        startTime: nativeAppStartTimeMs,
    });

    if (startupSpan && nativeAppStartTimeMs) {
        reportStartupMarkers(startupSpan, nativeAppStartTimeMs);
    }

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP_NETWORK_REQUEST, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP_NETWORK_REQUEST,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP_NETWORK_REQUEST,
        startTime: nativeAppStartTimeMs,
    });

    requestAnimationFrame(() => {
        // Use typeof guard — bare identifier throws ReferenceError if moduleInitPolyfill didn't run
        const initTimes = typeof __moduleInitTimes !== 'undefined' ? (__moduleInitTimes as Record<string, number>) : undefined;
        const moduleNames = typeof __moduleNames !== 'undefined' ? (__moduleNames as Record<string, string>) : undefined;
        reportModuleInitTimes(initTimes, moduleNames, 100);
    });
}
