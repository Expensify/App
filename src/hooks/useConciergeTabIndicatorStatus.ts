import {isConciergeMessageWithoutThread} from '@libs/ConciergeConversationUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isUnread} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';
import useTheme from './useTheme';

/**
 * The dot on the Concierge item, shown while a Concierge conversation has something the user hasn't read: a thread with
 * an unread reply, or a Concierge message posted after the user last read the DM that they haven't opened yet. The DM
 * itself only starts new conversations on the Concierge page, so its own read state isn't counted.
 */
function useConciergeTabIndicatorStatus(): string | undefined {
    const theme = useTheme();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const hasUnreadThreadSelector = (reports: OnyxCollection<Report>) =>
        !!conciergeReportID && Object.values(reports ?? {}).some((report) => report?.parentReportID === conciergeReportID && isUnread(report, undefined, false, undefined));
    const [hasUnreadThread = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: hasUnreadThreadSelector});

    const [conciergeLastReadTime] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: (report) => report?.lastReadTime});
    const hasUnreadMessageSelector = (reportActions: OnyxEntry<ReportActions>) =>
        Object.values(reportActions ?? {}).some((reportAction) => isConciergeMessageWithoutThread(reportAction) && reportAction.created > (conciergeLastReadTime ?? ''));
    const [hasUnreadMessage = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: hasUnreadMessageSelector});

    return hasUnreadThread || hasUnreadMessage ? theme.iconSuccessFill : undefined;
}

export default useConciergeTabIndicatorStatus;
