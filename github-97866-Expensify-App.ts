// lib/ReportUtils.ts
import _ from 'underscore';

// ... existing imports and code ...

/**
 * Determines if a report is considered "paid" for UI filtering purposes
 * A report is paid if it has been marked as paid AND is approved
 */
function isReportPaid(report: Report): boolean {
    return report.status === 'paid';
}

/**
 * Determines if a report is considered "approved" for UI filtering purposes
 * A report is approved if it has been approved (regardless of payment status)
 */
function isReportApproved(report: Report): boolean {
    return report.status === 'approved' || report.status === 'paid';
}

/**
 * Filters reports based on the active filter type
 */
function filterReports(reports: Report[], filter: ReportFilter): Report[] {
    switch (filter) {
        case ReportFilter.Approved:
            // Show reports that are approved OR paid (paid implies approved)
            return reports.filter(report => isReportApproved(report));
        case ReportFilter.Paid:
            return reports.filter(report => isReportPaid(report));
        // ... other filters
        default:
            return reports;
    }
}

// ... existing code ...

/**
 * Determines if the current user can mark a report as paid
 * Workspace admins should always be able to mark reports as paid
 */
function canMarkReportAsPaid(report: Report, user: User): boolean {
    // Only allow marking as paid if the report is approved and not yet paid
    if (report.status !== 'approved') {
        return false;
    }

    // Check if user is a workspace admin
    const workspace = getWorkspace(report.workspaceID);
    if (!workspace || !workspace.ownerID) {
        return false;
    }

    // User can mark as paid if they are the workspace owner or an admin
    return user.accountID === workspace.ownerID || _.contains(workspace.adminIDs || [], user.accountID);
}

// ... existing code ...

// In ReportActionItem.js or similar component rendering report items
function ReportItem({ report, user }: { report: Report; user: User }) {
    const isApproved = isReportApproved(report);
    const isPaid = isReportPaid(report);
    
    // Determine available actions based on report status and user permissions
    const canMarkAsPaid = canMarkReportAsPaid(report, user);
    
    // ... existing code ...

    return (
        // ... existing JSX ...
        {isApproved && !isPaid && canMarkAsPaid && (
            <Button
                title="Mark as Paid"
                onPress={() => markReportAsPaid(report.reportID)}
            />
        )}
        {!isApproved && isApproved && (
            <Button
                title="View"
                onPress={() => navigateToReport(report.reportID)}
            />
        )}
        // ... existing code ...
    );
}