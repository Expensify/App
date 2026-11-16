import DateUtils from '@libs/DateUtils';

import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';

import {getCreated as getTransactionCreatedDate} from './fields';

function shouldShowTransactionYear(transaction: OnyxInputOrEntry<Transaction>) {
    const date = getTransactionCreatedDate(transaction);
    return DateUtils.doesDateBelongToAPastYear(date);
}

export default shouldShowTransactionYear;
