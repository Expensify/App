import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportOwnerAccountIDAsAttendee, getReportOwnerAsAttendee} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

import {getReportOwnerAccountID} from '@selectors/Report';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import {usePersonalDetail} from './usePersonalDetails';

function useReportOwnerAsAttendee(transaction: OnyxInputOrEntry<Transaction>): Attendee | undefined {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    // Subscribed rather than read once, so an expense moved to a report that is still being written, like one just
    // created from the report picker, picks up the owner as soon as the report lands.
    const reportID = getNonEmptyStringOnyxID(transaction?.reportID);
    const [reportOwnerAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportOwnerAccountID});
    const [draftReportOwnerAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, {selector: getReportOwnerAccountID});
    const reportOwnerAccountIDAsAttendee = getReportOwnerAccountIDAsAttendee(transaction, currentUserPersonalDetails.accountID, reportOwnerAccountID ?? draftReportOwnerAccountID);
    const [creatorDetails] = usePersonalDetail(reportOwnerAccountIDAsAttendee);
    return getReportOwnerAsAttendee(creatorDetails);
}

export default useReportOwnerAsAttendee;
