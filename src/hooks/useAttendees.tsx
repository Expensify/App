import {getAttendees} from '@libs/TransactionUtils';

import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';

import useReportOwnerAsAttendee from './useReportOwnerAsAttendee';

function useAttendees(transaction: OnyxInputOrEntry<Transaction>) {
    const reportOwnerAsAttendee = useReportOwnerAsAttendee(transaction);
    return getAttendees(transaction, reportOwnerAsAttendee);
}

export default useAttendees;
