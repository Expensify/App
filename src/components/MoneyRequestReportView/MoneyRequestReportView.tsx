import {PortalHost} from '@gorhom/portal';
import React, {useCallback, useMemo} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import HeaderGap from '@components/HeaderGap';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import useNetwork from '@hooks/useNetwork';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {removeFailedReport} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import {selectAllTransactionsForReport, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditReportAction, getReportOfflinePendingActionAndErrors, isReportTransactionThread} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import ReportActionsView from '@pages/home/report/ReportActionsView';
import ReportFooter from '@pages/home/report/ReportFooter';
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

function getParentReportAction(parentReportActions: OnyxEntry<OnyxTypes.ReportActions>, parentReportActionID: string | undefined): OnyxEntry<OnyxTypes.ReportAction> {
    if (!parentReportActions || !parentReportActionID) {
        return;
    }
    return parentReportActions[parentReportActionID];
}

function MoneyRequestReportView({report, policy, reportMetadata, shouldDisplayReportFooter, backToRoute}: MoneyRequestReportViewProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const reportID = report?.reportID;
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [isComposerFullSize] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`, {initialValue: false, canBeMissing: true});
    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`, {canBeMissing: true});

    const {reportActions: unfilteredReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (allTransactions: OnyxCollection<OnyxTypes.Transaction>) => selectAllTransactionsForReport(allTransactions, reportID, reportActions),
        canBeMissing: true,
    });

    const reportTransactionIDs = transactions?.map((transaction) => transaction.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);

    const prevTransactions = usePrevious(transactions);

    const newTransactions = useMemo(() => {
        if (!prevTransactions || !transactions || transactions.length <= prevTransactions.length) {
            return CONST.EMPTY_ARRAY as unknown as OnyxTypes.Transaction[];
        }
        return transactions.filter((transaction) => !prevTransactions?.some((prevTransaction) => prevTransaction.transactionID === transaction.transactionID));
        // Depending only on transactions is enough because prevTransactions is a helper object.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions]);

    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {
        canEvict: false,
        canBeMissing: true,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, report?.parentReportActionID),
    });

    const lastReportAction = [...reportActions, parentReportAction].find((action) => canEditReportAction(action) && !isMoneyRequestAction(action));
    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;

    const dismissReportCreationError = useCallback(() => {
        goBackFromSearchMoneyRequest();
        InteractionManager.runAfterInteractions(() => removeFailedReport(reportID));
    }, [reportID]);

    // Special case handling a report that is a transaction thread
    // If true we will use standard `ReportActionsView` to display report data and a special header, anything else is handled via `MoneyRequestReportActionsList`
    const isTransactionThreadView = isReportTransactionThread(report);

    // Prevent the empty state flash by ensuring transaction data is fully loaded before deciding which view to render
    // We need to wait for both the selector to finish AND ensure we're not in a loading state where transactions could still populate
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, transactions, reportMetadata);

    const isEmptyTransactionReport = transactions && transactions.length === 0 && transactionThreadReportID === undefined;
    const shouldDisplayMoneyRequestActionsList = !!isEmptyTransactionReport || shouldDisplayReportTableView(report, transactions ?? []);

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
                <HeaderGap />
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
                    />
                ) : null}
            </View>
        );
    }

    return (
        <View style={styles.flex1}>
            <OfflineWithFeedback
                pendingAction={reportPendingAction}
                errors={reportErrors}
                onClose={dismissReportCreationError}
                needsOffscreenAlphaCompositing
                style={styles.flex1}
                contentContainerStyle={styles.flex1}
                errorRowStyles={[styles.ph5, styles.mv2]}
            >
                <HeaderGap />
                {reportHeaderView}
                <View style={[styles.overflowHidden, styles.flex1]}>
                    {shouldDisplayMoneyRequestActionsList ? (
                        <MoneyRequestReportActionsList
                            report={report}
                            policy={policy}
                            transactions={transactions}
                            newTransactions={newTransactions}
                            reportActions={reportActions}
                            hasOlderActions={hasOlderActions}
                            hasNewerActions={hasNewerActions}
                            showReportActionsLoadingState={isLoadingInitialReportActions && !reportMetadata?.hasOnceLoadedReportActions}
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
                            />
                            <PortalHost name="suggestions" />
                        </>
                    ) : null}
                </View>
            </OfflineWithFeedback>
        </View>
    );
}

MoneyRequestReportView.displayName = 'MoneyRequestReportView';

export default MoneyRequestReportView;
