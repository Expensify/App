import type {EventHint, Log, TransactionEvent} from '@sentry/core';
import copyTagsToChildSpans from './copyTagsToChildSpans';
import emailDomainFilter from './emailDomainFilter';
import httpClientCancelledFilter from './httpClientCancelledFilter';
import minDurationFilter from './minDurationFilter';
import onyxLogFilter from './onyxLogFilter';

type TelemetryBeforeSend = (event: TransactionEvent, hint: EventHint) => TransactionEvent | null | Promise<TransactionEvent | null>;
type TelemetryBeforeSendLog = (log: Log) => Log | null;

const middlewares: TelemetryBeforeSend[] = [emailDomainFilter, minDurationFilter, httpClientCancelledFilter, copyTagsToChildSpans];
const logMiddlewares: TelemetryBeforeSendLog[] = [onyxLogFilter];

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

function processBeforeSendLogs(log: Log): Log | null {
    return logMiddlewares.reduce<Log | null>((acc, middleware) => {
        if (acc == null) {
            return null;
        }
        return middleware(acc);
    }, log);
}

export type {TelemetryBeforeSend, TelemetryBeforeSendLog};
export {processBeforeSendTransactions, processBeforeSendLogs};
