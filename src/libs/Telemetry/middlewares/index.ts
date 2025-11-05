import type {TransactionEvent, EventHint} from '@sentry/core';
import emailDomainFilter from './emailDomainFilter';

type TelemetryBeforeSend = (event: TransactionEvent, hint: EventHint) => TransactionEvent | null | Promise<TransactionEvent | null>;

const middlewares: TelemetryBeforeSend[] = [emailDomainFilter];

async function processBeforeSendTransactions(event: TransactionEvent, hint: EventHint): Promise<TransactionEvent | null> {
    let current: TransactionEvent | null = event;
    for (const middleware of middlewares) {
        if (current == null) {
            break;
        }
        current = await middleware(current, hint);
    }
    return current;
}

export type {TelemetryBeforeSend};
export default processBeforeSendTransactions;

