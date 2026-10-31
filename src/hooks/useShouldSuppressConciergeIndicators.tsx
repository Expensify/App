import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Returns true when thinking/typing indicators should be hidden: in the Concierge chat and while a followup list is pending.
 */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [pendingFollowupList] = useOnyx(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${reportID}`);

    return !!pendingFollowupList || reportID === conciergeReportID;
}

export default useShouldSuppressConciergeIndicators;
