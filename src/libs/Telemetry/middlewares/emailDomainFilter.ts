import {type TransactionEvent, type EventHint} from '@sentry/core';
import CONST from '@src/CONST';
import type {TelemetryBeforeSend} from './index';
import { isDevelopment } from '@libs/Environment/Environment';

const emailDomainFilter: TelemetryBeforeSend = (event: TransactionEvent, _hint: EventHint): TransactionEvent | null => {
    const email = event.user?.email;
    const lowerEmail = typeof email === 'string' ? email.toLowerCase() : '';

    if (lowerEmail.endsWith(CONST.EMAIL.QA_DOMAIN) || lowerEmail.endsWith('applauseauto.com')) {
        return null;
    }
    
    return event;
};

export default emailDomainFilter;
