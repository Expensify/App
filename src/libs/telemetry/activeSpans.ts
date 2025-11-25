import type {StartSpanOptions} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

const activeSpans = new Map<string, ReturnType<typeof Sentry.startInactiveSpan>>();

function startSpan(spanId: string, options: StartSpanOptions) {
    // End any existing span for this name
    cancelSpan(spanId);

    const span = Sentry.startInactiveSpan(options);

    if (span) {
        activeSpans.set(spanId, span);
    }

    return span;
}

function endSpan(spanId: string) {
    const span = activeSpans.get(spanId);

    if (!span) {
        return;
    }
    span.setStatus({code: 1});
    span.end();
    activeSpans.delete(spanId);
}

function cancelSpan(spanId: string) {
    const span = activeSpans.get(spanId);
    span?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_CANCELED, true);
    // In Sentry there are only OK or ERROR status codes.
    // We treat canceled spans as OK so we have ability to properly track spans that are not finished at all (their status would be different)
    span?.setStatus({code: 1});
    endSpan(spanId);
}

function getSpan(spanId: string) {
    return activeSpans.get(spanId);
}

export {startSpan, endSpan, getSpan, cancelSpan};
