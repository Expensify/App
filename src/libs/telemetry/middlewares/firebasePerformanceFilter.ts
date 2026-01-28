import type {TransactionEvent} from '@sentry/core';
import type {TelemetryBeforeSend} from './index';

/**
 * Drop Firebase Performance user timing spans (FB-PERF-TRACE-*)
 * to avoid noisy mark/measure spans in Sentry.
 */
const firebasePerformanceFilter: TelemetryBeforeSend = (event: TransactionEvent): TransactionEvent => {
    if (!event.spans) {
        return event;
    }

    const spans = event.spans.filter((span) => {
        const description = span.description ?? '';

        return !description.includes('FB-PERF-TRACE');
    });

    return {...event, spans};
};

export default firebasePerformanceFilter;
