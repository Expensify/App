import {PortalHost} from '@gorhom/portal';
import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import MoneyRequestReportView from '@components/MoneyRequestReportView/MoneyRequestReportView';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchStateContext} from '@components/Search/SearchContext';
import useShowSuperWideRHPVersion from '@components/WideRHPContextProvider/useShowSuperWideRHPVersion';
import WideRHPOverlayWrapper from '@components/WideRHPOverlayWrapper';
import useActionListContextValue from '@hooks/useActionListContextValue';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubmitToDestinationVisible from '@hooks/useSubmitToDestinationVisible';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {
    getFilteredReportActionsForReportView,
    getIOUActionForTransactionID,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getReportAction,
    isMoneyRequestAction,
} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {isMoneyRequestReport, isMoneyRequestReportPendingDeletion, isValidReportIDFromPath} from '@libs/ReportUtils';
import {cancelSpansByPrefix} from '@libs/telemetry/activeSpans';
import {doesDeleteNavigateBackUrlIncludeDuplicatesReview, getParentReportActionDeletionStatus, hasLoadedReportActions, isThreadReportDeleted} from '@libs/TransactionNavigationUtils';
import Navigation from '@navigation/Navigation';
import ReactionListWrapper from '@pages/inbox/ReactionListWrapper';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import {clearDeleteTransactionNavigateBackUrl, createTransactionThreadReport, openReport, updateLastVisitTime} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {reportByIDsSelector} from '@src/selectors/Attributes';
import type {ReportAttributesDerivedValue, Transaction, TransactionViolations} from '@src/types/onyx';

type SearchMoneyRequestPageProps =
    | PlatformStackScreenProps<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
    | PlatformStackScreenProps<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT>;

const defaultReportMetadata = {
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
    hasOnceLoadedReportActions: false,
};

