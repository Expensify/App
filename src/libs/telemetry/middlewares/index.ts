import type {EventHint, Log, SpanJSON, TransactionEvent} from '@sentry/core';

import attachGlobalSpanAttributes from './attachGlobalSpanAttributes';
import attachInpCategory from './attachInpCategory';
import canceledTabNavigationFilter from './canceledTabNavigationFilter';
import copyTagsToChildSpans from './copyTagsToChildSpans';
import emailDomainFilter from './emailDomainFilter';
import httpClientCancelledFilter from './httpClientCancelledFilter';
import maxDurationFilter from './maxDurationFilter';
import onyxDerivedComputeDurationFilter from './onyxDerivedComputeDurationFilter';
import onyxLogFilter from './onyxLogFilter';

type TelemetryBeforeSend = (event: TransactionEvent, hint: EventHint) => TransactionEvent | null | Promise<TransactionEvent | null>;
type TelemetryBeforeSendLog = (log: Log) => Log | null;
type TelemetryBeforeSendSpan = (span: SpanJSON) => SpanJSON;

const middlewares: TelemetryBeforeSend[] = [
    emailDomainFilter,
    canceledTabNavigationFilter,
    maxDurationFilter,
    httpClientCancelledFilter,
    onyxDerivedComputeDurationFilter,
    copyTagsToChildSpans,
    attachGlobalSpanAttributes,
];
const logMiddlewares: TelemetryBeforeSendLog[] = [onyxLogFilter];
const spanMiddlewares: TelemetryBeforeSendSpan[] = [attachInpCategory];

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

function processBeforeSendSpan(span: SpanJSON): SpanJSON {
    return spanMiddlewares.reduce((acc, middleware) => middleware(acc), span);
}

export type {TelemetryBeforeSend, TelemetryBeforeSendSpan};
export {processBeforeSendTransactions, processBeforeSendLogs, processBeforeSendSpan};
