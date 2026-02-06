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
function performPostMergeNavigation({isOnSearch, reportID, targetTransactionReportID}: PerformPostMergeNavigationParams): void {
    const reportIDToDismiss = reportID !== CONST.REPORT.UNREPORTED_REPORT_ID ? reportID : undefined;

    if (!isOnSearch && reportIDToDismiss && reportID !== targetTransactionReportID) {
        if (isSearchTopmostFullScreenRoute()) {
            Navigation.dismissModal();
            Navigation.setNavigationActionToMicrotaskQueue((): void => {
                void Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: reportIDToDismiss}));
            });
        } else {
            Navigation.dismissModalWithReport({reportID: reportIDToDismiss});
        }
    } else {
        Navigation.dismissToSuperWideRHP();
    }
}

export default performPostMergeNavigation;
