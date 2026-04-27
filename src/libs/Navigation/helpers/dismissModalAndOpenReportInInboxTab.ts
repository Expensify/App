import {InteractionManager} from 'react-native';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {endSubmitFollowUpActionSpan, isTracking as isSubmitTracking, setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import isReportOpenInRHP from './isReportOpenInRHP';
import isReportOpenInSuperWideRHP from './isReportOpenInSuperWideRHP';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';
import setNavigationActionToMicrotaskQueue from './setNavigationActionToMicrotaskQueue';

/**
 * After finishing the action in RHP from the Inbox tab, besides dismissing the modal, we should open the report.
 * If the action is done from the report RHP, then we just want to dismiss the money request flow screens.
 */
function dismissModalAndOpenReportInInboxTab(reportID: string | undefined, isInvoice: boolean | undefined, hasMultipleTransactions: boolean) {
    const rootState = navigationRef.getRootState();
    const hasActiveTracking = isSubmitTracking();

    if (!isInvoice && isReportOpenInRHP(rootState)) {
        const rhpKey = rootState.routes.at(-1)?.state?.key;
        if (rhpKey) {
            const isSuperWideRHP = isReportOpenInSuperWideRHP(rootState);

            // submit_follow_up_action: only set when the span was started.
            if (hasActiveTracking) {
                if (isSuperWideRHP) {
                    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
                } else if (hasMultipleTransactions && reportID) {
                    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, reportID);
                } else {
                    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
                }
            }
            // When a report is opened in the super wide RHP, we need to dismiss to the first RHP to show the same report with new expense.
            if (isSuperWideRHP) {
                Navigation.dismissToPreviousRHP();
                return;
            }
            // When a report with one expense is opened in the wide RHP and the user adds another expense, RHP should be dismissed and ROUTES.SEARCH_MONEY_REQUEST_REPORT should be displayed.
            if (hasMultipleTransactions && reportID) {
                // On small screens, dismiss all modals and then navigate to the right report.
                // On large screens, dismiss to the previous RHP first, then replace the current route with the new report.
                const isNarrowLayout = getIsNarrowLayout();
                if (isNarrowLayout) {
                    Navigation.dismissModal();
                } else {
                    Navigation.dismissToPreviousRHP();
                }
                setNavigationActionToMicrotaskQueue(() => {
                    Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID}), {forceReplace: !isNarrowLayout});
                });
                return;
            }
            Navigation.pop(rhpKey);
            return;
        }
    }
    if (isSearchTopmostFullScreenRoute() || !reportID) {
        if (hasActiveTracking) {
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
        }
        Navigation.dismissModal();
        if (hasActiveTracking) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- we need to wait for the modal to be dismissed before marking the span
            InteractionManager.runAfterInteractions(() => {
                endSubmitFollowUpActionSpan(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
            });
        }
        return;
    }
    if (hasActiveTracking) {
        Navigation.dismissModalWithReport({reportID}, undefined, {
            onBeforeNavigate: (willOpenReport: boolean) => {
                setPendingSubmitFollowUpAction(
                    willOpenReport ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY,
                    reportID,
                );
            },
        });
    } else {
        Navigation.dismissModalWithReport({reportID});
    }
}

export default dismissModalAndOpenReportInInboxTab;
