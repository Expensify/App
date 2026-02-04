import type {StartSpanOptions} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

const activeSpans = new Map<string, ReturnType<typeof Sentry.startInactiveSpan>>();

type StartSpanExtraOptions = Partial<{
    /**
     * Minimum duration of the span in milliseconds. If the span is shorter than this duration, it will be discarded (filtered out) before sending to Sentry.
     *
     */
    minDuration: number;
}>;

function startSpan(spanId: string, options: StartSpanOptions, extraOptions: StartSpanExtraOptions = {}) {
    // End any existing span for this name
    cancelSpan(spanId);
    const span = Sentry.startInactiveSpan(options);

    if (extraOptions.minDuration) {
        span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_MIN_DURATION, extraOptions.minDuration);
    }
    activeSpans.set(spanId, span);

    return span;
}

function endSpan(spanId: string) {
    const span = activeSpans.get(spanId);

    if (!span) {
        return;
    }
    span.setStatus({code: 1});
    span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_FINISHED_MANUALLY, true);
    span.end();
    activeSpans.delete(spanId);
}

function cancelSpan(spanId: string) {
    const span = activeSpans.get(spanId);
    span?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_CANCELED, true);
    // In Sentry there are only OK or ERROR status codes.
    // We treat canceled spans as OK, so we can properly track spans that are not finished at all (their status would be different)
    span?.setStatus({code: 1});
    endSpan(spanId);
}

function cancelAllSpans() {
    for (const [spanId] of activeSpans.entries()) {
        cancelSpan(spanId);
    }
}

function getSpan(spanId: string) {
    return activeSpans.get(spanId);
}

export {startSpan, endSpan, getSpan, cancelSpan, cancelAllSpans};
