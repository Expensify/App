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
    span.setStatus({code: 1})
    span.end();
    activeSpans.delete(spanId);
}

function cancelSpan(spanId: string) {
    const span = activeSpans.get(spanId);
    span?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_CANCELED, true);
    endSpan(spanId);
}

export {startSpan, endSpan};
