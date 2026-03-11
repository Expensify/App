import {useRoute} from '@react-navigation/native';
import React from 'react';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOfflinePendingActionAndErrors, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import HeaderView from './HeaderView';

/**
 * Owns header variant selection, back button logic, and OfflineWithFeedback wrapper.
 * Subscribes to report type internally — ReportScreen passes nothing.
 */
function ReportHeader() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; backTo?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);
    const backTo = routeParams?.backTo;

    const isInSidePanel = useIsInSidePanel();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const {closeSidePanel} = useSidePanelActions();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const parentReportAction = useParentReportAction(report);

    const isTransactionThreadView = isReportTransactionThread(report);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);

    const onBackButtonPress = (prioritizeBackTo = false) => {
        if (isInSidePanel) {
            closeSidePanel();
            return;
        }
        if (backTo === SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
            Navigation.goBack();
            return;
        }
        if (prioritizeBackTo && backTo) {
            Navigation.goBack(backTo as Route);
            return;
        }
        if (isInNarrowPaneModal) {
            Navigation.goBack();
            return;
        }
        if (backTo) {
            Navigation.goBack(backTo as Route);
            return;
        }
        Navigation.goBack();
    };

    return (
        <OfflineWithFeedback
            pendingAction={reportPendingAction ?? report?.pendingFields?.reimbursed}
            errors={reportErrors}
            shouldShowErrorMessages={false}
            needsOffscreenAlphaCompositing
        >
            {isTransactionThreadView && (
                <MoneyRequestHeader
                    reportID={reportIDFromRoute}
                    onBackButtonPress={onBackButtonPress}
                />
            )}
            {!isTransactionThreadView && isMoneyRequestOrInvoiceReport && (
                <MoneyReportHeader
                    reportID={reportIDFromRoute}
                    onBackButtonPress={onBackButtonPress}
                />
            )}
            {!isTransactionThreadView && !isMoneyRequestOrInvoiceReport && (
                <HeaderView
                    reportID={reportIDFromRoute}
                    onNavigationMenuButtonClicked={onBackButtonPress}
                    report={report}
                    parentReportAction={parentReportAction}
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                />
            )}
        </OfflineWithFeedback>
    );
}

export default ReportHeader;
