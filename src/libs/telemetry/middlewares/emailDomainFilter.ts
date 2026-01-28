import type {TransactionEvent} from '@sentry/core';
import CONST from '@src/CONST';
import type {TelemetryBeforeSend} from './index';

const emailDomainFilter: TelemetryBeforeSend = (event: TransactionEvent): TransactionEvent | null => {
    const email = event.user?.email;
    const lowerEmail = typeof email === 'string' ? email.toLowerCase() : '';

    if (lowerEmail !== 'applausetester@applause.expensifail.com' && (lowerEmail.endsWith(CONST.EMAIL.QA_DOMAIN) || lowerEmail.endsWith('applauseauto.com'))) {
        return null;
    }

    return event;
};

export default emailDomainFilter;
