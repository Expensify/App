import type {TransactionEvent} from '@sentry/core';
import scrubEventPII from '@libs/telemetry/scrubEventPII';
import type {TelemetryBeforeSend} from './index';

/** Scrubs user logins from transaction events. */
const piiTransactionScrubber: TelemetryBeforeSend = (event: TransactionEvent): TransactionEvent => {
    scrubEventPII(event);
    return event;
};

export default piiTransactionScrubber;
