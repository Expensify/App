import shouldOpenOnAdminRoom from '@libs/Navigation/helpers/shouldOpenOnAdminRoom';
import {findLastAccessedReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useIsAnonymousUser from './useIsAnonymousUser';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type UseFindLastAccessedReportOptions = {
    // Prefer the policy admins room when one exists. Defaults to the openOnAdminRoom URL param.
    openOnAdminRoom?: boolean;
    // When false, skip the lookup and return undefined without scanning reports.
    enabled?: boolean;
};

// Resolves the last accessed report for navigation fallbacks from a view-scoped subscription.
function useFindLastAccessedReport({openOnAdminRoom, enabled = true}: UseFindLastAccessedReportOptions = {}) {
    const {isBetaEnabled} = usePermissions();
    const ignoreDomainRooms = !isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS);
    const shouldPreferAdminRoom = openOnAdminRoom ?? shouldOpenOnAdminRoom();
    const [guideAccountIDs] = useOnyx(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
    const isAnonymousUser = useIsAnonymousUser();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const excludedConciergeReportID = isBetaEnabled(CONST.BETAS.FLAT_NAV) ? conciergeReportID : undefined;
    const [reportNameValuePairs, reportNameValuePairsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [lastAccessedReportID, reportsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => {
            if (!enabled) {
                return undefined;
            }
            return findLastAccessedReport(ignoreDomainRooms, guideAccountIDs, isAnonymousUser, shouldPreferAdminRoom, undefined, reportNameValuePairs, reports, excludedConciergeReportID)
                ?.reportID;
        },
    });
    return {lastAccessedReportID, reportsMetadata, reportNameValuePairsMetadata};
}

export default useFindLastAccessedReport;
