import useOnyx from '@hooks/useOnyx';

import {findLastAccessedReport, type LastAccessedReport} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ResultMetadata} from 'react-native-onyx';

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

type UseFindLastAccessedReportResult = {
    lastAccessedReport: LastAccessedReport | undefined;
    reportsMetadata: ResultMetadata | undefined;
    reportNameValuePairsMetadata: ResultMetadata | undefined;
};

/**
 * Resolves the last accessed report for navigation fallbacks from a view-scoped
 * subscription, so callers do not thread the reports and name-value-pairs collections
 * through themselves. The lookup runs inside the reports selector, so the component
 * only re-renders when the resolved report changes. `enabled` short-circuits the
 * selector when no lookup is needed.
 */
function useFindLastAccessedReport(options: UseFindLastAccessedReportOptions): UseFindLastAccessedReportResult {
    const {ignoreDomainRooms, openOnAdminRoom = false, excludeReportID, enabled = true} = options;
    const [reportNameValuePairs, reportNameValuePairsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [lastAccessedReport, reportsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => (enabled ? findLastAccessedReport(ignoreDomainRooms, openOnAdminRoom, excludeReportID, reportNameValuePairs, reports) : undefined),
    });
    return {lastAccessedReport, reportsMetadata, reportNameValuePairsMetadata};
}

export default useFindLastAccessedReport;
export type {UseFindLastAccessedReportOptions, UseFindLastAccessedReportResult};
