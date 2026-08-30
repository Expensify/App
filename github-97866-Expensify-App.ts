// File: src/libs/ReportUtils.ts
// Function to determine if a report should appear in the "Approved" filter
// In New Expensify, paid reports should NOT appear under "Approved" filter
// Classic behavior: admins can mark as paid, but paid reports should be hidden from "Approved" view

/**
 * Checks if a report should be included in the "Approved" filter view
 * Paid reports should not appear in the "Approved" filter in New Expensify
 */
function isReportInApprovedFilter(report: Report): boolean {
  // If report is already paid, it should NOT appear in the Approved filter
  if (report.isPaid) {
    return false;
  }

  // Only include reports that are approved but not paid
  return report.state === 'APPROVED';
}

// Alternative: If the filtering is done via GraphQL/SQL, update the query
// Example GraphQL query fix (in src/libs/Report/ReportList.ts)
// 
// Before (incorrect):
// query GetApprovedReports($workspaceID: String!) {
//   reports(workspaceID: $workspaceID, filter: APPROVED) {
//     ...ReportFragment
//   }
// }
//
// After (correct):
// query GetApprovedReports($workspaceID: String!) {
//   reports(workspaceID: $workspaceID, filter: APPROVED, excludePaid: true) {
//     ...ReportFragment
//   }
// }

// In the GraphQL schema/resolver (if modifying backend):
// type Query {
//   reports(workspaceID: String!, filter: ReportFilter, excludePaid: Boolean): [Report!]!
// }
// 
// resolver implementation:
// reports: (_, { workspaceID, filter, excludePaid = true }) => {
//   const query = ReportModel.find({ workspaceID, state: ReportState.APPROVED });
//   if (excludePaid) {
//     query.where({ isPaid: false });
//   }
//   return query.exec();
// }

// In the UI component (src/pages/workspace/reports/ApprovedReportsPage.tsx):
// 
// Before:
// const approvedReports = useReportList({
//   filter: ReportFilter.APPROVED,
// });
//
// After:
// const approvedReports = useReportList({
//   filter: ReportFilter.APPROVED,
//   excludePaid: true, // Ensure paid reports are excluded
// });