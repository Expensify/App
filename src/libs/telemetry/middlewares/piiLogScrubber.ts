import type {Log} from '@sentry/core';
import scrubPII from '@libs/telemetry/scrubPII';
import type {TelemetryBeforeSendLog} from './index';

/** Scrubs user logins from logs (which bypass `beforeSendTransaction` and `beforeSend`). */
const piiLogScrubber: TelemetryBeforeSendLog = (log: Log): Log => {
    if (typeof log.message === 'string') {
        // eslint-disable-next-line no-param-reassign
        log.message = scrubPII(log.message);
    }

    if (log.attributes) {
        for (const key of Object.keys(log.attributes)) {
            const value = log.attributes[key];
            if (typeof value === 'string') {
                // eslint-disable-next-line no-param-reassign
                log.attributes[key] = scrubPII(value);
            }
        }
    }

    return log;
};

export default piiLogScrubber;
