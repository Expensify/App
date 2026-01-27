import type {EventHint, TransactionEvent} from '@sentry/core';
import emailDomainFilter from './emailDomainFilter';
import minDurationFilter from './minDurationFilter';
import scopeTagsEnricher from './scopeTagsEnricher';

type TelemetryBeforeSend = (event: TransactionEvent, hint: EventHint) => TransactionEvent | null | Promise<TransactionEvent | null>;

const middlewares: TelemetryBeforeSend[] = [emailDomainFilter, minDurationFilter, scopeTagsEnricher];

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

export type {TelemetryBeforeSend};
export default processBeforeSendTransactions;
