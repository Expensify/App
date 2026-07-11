/*
 * Headless replacement for @libs/Log (see rnStubPlugin). tsconfig paths still resolve @libs/Log to
 * the real expensify-common Logger for type-checking, so this stub matches Logger's public method
 * signatures even though `sendNow`/`includeStackTrace`/`onlyFlushWithOthers`/`extraData` don't
 * apply to this process-per-invocation CLI and are ignored.
 */
import type {LogLevel, LogParams} from '@server/libs/formatExpensifyRsyslogLine';

import formatExpensifyRsyslogLine from '@server/libs/formatExpensifyRsyslogLine';
import writeRsyslog from '@server/libs/rsyslogWriter';

function write(level: LogLevel, message: string, params: LogParams): void {
    // Read lazily (rather than caching at module load) so tests can set process.env.REQUEST_ID
    // before calling write(). Unset outside of a real invocation (e.g. local/unit-test runs), in
    // which case the formatted line simply carries an empty REQUEST_ID field.
    const envRequestId = process.env.REQUEST_ID;
    const requestId = envRequestId === undefined ? '' : envRequestId;
    const lines = formatExpensifyRsyslogLine({level, message, params, requestId});

    for (const line of lines) {
        writeRsyslog(line);
    }
}

const Log = {
    info: (message: string, sendNow?: boolean, parameters?: LogParams) => write('info', message, parameters),
    alert: (message: string, parameters?: LogParams) => write('alrt', message, parameters),
    warn: (message: string, parameters?: LogParams) => write('warn', message, parameters),
    hmmm: (message: string, parameters?: LogParams) => write('hmmm', message, parameters),
};

export default Log;
