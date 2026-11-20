/** The conversations the Concierge page lists, from what the device already has, most recent activity first. */
import type {ConciergeConversation} from '@libs/ConciergeConversationUtils';
import {getConciergeDMConversations, getConciergeThreadConversations, sortConciergeConversations} from '@libs/ConciergeConversationUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

function useConciergeConversations(): ConciergeConversation[] {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [conciergeReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(conciergeReportID)}`);

    const {messageConversations, threadLastActivities} = getConciergeDMConversations(conciergeReportActions);
    const threadConversations = getConciergeThreadConversations(reports, conciergeReportID).map((conversation) => {
        const lastActivity = threadLastActivities[conversation.reportID];
        return lastActivity ? {...conversation, lastActivity} : conversation;
    });

    return sortConciergeConversations([...threadConversations, ...messageConversations]);
}

export default useConciergeConversations;
