import DateUtils from '@libs/DateUtils';

import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';

import getFormattedPostedDate from './getFormattedPostedDate';

function shouldShowTransactionPostedYear(transaction: OnyxInputOrEntry<Transaction>) {
    const posted = transaction?.posted;
    if (!posted) {
        return false;
    }
    return DateUtils.doesDateBelongToAPastYear(getFormattedPostedDate(posted));
}

export default shouldShowTransactionPostedYear;
