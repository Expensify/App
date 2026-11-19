import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

/** The Concierge DM, when its conversations open on the Concierge page instead of in the Inbox. That is the case with the flat navigation. */
function useConciergePageReportID(): string | undefined {
    const {isBetaEnabled} = usePermissions();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    return isBetaEnabled(CONST.BETAS.FLAT_NAV) ? conciergeReportID : undefined;
}

export default useConciergePageReportID;
