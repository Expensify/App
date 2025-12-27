import * as Sentry from '@sentry/react-native';
import type Response from '@src/types/onyx/Response';

type HTTPSpanData = {
    /** The API command name */
    command: string;
    /** The response from the server */
    response?: Response | void;
    /** HTTP status code if available */
    statusCode?: number;
    /** Whether the request succeeded */
    success: boolean;
    /** Start time of the request */
    startTime?: number;
    /** The full URL of the request */
    url?: string;
    /** HTTP method (GET, POST, etc) */
    method?: string;
};

/**
 * Sends an HTTP request span to Sentry with requestID and metadata.
 * This is used for tracking API requests, especially those processed through SequentialQueue.
 *
 * @param data - The HTTP span data including command, response, and timing information
 */
function sendHTTPSpanToSentry(data: HTTPSpanData): void {
    const {command, response, statusCode, success, startTime, url, method = 'POST'} = data;

    if (!response?.requestID) {
        return;
    }

    const spanAttributes: Record<string, string | number | boolean> = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        request_id: response.requestID,
        command,
        success,
    };

    if (url) {
        spanAttributes['http.url'] = url;
    }

    if (method) {
        spanAttributes['http.method'] = method;
    }

    if (statusCode) {
        spanAttributes['http.status_code'] = statusCode;
    }

    if (response.jsonCode) {
        spanAttributes.json_code = response.jsonCode;
    }

    const span = Sentry.startInactiveSpan({
        op: 'http.request',
        name: `${method} ${command}`,
        startTime: startTime ? startTime / 1000 : undefined,
        attributes: spanAttributes,
    });

    if (span) {
        span.setStatus({
            code: success ? 1 : 2, // 1 = OK, 2 = ERROR
        });

        span.end();
    }
}

export default sendHTTPSpanToSentry;
