import type Report from '@src/types/onyx/Report';
import type {SearchQuery} from '@src/types/onyx/SearchResults';
import * as PolicyUtils from './PolicyUtils';
import * as ReportUtils from './ReportUtils';

type SearchFilters = {
    policyID?: string;
    type?: string;
    status?: string;
    from?: string;
    to?: string;
    sortBy?: string;
    sortOrder?: string;
};

/**
 * Determines if a user can view all workspace reports based on their role
 */
function canViewAllWorkspaceReports(policyID: string | undefined): boolean {
    if (!policyID) {
        return false;
    }

    return PolicyUtils.isPolicyAdmin(policyID) || PolicyUtils.isPolicyOwner(policyID);
}

/**
 * Filters reports based on workspace permissions and visibility rules
 */
function filterReportsForWorkspace(reports: Report[], policyID: string | undefined, currentUserAccountID: number): Report[] {
    if (!policyID) {
        return reports;
    }

    const canViewAll = canViewAllWorkspaceReports(policyID);

    if (canViewAll) {
        // Admin/Owner can see all workspace reports
        return reports.filter(report =>
            ReportUtils.getReportPolicyID(report) === policyID
        );
    }

    // Regular users can only see their own reports
    return reports.filter(report => {
        const reportPolicyID = ReportUtils.getReportPolicyID(report);
        const isOwnReport = ReportUtils.isReportParticipant(currentUserAccountID, report);

        return reportPolicyID === policyID && isOwnReport;
    });
}

/**
 * Builds search query parameters for workspace report filtering
 */
function buildWorkspaceSearchQuery(filters: SearchFilters, policyID: string | undefined): SearchQuery {
    const baseQuery: SearchQuery = {
        type: filters.type || 'expense',
        status: filters.status || 'all',
        sortBy: filters.sortBy || 'date',
        sortOrder: filters.sortOrder || 'desc',
    };

    if (policyID) {
        baseQuery.policyID = policyID;

        // If user can view all workspace reports, don't restrict by participant
        if (!canViewAllWorkspaceReports(policyID)) {
            baseQuery.participantAccountID = 'current';
        }
    }

    if (filters.from) {
        baseQuery.from = filters.from;
    }

    if (filters.to) {
        baseQuery.to = filters.to;
    }

    return baseQuery;
}

/**
 * Checks if a report should be visible in workspace search results
 */
function shouldShowReportInWorkspaceSearch(
    report: Report,
    policyID: string | undefined,
    currentUserAccountID: number
): boolean {
    if (!report) {
        return false;
    }

    const reportPolicyID = ReportUtils.getReportPolicyID(report);

    // Only show reports from the selected workspace
    if (policyID && reportPolicyID !== policyID) {
        return false;
    }

    // If user can view all workspace reports, show all reports from workspace
    if (policyID && canViewAllWorkspaceReports(policyID)) {
        return true;
    }

    // Otherwise, only show reports the user participates in
    return ReportUtils.isReportParticipant(currentUserAccountID, report);
}

/**
 * Updates search filters to include workspace-specific parameters
 */
function enhanceFiltersForWorkspace(filters: SearchFilters, policyID: string | undefined): SearchFilters {
    const enhancedFilters = {...filters};

    if (policyID) {
        enhancedFilters.policyID = policyID;

        // Only restrict to current user if they're not an admin/owner
        if (!canViewAllWorkspaceReports(policyID)) {
            enhancedFilters.participantAccountID = 'current';
        }
    }

    return enhancedFilters;
}

export {
    canViewAllWorkspaceReports,
    filterReportsForWorkspace,
    buildWorkspaceSearchQuery,
    shouldShowReportInWorkspaceSearch,
    enhanceFiltersForWorkspace,
};

export type {SearchFilters};
