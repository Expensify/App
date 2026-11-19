import ONYXKEYS from '@src/ONYXKEYS';

import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';

/** Whether the report is the Concierge chat in the Inbox */
function useIsConciergeInboxDM(reportID: string | undefined): boolean {
    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    return !!reportID && reportID === conciergeReportID && !isInSidePanel;
}

export default useIsConciergeInboxDM;
