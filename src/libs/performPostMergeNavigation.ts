import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type PerformPostMergeNavigationParams = {
    isOnSearch: boolean;
    reportID: string;
    targetTransactionReportID: string | undefined;
};

/**
 * Performs the appropriate navigation after a merge is completed.
 * - When not on search and merging into a different report: dismisses modal and opens that report (or search report screen if applicable).
 * - Otherwise: dismisses to super wide RHP.
 */
/* eslint-disable @typescript-eslint/no-unsafe-return -- Navigation/ROUTES APIs may be typed with any; we intentionally do not return their values */
function performPostMergeNavigation({isOnSearch, reportID, targetTransactionReportID}: PerformPostMergeNavigationParams): void {
    const reportIDToDismiss = reportID !== CONST.REPORT.UNREPORTED_REPORT_ID ? reportID : undefined;

    // If we're on search, dismiss the modal and stay on search
    if (!isOnSearch && reportIDToDismiss && reportID !== targetTransactionReportID) {
        // Navigate to search money report screen if we're on Reports
        if (isSearchTopmostFullScreenRoute()) {
            // Close the current modal screen
            Navigation.dismissModal();
            // Ensure the dismiss completes first
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                // Navigate to the money request report in search results
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: reportIDToDismiss}));
            });
        } else {
            Navigation.dismissModalWithReport({reportID: reportIDToDismiss});
        }
    } else {
        Navigation.dismissToSuperWideRHP();
    }
}

export default performPostMergeNavigation;
