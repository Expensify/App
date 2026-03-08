import type {Log} from '@sentry/core';

const onyxLogFilter = (log: Log): Log | null => {
    if (log.attributes?.['sentry.origin'] === 'auto.log.console' && typeof log.message === 'string' && log.message.startsWith('[Onyx]')) {
        return null;
    }

    return log;
};

export default onyxLogFilter;
