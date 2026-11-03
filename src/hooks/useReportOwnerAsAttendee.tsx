import {getReportOwnerAccountIDAsAttendee, getReportOwnerAsAttendee} from '@libs/TransactionUtils';

import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import {usePersonalDetail} from './usePersonalDetails';

function useReportOwnerAsAttendee(transaction: OnyxInputOrEntry<Transaction>): Attendee | undefined {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const reportOwnerAccountIDAsAttendee = getReportOwnerAccountIDAsAttendee(transaction, currentUserPersonalDetails.accountID);
    const [creatorDetails] = usePersonalDetail(reportOwnerAccountIDAsAttendee);
    return getReportOwnerAsAttendee(creatorDetails);
}

export default useReportOwnerAsAttendee;
