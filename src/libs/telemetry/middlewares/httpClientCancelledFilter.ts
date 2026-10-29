import type {TelemetryBeforeSend} from './index';

/**
 * Middleware that filters out cancelled HTTP client spans.
 * These spans typically represent aborted network requests that don't provide useful telemetry data.
 * This is related to an issue with Sentry's browserTracingIntegration which generates doubled spans for HTTP requests.
 */
const httpClientCancelledFilter: TelemetryBeforeSend = (event) => {
    if (!event.spans) {
        return event;
    }

    const spans = event.spans.filter((span) => {
        const isHttpClient = span.op === 'http.client';
        const isCancelled = span.status === 'cancelled';
        return !(isHttpClient && isCancelled);
    });

    return {...event, spans};
};

export default httpClientCancelledFilter;
