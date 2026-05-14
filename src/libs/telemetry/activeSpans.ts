import type {SpanAttributeValue, StartSpanOptions} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import {AppState} from 'react-native';
import CONST from '@src/CONST';
import {markStartAppStartupNetworkRequestSpan} from './appStartupNetworkRequestSpan';

type ActiveSpanEntry = {
    span: ReturnType<typeof Sentry.startInactiveSpan>;
    startTime: number;
};

const activeSpans = new Map<string, ActiveSpanEntry>();

type StartSpanExtraOptions = Partial<{
    /**
     * Minimum duration of the span in milliseconds. If the span is shorter than this duration, it will be discarded (filtered out) before sending to Sentry.
     *
     */
    minDuration: number;
    /** Unix epoch ms from Nitro `AppStartTime` — aligns startup benchmark + User Timing with native process start */
    nativeAppStartTimeEpochMs?: number;
}>;

function calculateNativeAppStartupTimestamp(nativeAppStartTimeEpochMs: number | undefined, jsStartupTimestampMs: number): number {
    if (nativeAppStartTimeEpochMs !== undefined && nativeAppStartTimeEpochMs > 0) {
        const timeOrigin = globalThis.performance?.timeOrigin;
        if (timeOrigin !== undefined && timeOrigin > 0) {
            const fromNativeWallClock = nativeAppStartTimeEpochMs - timeOrigin;
            if (fromNativeWallClock >= 0) {
                return fromNativeWallClock;
            }
        }
    }
    return jsStartupTimestampMs;
}

function startSpan(spanId: string, options: StartSpanOptions, extraOptions: StartSpanExtraOptions = {}) {
    if ((AppState.currentState ?? CONST.APP_STATE.ACTIVE) !== CONST.APP_STATE.ACTIVE) {
        return;
    }
    // End any existing span for this name
    cancelSpan(spanId);
    console.debug(`[Sentry][${spanId}] Starting span`, {
        spanId,
        spanOptions: options,
        spanExtraOptions: extraOptions,
        timestamp: Date.now(),
    });
    const span = Sentry.startInactiveSpan(options);

    if (extraOptions.minDuration) {
        span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_MIN_DURATION, extraOptions.minDuration);
    }

    const startTime = performance.now();
    activeSpans.set(spanId, {span, startTime});

    if (spanId === CONST.TELEMETRY.SPAN_APP_STARTUP) {
        const nativeAppStartupTimestampMs = calculateNativeAppStartupTimestamp(extraOptions.nativeAppStartTimeEpochMs, startTime);
        markStartAppStartupNetworkRequestSpan(nativeAppStartupTimestampMs);
    }

    return span;
}

function endSpan(spanId: string) {
    const entry = activeSpans.get(spanId);

    if (!entry) {
        return;
    }
    const {span, startTime} = entry;
    const now = performance.now();
    const durationMs = Math.round(now - startTime);
    console.debug(`[Sentry][${spanId}] Ending span (${durationMs}ms)`, {spanId, durationMs, timestamp: now, attributes: Sentry.spanToJSON(span).data});
    span.setStatus({code: 1});
    span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_FINISHED_MANUALLY, true);
    span.end();
    activeSpans.delete(spanId);
}

function cancelSpan(spanId: string) {
    const entry = activeSpans.get(spanId);
    if (!entry) {
        return;
    }
    entry.span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_CANCELED, true);
    // In Sentry there are only OK or ERROR status codes.
    // We treat canceled spans as OK, so we can properly track spans that are not finished at all (their status would be different)
    entry.span.setStatus({code: 1});
    endSpan(spanId);
}

function cancelAllSpans() {
    for (const [spanId] of activeSpans.entries()) {
        cancelSpan(spanId);
    }
}

function cancelSpansByPrefix(prefix: string) {
    for (const [spanID] of activeSpans.entries()) {
        if (spanID.startsWith(prefix)) {
            cancelSpan(spanID);
        }
    }
}

function getSpan(spanId: string) {
    return activeSpans.get(spanId)?.span;
}

function endSpanWithAttributes(spanId: string, attributes: Record<string, SpanAttributeValue>) {
    const span = getSpan(spanId);
    span?.setAttributes(attributes);
    endSpan(spanId);
}

export {startSpan, endSpan, endSpanWithAttributes, getSpan, cancelSpan, cancelAllSpans, cancelSpansByPrefix};
