import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Returns true when thinking/typing indicators should be hidden: in the main Concierge chat, and while a followup list is pending.
 */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [hasPendingFollowupList = false] = useOnyx(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${reportID}`, {
        selector: (pendingFollowupList) => !!pendingFollowupList,
    });

    return hasPendingFollowupList || reportID === conciergeReportID;
}

export default useShouldSuppressConciergeIndicators;
