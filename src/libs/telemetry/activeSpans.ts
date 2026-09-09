import CONST from '@src/CONST';

import type {Span, SpanAttributeValue, StartSpanOptions} from '@sentry/core';

import {SPAN_STATUS_OK, spanTimeInputToSeconds} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import {AppState} from 'react-native';

import logBenchmarkSpanEnd, {isBenchmarkSpanEnabled} from './logBenchmarkSpanEnd';

type ActiveSpanEntry = {
    span: ReturnType<typeof Sentry.startInactiveSpan>;
    spanName: string;
    startTimeForLog: number;
};

const activeSpans = new Map<string, ActiveSpanEntry>();

/** Converts an optional Sentry epoch start time into the `performance.now()` clock used for monotonic duration logging. */
function getPerformanceStartTimeForLog(startTime: StartSpanOptions['startTime']): number {
    const performanceTimestamp = performance.now();
    if (startTime === undefined) {
        return performanceTimestamp;
    }

    // Sentry start times are Unix timestamps, while performance.now() is relative to the process start. Translate the timestamp once so elapsed time stays monotonic.
    const epochStartTime = spanTimeInputToSeconds(startTime) * 1000;
    return performanceTimestamp - (Date.now() - epochStartTime);
}

function startSpan(spanId: string, options: StartSpanOptions) {
    if ((AppState.currentState ?? CONST.APP_STATE.ACTIVE) !== CONST.APP_STATE.ACTIVE && !isBenchmarkSpanEnabled(options.name)) {
        return;
    }
    // End any existing span for this name
    cancelSpan(spanId);
    console.debug(`[Sentry][${spanId}] Starting span`, {
        spanId,
        spanOptions: options,
        timestamp: Date.now(),
    });
    const span = Sentry.startInactiveSpan(options);

    const startTimeForLog = getPerformanceStartTimeForLog(options.startTime);

    activeSpans.set(spanId, {span, spanName: options.name, startTimeForLog});

    return span;
}

function endSpan(spanId: string) {
    const entry = activeSpans.get(spanId);

    if (!entry) {
        return;
    }
    const {span, spanName, startTimeForLog} = entry;
    const performanceTimestamp = performance.now();
    const durationMs = Math.round(performanceTimestamp - startTimeForLog);
    const attributes = Sentry.spanToJSON(span).data ?? {};
    console.debug(`[Sentry][${spanId}] Ending span (${durationMs}ms)`, {spanId, durationMs, timestamp: Date.now(), attributes});
    if (attributes[CONST.TELEMETRY.ATTRIBUTE_CANCELED] !== true) {
        logBenchmarkSpanEnd(spanName, durationMs);
    }
    span.setStatus({code: SPAN_STATUS_OK});

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
    entry.span.setStatus({code: SPAN_STATUS_OK});
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

/**
 * Cancel a tracked span by its Sentry span instance rather than its id (e.g. from a lifecycle listener that
 * only has the raw span). Optionally stamps attributes first. No-op if the span isn't tracked.
 */
function cancelSpanByInstance(target: Span, attributes?: Record<string, SpanAttributeValue>) {
    for (const [spanID, entry] of activeSpans.entries()) {
        if (entry.span === target) {
            if (attributes) {
                entry.span.setAttributes(attributes);
            }
            cancelSpan(spanID);
            return;
        }
    }
}

function getSpan(spanId: string) {
    return activeSpans.get(spanId)?.span;
}

/** Look up a span whose id is suffixed (e.g. per-attempt spans stored as `${name}_${attempt}`). */
function getSpanByPrefix(prefix: string) {
    for (const [spanID, entry] of activeSpans.entries()) {
        if (spanID.startsWith(prefix)) {
            return entry.span;
        }
    }
}

function endSpanWithAttributes(spanId: string, attributes: Record<string, SpanAttributeValue | undefined>) {
    const span = getSpan(spanId);
    span?.setAttributes(attributes);
    endSpan(spanId);
}

export {startSpan, endSpan, endSpanWithAttributes, getSpan, getSpanByPrefix, cancelSpan, cancelSpanByInstance, cancelAllSpans, cancelSpansByPrefix};
