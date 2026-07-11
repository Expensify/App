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
    const lines = formatExpensifyRsyslogLine({level, message, params, requestId: process.env.REQUEST_ID ?? ''});

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
