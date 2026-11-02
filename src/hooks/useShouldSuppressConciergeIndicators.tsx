import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/** Concierge answers each question in its own thread, so its chat never shows thinking or typing indicators. */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [pendingFollowupList] = useOnyx(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${reportID}`);

    return !!pendingFollowupList || reportID === conciergeReportID;
}

export default useShouldSuppressConciergeIndicators;
