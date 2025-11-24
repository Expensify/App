import {SPAN_STATUS_ERROR } from '@sentry/core';
import type {StartSpanOptions} from '@sentry/core';
import * as Sentry from '@sentry/react-native';

const activeSpans = new Map<string, ReturnType<typeof Sentry.startInactiveSpan>>();

function startSpan(spanId: string, options: StartSpanOptions) {
    // End any existing span for this name
    endSpan(spanId);

    const span = Sentry.startInactiveSpan(options);

    if (span) {
        activeSpans.set(spanId, span);
    }

    return span;
}

function endSpan(spanId: string, endDueToError = false) {
    const span = activeSpans.get(spanId);

    if (!span) {
        return;
    }

    if (endDueToError) {
        span.setStatus({message: 'error', code: SPAN_STATUS_ERROR});
    }

    span.end();
    activeSpans.delete(spanId);
}

export {startSpan, endSpan};
