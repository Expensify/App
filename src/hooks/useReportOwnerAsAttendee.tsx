import {getReportOwnerAccountIDAsAttendee, getReportOwnerAsAttendee} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

function useReportOwnerAsAttendee(transaction: OnyxInputOrEntry<Transaction>): Attendee | undefined {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const reportOwnerAccountIDAsAttendee = getReportOwnerAccountIDAsAttendee(transaction, currentUserPersonalDetails.accountID);
    const [creatorDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector(reportOwnerAccountIDAsAttendee)});
    return getReportOwnerAsAttendee(creatorDetails);
}

export default useReportOwnerAsAttendee;
