import {PortalHost} from '@gorhom/portal';
import React, {useCallback, useMemo} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import HeaderGap from '@components/HeaderGap';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useNetwork from '@hooks/useNetwork';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useThemeStyles from '@hooks/useThemeStyles';
import {removeFailedReport} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import {selectAllTransactionsForReport, shouldDisplayReportTableView} from '@libs/MoneyRequestReportUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import {getOneTransactionThreadReportID, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditReportAction, getReportOfflinePendingActionAndErrors, isReportTransactionThread} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import ReportActionsView from '@pages/home/report/ReportActionsView';
import ReportFooter from '@pages/home/report/ReportFooter';
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

function goBackFromSearchMoneyRequest(policyID: string | undefined) {
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

    const query = buildCannedSearchQuery({policyID});
    Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query}));
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
    const {activeWorkspaceID} = useActiveWorkspace();

    const reportID = report?.reportID;
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [isComposerFullSize] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`, {initialValue: false, canBeMissing: true});
    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);

    const {reportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID);
    const transactionThreadReportID = getOneTransactionThreadReportID(reportID, reportActions ?? [], isOffline);

    const [transactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (allTransactions): OnyxTypes.Transaction[] => selectAllTransactionsForReport(allTransactions, reportID, reportActions),
        canBeMissing: true,
    });

    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {
        canEvict: false,
        canBeMissing: true,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, report?.parentReportActionID),
    });

    const lastReportAction = [...reportActions, parentReportAction].find((action) => canEditReportAction(action) && !isMoneyRequestAction(action));
    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;

    const dismissReportCreationError = useCallback(() => {
        goBackFromSearchMoneyRequest(activeWorkspaceID);
        InteractionManager.runAfterInteractions(() => removeFailedReport(reportID));
    }, [activeWorkspaceID, reportID]);

    // Special case handling a report that is a transaction thread
    // If true we will use standard `ReportActionsView` to display report data and a special header, anything else is handled via `MoneyRequestReportActionsList`
    const isTransactionThreadView = isReportTransactionThread(report);
    const shouldDisplayMoneyRequestActionsList = shouldDisplayReportTableView(report, transactions);

    const reportHeaderView = useMemo(
        () =>
            isTransactionThreadView ? (
                <MoneyRequestHeader
                    report={report}
                    policy={policy}
                    parentReportAction={parentReportAction}
                    onBackButtonPress={() => {
                        if (!backToRoute) {
                            goBackFromSearchMoneyRequest(activeWorkspaceID);
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
                    shouldDisplayBackButton
                    onBackButtonPress={() => {
                        if (!backToRoute) {
                            goBackFromSearchMoneyRequest(activeWorkspaceID);
                            return;
                        }
                        Navigation.goBack(backToRoute);
                    }}
                />
            ),
        [activeWorkspaceID, backToRoute, isTransactionThreadView, parentReportAction, policy, report, reportActions, transactionThreadReportID],
    );

    if (isLoadingInitialReportActions && reportActions.length === 0 && !isOffline) {
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
                            reportActions={reportActions}
                            hasOlderActions={hasOlderActions}
                            hasNewerActions={hasNewerActions}
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
