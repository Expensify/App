import type {ErrorEvent} from '@sentry/core';
import scrubEventPII from '@libs/telemetry/scrubEventPII';
import type {TelemetryBeforeSendError} from './index';

/** Scrubs user logins from error events (which bypass `beforeSendTransaction`). */
const piiErrorScrubber: TelemetryBeforeSendError = (event: ErrorEvent): ErrorEvent => {
    scrubEventPII(event);
    return event;
};

export default piiErrorScrubber;
