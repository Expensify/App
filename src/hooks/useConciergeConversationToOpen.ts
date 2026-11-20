import {getLatestUnreadConciergeMessage, getLatestUnreadConciergeThread} from '@libs/ConciergeConversationUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {getReportLastReadTime} from '@selectors/Report';

import useCreateConciergeMessageThread from './useCreateConciergeMessageThread';
import useOnyx from './useOnyx';

/**
 * Returns a function that gives the reportID the Concierge page should open on: the conversation with the most recent
 * unread activity, or the Concierge DM, where a new conversation starts, when nothing is unread. An unread Concierge
 * message without a thread gets its thread created first.
 */
function useConciergeConversationToOpen() {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeLastReadTime] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: getReportLastReadTime});

    const latestUnreadThreadSelector = (reports: OnyxCollection<Report>) => getLatestUnreadConciergeThread(reports, conciergeReportID);
    const [latestUnreadThread] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: latestUnreadThreadSelector});
    const latestUnreadMessageSelector = (reportActions: OnyxEntry<ReportActions>) => getLatestUnreadConciergeMessage(reportActions, conciergeLastReadTime);
    const [latestUnreadMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: latestUnreadMessageSelector});
    const createConciergeMessageThread = useCreateConciergeMessageThread();

    return (): string | undefined => {
        if (latestUnreadMessage && (!latestUnreadThread || latestUnreadMessage.created > latestUnreadThread.lastActivity)) {
            return createConciergeMessageThread(latestUnreadMessage);
        }
        return latestUnreadThread?.reportID ?? conciergeReportID;
    };
}

export default useConciergeConversationToOpen;
