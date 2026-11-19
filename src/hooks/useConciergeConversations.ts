/** The conversations the Concierge page lists, from what the device already has, most recent activity first. */
import type {ConciergeConversation} from '@libs/ConciergeConversationUtils';
import {getConciergeDMConversations, getConciergeThreadConversations, sortConciergeConversations} from '@libs/ConciergeConversationUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

function useConciergeConversations(): ConciergeConversation[] {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const threadConversationsSelector = (reports: OnyxCollection<Report>) => getConciergeThreadConversations(reports, conciergeReportID);
    const [threadConversations = []] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: threadConversationsSelector});
    const [dmConversations] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: getConciergeDMConversations});

    const datedThreadConversations = threadConversations.map((conversation) => {
        const lastActivity = dmConversations?.threadLastActivities[conversation.reportID];
        return lastActivity ? {...conversation, lastActivity} : conversation;
    });

    return sortConciergeConversations([...datedThreadConversations, ...(dmConversations?.messageConversations ?? [])]);
}

export default useConciergeConversations;
