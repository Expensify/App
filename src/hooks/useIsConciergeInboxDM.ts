import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/** Whether the report is the Concierge chat, in the Inbox or the side panel, which share its welcome screen and history toggle */
function useIsConciergeInboxDM(reportID: string | undefined): boolean {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    return !!reportID && reportID === conciergeReportID;
}

export default useIsConciergeInboxDM;
