import {PortalHost} from '@gorhom/portal';
import React, {useCallback, useEffect, useMemo} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated, InteractionManager, ScrollView, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import MoneyRequestReceiptView from '@components/ReportActionItem/MoneyRequestReceiptView';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {removeFailedReport} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, isMoneyRequestAction, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import {canEditReportAction, getReportOfflinePendingActionAndErrors, isReportTransactionThread} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import Navigation from '@navigation/Navigation';
import ReportActionsView from '@pages/inbox/report/ReportActionsView';
import ReportFooter from '@pages/inbox/report/ReportFooter';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {ThemeStyles} from '@src/styles';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportActionsList from './MoneyRequestReportActionsList';

type MoneyRequestReportViewProps = {
    /** The report */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Metadata for report */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** Current policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether Report footer (that includes Composer) should be displayed */
    shouldDisplayReportFooter: boolean;

    /** The `backTo` route that should be used when clicking back button */
    backToRoute: Route | undefined;
};

function goBackFromSearchMoneyRequest() {
    const rootState = navigationRef.getRootState();
    const lastRoute = rootState.routes.at(-1);

    if (!lastRoute) {
        Log.hmmm('[goBackFromSearchMoneyRequest()] No last route found in root state.');
        return;
    }

    if (lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        Navigation.goBack();
        return;
    }

    if (lastRoute?.name !== NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR) {
        Log.hmmm('[goBackFromSearchMoneyRequest()] goBackFromSearchMoneyRequest was called from a different navigator than SearchFullscreenNavigator.');
        return;
    }

    if (rootState.routes.length > 1) {
        Navigation.goBack();
        return;
    }

    Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
}

function InitialLoadingSkeleton({styles}: {styles: ThemeStyles}) {
    return (
        <View style={[styles.flex1]}>
            <View style={[styles.appContentHeader, styles.borderBottom]}>
                <ReportHeaderSkeletonView onBackButtonPress={() => {}} />
            </View>
            <ReportActionsSkeletonView />
        </View>
    );
}

