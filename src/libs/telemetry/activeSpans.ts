import CONST from '@src/CONST';

import type {Span, SpanAttributeValue, StartSpanOptions} from '@sentry/core';

import {SPAN_STATUS_OK} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import {AppState} from 'react-native';

type ActiveSpanEntry = {
    span: ReturnType<typeof Sentry.startInactiveSpan>;
    startTimeForLog: number;
};

const activeSpans = new Map<string, ActiveSpanEntry>();

type StartSpanExtraOptions = Partial<{
    /**
     * Minimum duration of the span in milliseconds. If the span is shorter than this duration, it will be discarded (filtered out) before sending to Sentry.
     *
     */
    minDuration: number;
}>;

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

    let startTimeForLog: number;
    if (typeof options.startTime === 'number') {
        startTimeForLog = options.startTime;
    } else {
        startTimeForLog = performance.now();
    }

    activeSpans.set(spanId, {span, startTimeForLog});

    return span;
}

function endSpan(spanId: string) {
    const entry = activeSpans.get(spanId);

    if (!entry) {
        return;
    }
    const {span, startTimeForLog} = entry;
    const now = performance.now();
    const durationMs = Math.round(now - startTimeForLog);
    console.debug(`[Sentry][${spanId}] Ending span (${durationMs}ms)`, {spanId, durationMs, timestamp: now, attributes: Sentry.spanToJSON(span).data});
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

function endSpanWithAttributes(spanId: string, attributes: Record<string, SpanAttributeValue | undefined>) {
    const span = getSpan(spanId);
    span?.setAttributes(attributes);
    endSpan(spanId);
}

export {startSpan, endSpan, endSpanWithAttributes, getSpan, cancelSpan, cancelSpanByInstance, cancelAllSpans, cancelSpansByPrefix};
