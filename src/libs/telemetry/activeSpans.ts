import type {SpanAttributeValue, StartSpanOptions} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import {AppState} from 'react-native';
import CONST from '@src/CONST';

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
    activeSpans.set(spanId, {span, startTime: performance.now()});

    return span;
}

function endSpan(spanId: string) {
    const entry = activeSpans.get(spanId);

    if (!entry) {
        console.debug(`[Sentry][${spanId}] Trying to end span but it does not exist`, {spanId, timestamp: Date.now()});
        return;
    }
    const {span, startTime} = entry;
    const now = performance.now();
    const durationMs = Math.round(now - startTime);
    console.debug(`[Sentry][${spanId}] Ending span (${durationMs}ms)`, {spanId, durationMs, timestamp: now});
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
    console.debug(`[Sentry][${spanId}] Canceling span`, {spanId, timestamp: Date.now()});
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