function SearchMoneyRequestReportPage({route}: SearchMoneyRequestPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const {currentSearchResults: snapshot} = useSearchStateContext();

    const firstRenderRef = useRef(true);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);

    const parentReportAction = useParentReportAction(report);

    const handleSubmitToDestinationVisibleLayout = useSubmitToDestinationVisible(
        [CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY],
        reportIDFromRoute,
        CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER.LAYOUT,
    );

    const [parentReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.parentReportID}`);
    const prevReport = usePrevious(report);
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isFocused = useIsFocused();

    // Dismiss modal when the money request report is removed (e.g. deleted or merged).
    useEffect(() => {
        // Skip first run so we don't dismiss on mount when report may still be loading.
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }

        // Report is gone now but we had a money request report before → it was removed.
        const isRemovalExpectedForReportType = !report && isMoneyRequestReport(prevReport);

        if (isRemovalExpectedForReportType) {
            if (!isFocused) {
                return;
            }
            Navigation.dismissModal();
        }
    }, [report, isFocused, prevReport]);

    useEffect(() => {
        // Update last visit time when the expense super wide RHP report is focused
        if (!reportIDFromRoute || !isFocused || route.name !== SCREENS.RIGHT_MODAL.EXPENSE_REPORT) {
            return;
        }

        updateLastVisitTime(reportIDFromRoute);
    }, [reportIDFromRoute, isFocused, route.name]);

    useEffect(() => {
        if (isFocused || !deleteTransactionNavigateBackUrl) {
            return;
        }
        if (doesDeleteNavigateBackUrlIncludeDuplicatesReview(deleteTransactionNavigateBackUrl)) {
            return;
        }
        // Clear the URL only after we navigate away to avoid a brief Not Found flash.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                clearDeleteTransactionNavigateBackUrl();
            });
        });
    }, [isFocused, deleteTransactionNavigateBackUrl]);

    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const isReportArchived = useReportIsArchived(report?.reportID);

    const {isEditingDisabled, isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

    const actionListValue = useActionListContextValue();

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(reportIDFromRoute);
    const {transactions: allReportTransactions, violations: allReportViolations} = useTransactionsAndViolationsForReport(reportIDFromRoute);
    const reportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);
    const reportTransactions = useMemo(() => getAllNonDeletedTransactions(allReportTransactions, reportActions), [allReportTransactions, reportActions]);
    const visibleTransactions = useMemo(
        () => reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
        [reportTransactions, isOffline],
    );
    const reportTransactionIDs = useMemo(() => visibleTransactions?.map((transaction) => transaction.transactionID), [visibleTransactions]);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const oneTransactionID = reportTransactions.at(0)?.transactionID;

    const reportID = report?.reportID;

    const reportAttributesSelector = useCallback((attributes: OnyxEntry<ReportAttributesDerivedValue>) => reportByIDsSelector(reportID ? [reportID] : [])(attributes), [reportID]);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportAttributesSelector});
    useDocumentTitle(getReportName(report, reportAttributes));

    const doesReportIDLookValid = isValidReportIDFromPath(reportID);
    const hasLoadedReportActionsForAccessError = hasLoadedReportActions(reportMetadata, isOffline);
    const isReportPendingDeletion = isMoneyRequestReportPendingDeletion(report);
    const isThreadReportDeletedForReview = isThreadReportDeleted(report, reportMetadata, isOffline);
    const {wasParentActionDeleted} = getParentReportActionDeletionStatus({
        parentReportID: report?.parentReportID,
        parentReportActionID: report?.parentReportActionID,
        parentReportAction,
        parentReportMetadata,
        isOffline,
    });

    // Prevents creating duplicate transaction threads for legacy transactions
    const hasCreatedLegacyThreadRef = useRef(false);

    // Get transaction from search snapshot if not available in main collections
    const {snapshotTransaction, snapshotViolations} = useMemo(() => {
        if (!snapshot?.data || Object.keys(allReportTransactions).length > 0) {
            return {snapshotTransaction: undefined, snapshotViolations: undefined};
        }

        const transactionKey = Object.keys(snapshot.data).find((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION));
        if (!transactionKey) {
            return {snapshotTransaction: undefined, snapshotViolations: undefined};
        }

        const snapshotData = snapshot.data as Record<string, unknown>;
        const transaction = snapshotData[transactionKey] as Transaction;
        const violationKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`;
        const violations = snapshotData[violationKey] as TransactionViolations | undefined;

        return {snapshotTransaction: transaction, snapshotViolations: violations};
    }, [snapshot?.data, allReportTransactions]);

    // If there is more than one transaction, display the report in Super Wide RHP, otherwise it will be shown in Wide RHP
    const shouldShowSuperWideRHP = visibleTransactions.length > 1;

    useShowSuperWideRHPVersion(shouldShowSuperWideRHP);

    // Tracks initial mount to ensure openReport is called once for multi-transaction reports
    const isInitialMountRef = useRef(true);
    const prevReportIDFromRoute = usePrevious(reportIDFromRoute);

    useEffect(() => {
        // Reset flag when reportID changes (screen stays mounted but navigates to different report)
        if (prevReportIDFromRoute !== reportIDFromRoute) {
            isInitialMountRef.current = true;
        }

        // Guard prevents calling openReport for multi-transaction reports
        if (visibleTransactions.length > 2 && !isInitialMountRef.current) {
            return;
        }

        if (transactionThreadReportID === CONST.FAKE_REPORT_ID && oneTransactionID) {
            const iouAction = getIOUActionForTransactionID(reportActions, oneTransactionID);
            createTransactionThreadReport(introSelected, currentUserEmail ?? '', currentUserAccountID, betas, report, iouAction);
            return;
        }

        openReport({reportID: reportIDFromRoute, introSelected, betas});
        isInitialMountRef.current = false;

        // oneTransactionID dependency handles the case when deleting a transaction:
        // oneTransactionID updates after transactionThreadReportID,
        // so we need it in dependencies to re-run the effect with the correct remaining transaction.
        // For more details see https://github.com/Expensify/App/pull/80107
        // We don't want this hook to re-run on the every report change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportIDFromRoute, transactionThreadReportID, oneTransactionID, betas]);

    useEffect(() => {
        hasCreatedLegacyThreadRef.current = false;

        return () => {
            // Cancel any pending send-message spans to prevent orphaned spans when navigating away
            cancelSpansByPrefix(CONST.TELEMETRY.SPAN_SEND_MESSAGE);
        };
    }, [reportIDFromRoute]);

    // Create transaction thread for legacy transactions that don't have one yet.
    // Wait for all data to load to avoid duplicates or stale data when navigating between reports.
    useEffect(() => {
        if (
            hasCreatedLegacyThreadRef.current ||
            transactionThreadReportID ||
            (Object.keys(allReportTransactions).length !== 1 && !snapshotTransaction) ||
            !reportMetadata?.hasOnceLoadedReportActions ||
            reportActions.length === 0
        ) {
            return;
        }

        // Because when switching between reports, reportActions may contain data from the previous report.
        // So we need to check that reportActions belongs to the current report.
        const isFirstActionBelongsToCurrentReport = !!getReportAction(reportIDFromRoute, reportActions.at(0)?.reportActionID);
        if (report?.reportID && reportActions.length === 1 && !isFirstActionBelongsToCurrentReport) {
            return;
        }

        // Use main collection transaction or fallback to snapshot
        const transaction = Object.values(allReportTransactions).at(0) ?? snapshotTransaction;
        if (!transaction || (transaction && transaction.reportID !== reportIDFromRoute)) {
            return;
        }

        // Check that reportActions belong to the current report to avoid using stale data from the previous report
        const hasMatchingReportActions = reportActions.some((action) => {
            const iouReportID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUReportID : undefined;
            return iouReportID?.toString() === reportIDFromRoute;
        });

        if (!hasMatchingReportActions && reportActions.length > 1) {
            return;
        }

        const iouAction = getIOUActionForTransactionID(reportActions, transaction.transactionID);
        if (iouAction || transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || !!transaction.linkedTrackedExpenseReportAction?.childReportID) {
            return;
        }

        hasCreatedLegacyThreadRef.current = true;

        const violations = allReportViolations[transaction.transactionID] ?? snapshotViolations;
        createTransactionThreadReport(introSelected, currentUserEmail ?? '', currentUserAccountID, betas, report, undefined, transaction, violations);
    }, [
        allReportTransactions,
        allReportViolations,
        introSelected,
        currentUserEmail,
        currentUserAccountID,
        betas,
        report,
        reportActions,
        reportIDFromRoute,
        reportMetadata?.hasOnceLoadedReportActions,
        reportMetadata?.isLoadingInitialReportActions,
        snapshot,
        snapshotTransaction,
        snapshotViolations,
        transactionThreadReportID,
        visibleTransactions,
    ]);

    const shouldUseSnapshotTransaction = reportTransactions.length === 0 && !!snapshotTransaction;
    const activeTransactionsCount = useMemo(() => {
        if (shouldUseSnapshotTransaction) {
            return snapshotTransaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? 0 : 1;
        }
        return reportTransactions.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
    }, [reportTransactions, shouldUseSnapshotTransaction, snapshotTransaction?.pendingAction]);
    const hasAnyTransactions = reportTransactions.length > 0 || shouldUseSnapshotTransaction;
    const wereAllTransactionsDeleted = useMemo(() => hasAnyTransactions && activeTransactionsCount === 0, [hasAnyTransactions, activeTransactionsCount]);

    const shouldShowAccessErrorPage = useMemo((): boolean => {
        if (isLoadingApp !== false) {
            return false;
        }

        if (deleteTransactionNavigateBackUrl) {
            return false;
        }

        if (!!reportID && !doesReportIDLookValid) {
            return true;
        }

        if (isReportPendingDeletion || wereAllTransactionsDeleted || wasParentActionDeleted || isThreadReportDeletedForReview) {
            return true;
        }

        return !reportID && hasLoadedReportActionsForAccessError && !hasAnyTransactions;

        // isLoadingApp intentionally omitted to avoid re-computing after initial load completes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        reportID,
        hasLoadedReportActionsForAccessError,
        doesReportIDLookValid,
        isReportPendingDeletion,
        wereAllTransactionsDeleted,
        hasAnyTransactions,
        deleteTransactionNavigateBackUrl,
        wasParentActionDeleted,
        isThreadReportDeletedForReview,
    ]);

    useEffect(() => {
        if (!shouldShowAccessErrorPage) {
            return;
        }

        Log.info('[SearchMoneyRequestReportPage] Displaying NotFound Page', false, {
            reportID,
            hasLoadedReportActionsForAccessError,
            doesReportIDLookValid,
            isReportPendingDeletion,
            wereAllTransactionsDeleted,
            hasAnyTransactions,
            deleteTransactionNavigateBackUrl,
            wasParentActionDeleted,
            isThreadReportDeletedForReview,
            shouldUseSnapshotTransaction,
        });
    }, [
        shouldShowAccessErrorPage,
        reportID,
        hasLoadedReportActionsForAccessError,
        doesReportIDLookValid,
        isReportPendingDeletion,
        wereAllTransactionsDeleted,
        hasAnyTransactions,
        deleteTransactionNavigateBackUrl,
        wasParentActionDeleted,
        isThreadReportDeletedForReview,
        shouldUseSnapshotTransaction,
    ]);

    return (
        <WideRHPOverlayWrapper>
            <ActionListContext.Provider value={actionListValue}>
                <ReactionListWrapper>
                    <ScreenWrapper
                        testID="SearchMoneyRequestReportPage"
                        shouldEnableMaxHeight
                        offlineIndicatorStyle={styles.mtAuto}
                    >
                        <FullPageNotFoundView
                            shouldShow={shouldShowAccessErrorPage}
                            subtitleKey="notFound.noAccess"
                            subtitleStyle={[styles.textSupporting]}
                            shouldDisplaySearchRouter
                            shouldShowBackButton={shouldUseNarrowLayout}
                            onBackButtonPress={Navigation.goBack}
                        >
                            <DragAndDropProvider isDisabled={isEditingDisabled}>
                                <MoneyRequestReportView
                                    report={report}
                                    reportMetadata={reportMetadata}
                                    shouldDisplayReportFooter={isCurrentReportLoadedFromOnyx}
                                    key={report?.reportID}
                                    onLayout={handleSubmitToDestinationVisibleLayout}
                                    backToRoute={route.params.backTo}
                                />
                                <PortalHost name="suggestions" />
                            </DragAndDropProvider>
                        </FullPageNotFoundView>
                    </ScreenWrapper>
                </ReactionListWrapper>
            </ActionListContext.Provider>
        </WideRHPOverlayWrapper>
    );
}

export default SearchMoneyRequestReportPage;
