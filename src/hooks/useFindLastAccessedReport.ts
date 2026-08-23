import {findLastAccessedReport} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

type UseFindLastAccessedReportOptions = {
    /** Exclude domain rooms that are on the defaultRooms beta. */
    ignoreDomainRooms: boolean;
    /** Prefer the policy admins room when one exists. */
    openOnAdminRoom?: boolean;
    /** Report ID to exclude from the result (e.g. the report being left). */
    excludeReportID?: string;
    /** When false, skip the lookup and return undefined without scanning reports. */
    enabled?: boolean;
};

/** Resolves the last accessed report for navigation fallbacks from a view-scoped subscription. */
function useFindLastAccessedReport({ignoreDomainRooms, openOnAdminRoom = false, excludeReportID, enabled = true}: UseFindLastAccessedReportOptions) {
    const [reportNameValuePairs, reportNameValuePairsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [lastAccessedReport, reportsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => (enabled ? findLastAccessedReport(ignoreDomainRooms, openOnAdminRoom, excludeReportID, reportNameValuePairs, reports) : undefined),
    });
    return {lastAccessedReport, reportsMetadata, reportNameValuePairsMetadata};
}

export default useFindLastAccessedReport;
