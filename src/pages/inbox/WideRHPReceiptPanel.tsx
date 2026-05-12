import {useRoute} from '@react-navigation/native';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import MoneyRequestReceiptView from '@components/ReportActionItem/MoneyRequestReceiptView';
import ScrollView from '@components/ScrollView';
import useShowWideRHPVersion from '@components/WideRHPContextProvider/useShowWideRHPVersion';
import useMoneyRequestReportPaginatedFilteredActions from '@hooks/useMoneyRequestReportPaginatedFilteredActions';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView} from '@libs/MoneyRequestReportUtils';
import {isTransactionThread} from '@libs/ReportActionsUtils';
import {isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

/**
 * Conditionally renders the receipt view in wide RHP layout.
 * Outer guard short-circuits on non-SEARCH_REPORT routes and on small screens so the heavy
 * subscriptions inside the gate don't fire on every Inbox ReportScreen mount or on mobile,
 * where the wide RHP layout doesn't exist.
 */
function WideRHPReceiptPanel() {
    const route = useRoute();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    if (route.name !== SCREENS.RIGHT_MODAL.SEARCH_REPORT || isSmallScreenWidth) {
        return null;
    }
    return <WideRHPReceiptPanelGate />;
}

function WideRHPReceiptPanelGate() {
    const styles = useThemeStyles();
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; reportActionID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);
    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const parentReportAction = useParentReportAction(report);

    const {reportActions} = useMoneyRequestReportPaginatedFilteredActions(report?.reportID, routeParams?.reportActionID);

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const {transactionThreadReport} = useTransactionThreadReport(reportIDFromRoute, reportActions ?? []);

    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const shouldDisplayMoneyRequestActionsList = isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, visibleTransactions ?? []);

    const shouldShowWideRHP =
        !shouldDisplayMoneyRequestActionsList &&
        (isTransactionThread(parentReportAction) ||
            parentReportAction?.childType === CONST.REPORT.TYPE.EXPENSE ||
            parentReportAction?.childType === CONST.REPORT.TYPE.IOU ||
            report?.type === CONST.REPORT.TYPE.EXPENSE ||
            report?.type === CONST.REPORT.TYPE.IOU);

    useShowWideRHPVersion(shouldShowWideRHP);

    if (!shouldShowWideRHP) {
        return null;
    }

    return (
        <Animated.View style={styles.wideRHPMoneyRequestReceiptViewContainer}>
            <ScrollView contentContainerStyle={styles.wideRHPMoneyRequestReceiptViewScrollViewContainer}>
                <MoneyRequestReceiptView
                    report={transactionThreadReport ?? report}
                    fillSpace
                    isDisplayedInWideRHP
                />
            </ScrollView>
        </Animated.View>
    );
}

export default WideRHPReceiptPanel;
