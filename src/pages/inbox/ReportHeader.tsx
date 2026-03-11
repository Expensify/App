import {useRoute} from '@react-navigation/native';
import React from 'react';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {getReportOfflinePendingActionAndErrors, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import HeaderView from './HeaderView';

const defaultReportMetadata = {
    isLoadingInitialReportActions: true,
};

/**
 * Owns header variant selection, back button logic, and OfflineWithFeedback wrapper.
 * Subscribes to report data internally — ReportScreen passes nothing.
 */
function ReportHeader() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; reportActionID?: string; backTo?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);
    const backTo = routeParams?.backTo;

    const isInSidePanel = useIsInSidePanel();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const {closeSidePanel} = useSidePanelActions();
    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const parentReportAction = useParentReportAction(report);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID, routeParams?.reportActionID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== 'delete');
    const reportTransactionIDs = visibleTransactions?.map((transaction) => transaction.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);

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
                    report={report}
                    policy={policy}
                    parentReportAction={parentReportAction}
                    onBackButtonPress={onBackButtonPress}
                />
            )}
            {!isTransactionThreadView && isMoneyRequestOrInvoiceReport && (
                <MoneyReportHeader
                    report={report}
                    policy={policy}
                    transactionThreadReportID={transactionThreadReportID}
                    isLoadingInitialReportActions={reportMetadata.isLoadingInitialReportActions}
                    reportActions={reportActions}
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
