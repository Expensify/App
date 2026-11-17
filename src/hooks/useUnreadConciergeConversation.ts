import {getLatestUnreadConciergeMessage, getLatestUnreadConciergeThread} from '@libs/ConciergeConversationUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {createConciergeMessageThread} from '@userActions/ConciergeThreads';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {getStableReportSelector} from '@selectors/Report';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useOnyx from './useOnyx';
import {usePersonalDetailsByIDs} from './usePersonalDetails';

/**
 * Returns a function that gives the reportID of the Concierge conversation with the most recent unread activity, or
 * undefined when nothing is unread. An unread Concierge message without a thread gets its thread created first.
 */
function useUnreadConciergeConversation() {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: getStableReportSelector});
    const [conciergeLastReadTime] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: (report) => report?.lastReadTime});

    const latestUnreadThreadSelector = (reports: OnyxCollection<Report>) => getLatestUnreadConciergeThread(reports, conciergeReportID);
    const [latestUnreadThread] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: latestUnreadThreadSelector});
    const latestUnreadMessageSelector = (reportActions: OnyxEntry<ReportActions>) => getLatestUnreadConciergeMessage(reportActions, conciergeLastReadTime);
    const [latestUnreadMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: latestUnreadMessageSelector});

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [participantsPersonalDetails] = usePersonalDetailsByIDs([currentUserAccountID, CONST.ACCOUNT_ID.CONCIERGE]);

    return (): string | undefined => {
        if (latestUnreadMessage && (!latestUnreadThread || latestUnreadMessage.created > latestUnreadThread.lastActivity)) {
            return createConciergeMessageThread({
                message: latestUnreadMessage,
                conciergeReport,
                currentUserAccountID,
                introSelected,
                isSelfTourViewed,
                participantsPersonalDetails,
                delegateAccountID,
            });
        }
        return latestUnreadThread?.reportID;
    };
}

export default useUnreadConciergeConversation;