function MoneyRequestReportView({report, policy, reportMetadata, shouldDisplayReportFooter, backToRoute}: MoneyRequestReportViewProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const reportID = report?.reportID;
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`, {canBeMissing: true});
    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`, {canBeMissing: true});

    const {reportActions: unfilteredReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID);

    const reportActions = useMemo(() => {
        return getFilteredReportActionsForReportView(unfilteredReportActions);
    }, [unfilteredReportActions]);

    const {transactions: reportTransactions, violations: allReportViolations} = useTransactionsAndViolationsForReport(reportID);
    const hasPendingDeletionTransaction = Object.values(reportTransactions ?? {}).some((transaction) => transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const transactions = useMemo(() => getAllNonDeletedTransactions(reportTransactions, reportActions, isOffline, true), [reportTransactions, reportActions, isOffline]);

    const visibleTransactions = transactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((transaction) => transaction.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const isSentMoneyReport = useMemo(() => reportActions.some((action) => isSentMoneyReportAction(action)), [reportActions]);

    const newTransactions = useNewTransactions(reportMetadata?.hasOnceLoadedReportActions, transactions);

    const parentReportAction = useParentReportAction(report);

    const lastReportAction = [...reportActions, parentReportAction].find((action) => canEditReportAction(action) && !isMoneyRequestAction(action));
    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;

    const dismissReportCreationError = useCallback(() => {
        goBackFromSearchMoneyRequest();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => removeFailedReport(reportID));
    }, [reportID]);

    // Special case handling a report that is a transaction thread
    // If true we will use standard `ReportActionsView` to display report data and a special header, anything else is handled via `MoneyRequestReportActionsList`
    const isTransactionThreadView = isReportTransactionThread(report);

    // Prevent the empty state flash by ensuring transaction data is fully loaded before deciding which view to render
    // We need to wait for both the selector to finish AND ensure we're not in a loading state where transactions could still populate
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, transactions, reportMetadata, isOffline);

    const isEmptyTransactionReport = visibleTransactions && visibleTransactions.length === 0 && transactionThreadReportID === undefined;
    const shouldDisplayMoneyRequestActionsList = !!isEmptyTransactionReport || shouldDisplayReportTableView(report, visibleTransactions ?? []);

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});
    const shouldShowWideRHPReceipt = visibleTransactions.length === 1 && !isSmallScreenWidth && !!transactionThreadReport;

    const reportHeaderView = useMemo(
        () =>
            isTransactionThreadView ? (
                <MoneyRequestHeader
                    report={report}
                    policy={policy}
                    parentReportAction={parentReportAction}
                    onBackButtonPress={() => {
                        if (!backToRoute) {
                            goBackFromSearchMoneyRequest();
                            return;
                        }
                        Navigation.goBack(backToRoute);
                    }}
                />
            ) : (
                <MoneyReportHeader
                    report={report}
                    policy={policy}
                    reportActions={reportActions}
                    transactionThreadReportID={transactionThreadReportID}
                    isLoadingInitialReportActions={isLoadingInitialReportActions}
                    shouldDisplayBackButton
                    onBackButtonPress={() => {
                        if (!backToRoute) {
                            goBackFromSearchMoneyRequest();
                            return;
                        }
                        Navigation.goBack(backToRoute);
                    }}
                />
            ),
        [backToRoute, isLoadingInitialReportActions, isTransactionThreadView, parentReportAction, policy, report, reportActions, transactionThreadReportID],
    );

    // We need to cancel telemetry span when user leaves the screen before full report data is loaded
    useEffect(() => {
        return () => {
            cancelSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`);
        };
    }, [reportID]);

    if (!!(isLoadingInitialReportActions && reportActions.length === 0 && !isOffline) || shouldWaitForTransactions) {
        return <InitialLoadingSkeleton styles={styles} />;
    }

    if (reportActions.length === 0) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

    if (!report) {
        return;
    }

    if (isLoadingApp) {
        return (
            <View style={styles.flex1}>
                <ReportHeaderSkeletonView />
                <ReportActionsSkeletonView />
                {shouldDisplayReportFooter ? (
                    <ReportFooter
                        report={report}
                        reportMetadata={reportMetadata}
                        policy={policy}
                        pendingAction={reportPendingAction}
                        isComposerFullSize={!!isComposerFullSize}
                        lastReportAction={lastReportAction}
                        // If the report is from the 'Send Money' flow, we add the comment to the `iou` report because for these we don't combine reportActions even if there is a single transaction (they always have a single transaction)
                        transactionThreadReportID={isSentMoneyReport ? undefined : transactionThreadReportID}
                    />
                ) : null}
            </View>
        );
    }

    return (
        <View style={styles.flex1}>
            <OfflineWithFeedback
                pendingAction={reportPendingAction ?? report?.pendingFields?.reimbursed}
                errors={reportErrors}
                needsOffscreenAlphaCompositing
                shouldShowErrorMessages={false}
            >
                {reportHeaderView}
            </OfflineWithFeedback>
            <OfflineWithFeedback
                pendingAction={reportPendingAction}
                errors={reportErrors}
                onClose={dismissReportCreationError}
                needsOffscreenAlphaCompositing
                style={styles.flex1}
                contentContainerStyle={styles.flex1}
                errorRowStyles={[styles.ph5, styles.mv2]}
            >
                <View style={[styles.flex1, styles.flexRow]}>
                    {shouldShowWideRHPReceipt && (
                        <Animated.View style={styles.wideRHPMoneyRequestReceiptViewContainer}>
                            <ScrollView contentContainerStyle={styles.wideRHPMoneyRequestReceiptViewScrollViewContainer}>
                                <MoneyRequestReceiptView
                                    allReports={allReports}
                                    report={transactionThreadReport}
                                    fillSpace
                                    isDisplayedInWideRHP
                                />
                            </ScrollView>
                        </Animated.View>
                    )}
                    <View style={[styles.overflowHidden, styles.justifyContentEnd, styles.flex1]}>
                        {shouldDisplayMoneyRequestActionsList ? (
                            <MoneyRequestReportActionsList
                                report={report}
                                policy={policy}
                                transactions={visibleTransactions}
                                hasPendingDeletionTransaction={hasPendingDeletionTransaction}
                                newTransactions={newTransactions}
                                reportActions={reportActions}
                                violations={allReportViolations}
                                hasOlderActions={hasOlderActions}
                                hasNewerActions={hasNewerActions}
                                showReportActionsLoadingState={isLoadingInitialReportActions && !reportMetadata?.hasOnceLoadedReportActions}
                                reportPendingAction={reportPendingAction}
                            />
                        ) : (
                            <ReportActionsView
                                report={report}
                                reportActions={reportActions}
                                isLoadingInitialReportActions={reportMetadata?.isLoadingInitialReportActions}
                                hasNewerActions={hasNewerActions}
                                hasOlderActions={hasOlderActions}
                                parentReportAction={parentReportAction}
                                transactionThreadReportID={transactionThreadReportID}
                            />
                        )}
                        {shouldDisplayReportFooter ? (
                            <>
                                <ReportFooter
                                    report={report}
                                    reportMetadata={reportMetadata}
                                    policy={policy}
                                    pendingAction={reportPendingAction}
                                    isComposerFullSize={!!isComposerFullSize}
                                    lastReportAction={lastReportAction}
                                    reportTransactions={transactions}
                                    // If the report is from the 'Send Money' flow, we add the comment to the `iou` report because for these we don't combine reportActions even if there is a single transaction (they always have a single transaction)
                                    transactionThreadReportID={isSentMoneyReport ? undefined : transactionThreadReportID}
                                />
                                <PortalHost name="suggestions" />
                            </>
                        ) : null}
                    </View>
                </View>
            </OfflineWithFeedback>
        </View>
    );
}

export default MoneyRequestReportView;
