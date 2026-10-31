import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

function useIsConciergeInboxDM(reportID: string | undefined): boolean {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    return !!reportID && reportID === conciergeReportID;
}

export default useIsConciergeInboxDM;
