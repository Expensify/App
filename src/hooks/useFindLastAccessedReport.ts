import shouldOpenOnAdminRoom from '@libs/Navigation/helpers/shouldOpenOnAdminRoom';
import {findLastAccessedReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type UseFindLastAccessedReportOptions = {
    /** Prefer the policy admins room when one exists. Defaults to the openOnAdminRoom URL param. */
    openOnAdminRoom?: boolean;
    /** Report ID to exclude from the result (e.g. the report being left). */
    excludeReportID?: string;
    /** When false, skip the lookup and return undefined without scanning reports. */
    enabled?: boolean;
};

/** Resolves the last accessed report for navigation fallbacks from a view-scoped subscription. */
function useFindLastAccessedReport({openOnAdminRoom, excludeReportID, enabled = true}: UseFindLastAccessedReportOptions = {}) {
    const {isBetaEnabled} = usePermissions();
    const ignoreDomainRooms = !isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS);
    const shouldPreferAdminRoom = openOnAdminRoom ?? shouldOpenOnAdminRoom();
    const [guideAccountIDs] = useOnyx(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
    const [reportNameValuePairs, reportNameValuePairsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [lastAccessedReport, reportsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => (enabled ? findLastAccessedReport(ignoreDomainRooms, guideAccountIDs, shouldPreferAdminRoom, excludeReportID, reportNameValuePairs, reports) : undefined),
    });
    return {lastAccessedReport, reportsMetadata, reportNameValuePairsMetadata};
}

export default useFindLastAccessedReport;
