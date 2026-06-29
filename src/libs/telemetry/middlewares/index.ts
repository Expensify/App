import type {ErrorEvent, EventHint, Log, TransactionEvent} from '@sentry/core';
import copyTagsToChildSpans from './copyTagsToChildSpans';
import emailDomainFilter from './emailDomainFilter';
import httpClientCancelledFilter from './httpClientCancelledFilter';
import maxDurationFilter from './maxDurationFilter';
import minDurationFilter from './minDurationFilter';
import onyxLogFilter from './onyxLogFilter';
import piiErrorScrubber from './piiErrorScrubber';
import piiLogScrubber from './piiLogScrubber';
import piiTransactionScrubber from './piiTransactionScrubber';

type TelemetryBeforeSend = (event: TransactionEvent, hint: EventHint) => TransactionEvent | null | Promise<TransactionEvent | null>;
type TelemetryBeforeSendError = (event: ErrorEvent, hint: EventHint) => ErrorEvent | null | Promise<ErrorEvent | null>;
type TelemetryBeforeSendLog = (log: Log) => Log | null;

const middlewares: TelemetryBeforeSend[] = [emailDomainFilter, piiTransactionScrubber, minDurationFilter, maxDurationFilter, httpClientCancelledFilter, copyTagsToChildSpans];
const errorMiddlewares: TelemetryBeforeSendError[] = [piiErrorScrubber];
const logMiddlewares: TelemetryBeforeSendLog[] = [onyxLogFilter, piiLogScrubber];

function processBeforeSendTransactions(event: TransactionEvent, hint: EventHint): Promise<TransactionEvent | null> {
    return middlewares.reduce(
        async (acc, middleware) => {
            const result = await acc;
            if (result == null) {
                return null;
            }
            return middleware(result, hint);
        },
        Promise.resolve(event) as Promise<TransactionEvent | null>,
    );
}

function processBeforeSendErrors(event: ErrorEvent, hint: EventHint): Promise<ErrorEvent | null> {
    return errorMiddlewares.reduce(
        async (acc, middleware) => {
            const result = await acc;
            if (result == null) {
                return null;
            }
            return middleware(result, hint);
        },
        Promise.resolve(event) as Promise<ErrorEvent | null>,
    );
}

function processBeforeSendLogs(log: Log): Log | null {
    return logMiddlewares.reduce<Log | null>((acc, middleware) => {
        if (acc == null) {
            return null;
        }
        return middleware(acc);
    }, log);
}

export type {TelemetryBeforeSend, TelemetryBeforeSendError, TelemetryBeforeSendLog};
export {processBeforeSendTransactions, processBeforeSendErrors, processBeforeSendLogs};
