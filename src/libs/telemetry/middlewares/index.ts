import type {ErrorEvent, EventHint, Log, TransactionEvent} from '@sentry/core';

import canceledTabNavigationFilter from './canceledTabNavigationFilter';
import copyTagsToChildSpans from './copyTagsToChildSpans';
import emailDomainFilter from './emailDomainFilter';
import enrichOpaqueRejection from './enrichOpaqueRejection';
import httpClientCancelledFilter from './httpClientCancelledFilter';
import maxDurationFilter from './maxDurationFilter';
import minDurationFilter from './minDurationFilter';
import onyxLogFilter from './onyxLogFilter';

type TelemetryBeforeSend = (event: TransactionEvent, hint: EventHint) => TransactionEvent | null | Promise<TransactionEvent | null>;
type TelemetryBeforeSendLog = (log: Log) => Log | null;
type TelemetryBeforeSendError = (event: ErrorEvent, hint: EventHint) => ErrorEvent | null;

const middlewares: TelemetryBeforeSend[] = [emailDomainFilter, canceledTabNavigationFilter, minDurationFilter, maxDurationFilter, httpClientCancelledFilter, copyTagsToChildSpans];
const logMiddlewares: TelemetryBeforeSendLog[] = [onyxLogFilter];
const errorMiddlewares: TelemetryBeforeSendError[] = [enrichOpaqueRejection];

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

function processBeforeSendErrors(event: ErrorEvent, hint: EventHint): ErrorEvent | null {
    return errorMiddlewares.reduce<ErrorEvent | null>((acc, middleware) => {
        if (acc == null) {
            return null;
        }
        return middleware(acc, hint);
    }, event);
}

export type {TelemetryBeforeSend, TelemetryBeforeSendError};
export {processBeforeSendTransactions, processBeforeSendLogs, processBeforeSendErrors};
