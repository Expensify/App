import {PortalHost} from '@gorhom/portal';
import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {FlatList} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import MoneyRequestReportView from '@components/MoneyRequestReportView/MoneyRequestReportView';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import useShowSuperWideRHPVersion from '@components/WideRHPContextProvider/useShowSuperWideRHPVersion';
import WideRHPOverlayWrapper from '@components/WideRHPOverlayWrapper';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
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
import {isValidReportIDFromPath} from '@libs/ReportUtils';
import {isDefaultAvatar, isLetterAvatar, isPresetAvatar} from '@libs/UserAvatarUtils';
import Navigation from '@navigation/Navigation';
import ReactionListWrapper from '@pages/home/ReactionListWrapper';
import {createTransactionThreadReport, openReport, updateLastVisitTime} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ActionListContextType, ScrollPosition} from '@src/pages/home/ReportScreenContext';
import {ActionListContext} from '@src/pages/home/ReportScreenContext';
import SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, Policy, Transaction, TransactionViolations} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

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
};

function SearchMoneyRequestReportPage({route}: SearchMoneyRequestPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const {state} = useSearchContext();
    const {currentSearchResults: snapshot} = state;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, {allowStaleData: true, canBeMissing: true});

    const isFocused = useIsFocused();

    useEffect(() => {
        // Update last visit time when the expense super wide RHP report is focused
        if (!reportIDFromRoute || !isFocused || route.name !== SCREENS.RIGHT_MODAL.EXPENSE_REPORT) {
            return;
        }

        updateLastVisitTime(reportIDFromRoute);
    }, [reportIDFromRoute, isFocused, route.name]);

    const snapshotReport = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`] ?? {}) as typeof report;
    }, [snapshot, reportIDFromRoute]);

    // Use snapshot report currency if main collection doesn't have it (for offline mode)
    const reportToUse = useMemo(() => {
        if (!report) {
            return report;
        }
        return {...report, currency: report.currency ?? snapshotReport?.currency};
    }, [report, snapshotReport?.currency]);

    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {canBeMissing: true, allowStaleData: true});
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, canBeMissing: false});
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const isReportArchived = useReportIsArchived(report?.reportID);

    const {isEditingDisabled, isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({});
    const flatListRef = useRef<FlatList>(null);
    const actionListValue = useMemo((): ActionListContextType => ({flatListRef, scrollPosition, setScrollPosition}), [flatListRef, scrollPosition, setScrollPosition]);

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});
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
    const doesReportIDLookValid = isValidReportIDFromPath(reportID);
    const ownerAccountID = report?.ownerAccountID;
    const ownerPersonalDetailsSelector = useCallback(
        (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
            if (!ownerAccountID) {
                return undefined;
            }

            return personalDetailsList?.[ownerAccountID];
        },
        [ownerAccountID],
    );
    const [ownerPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: ownerPersonalDetailsSelector, canBeMissing: true}, [ownerAccountID]);
    const doesOwnerHavePersonalDetails = !!ownerPersonalDetails;
    const doesOwnerHaveAvatar = !!ownerPersonalDetails?.avatar;
    const doesOwnerHaveDefaultAvatar =
        isDefaultAvatar(ownerPersonalDetails?.avatar) || isPresetAvatar(ownerPersonalDetails?.avatar) || isLetterAvatar(ownerPersonalDetails?.originalFileName);

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

    useEffect(() => {
        if (transactionThreadReportID === CONST.FAKE_REPORT_ID && oneTransactionID) {
            const iouAction = getIOUActionForTransactionID(reportActions, oneTransactionID);
            createTransactionThreadReport(report, iouAction);
            return;
        }

        openReport(reportIDFromRoute, '', [], undefined, undefined, false, [], undefined);
        // We don't want this hook to re-run on the every report change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportIDFromRoute, transactionThreadReportID]);

    useEffect(() => {
        hasCreatedLegacyThreadRef.current = false;
    }, [reportIDFromRoute]);

    // Create transaction thread for legacy transactions that don't have one yet.
    // Wait for all data to load to avoid duplicates or stale data when navigating between reports.
    useEffect(() => {
        if (hasCreatedLegacyThreadRef.current || transactionThreadReportID || (Object.keys(allReportTransactions).length !== 1 && !snapshotTransaction)) {
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
        createTransactionThreadReport(report, undefined, transaction, violations);
    }, [
        allReportTransactions,
        allReportViolations,
        report,
        reportActions,
        reportIDFromRoute,
        reportMetadata?.isLoadingInitialReportActions,
        snapshot,
        snapshotTransaction,
        snapshotViolations,
        transactionThreadReportID,
        visibleTransactions,
    ]);

    const shouldShowAccessErrorPage = useMemo(
        (): boolean => {
            if (isLoadingApp !== false) {
                return false;
            }

            if (!reportID && !reportMetadata?.isLoadingInitialReportActions) {
                return true;
            }

            return !!reportID && !doesReportIDLookValid;
        },

        // isLoadingApp intentionally omitted to avoid re-computing after initial load completes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [reportID, reportMetadata?.isLoadingInitialReportActions, doesReportIDLookValid],
    );
    const prevShouldShowAccessErrorPage = usePrevious(shouldShowAccessErrorPage);
    const participantCount = Object.keys(report?.participants ?? {}).length;

    useEffect(() => {
        if (!shouldShowAccessErrorPage || prevShouldShowAccessErrorPage) {
            return;
        }

        Log.info('[SearchMoneyRequestReportPage] shouldShowAccessErrorPage changed to true', false, {
            reportIDFromRoute,
            reportID,
            doesReportIDLookValid,
            isLoadingApp,
            isLoadingInitialReportActions: reportMetadata?.isLoadingInitialReportActions,
            ownerAccountID,
            doesOwnerHavePersonalDetails,
            doesOwnerHaveAvatar,
            doesOwnerHaveDefaultAvatar,
            participantCount,
        });
    }, [
        doesOwnerHaveAvatar,
        doesOwnerHaveDefaultAvatar,
        doesOwnerHavePersonalDetails,
        doesReportIDLookValid,
        isLoadingApp,
        ownerAccountID,
        participantCount,
        prevShouldShowAccessErrorPage,
        reportID,
        reportIDFromRoute,
        reportMetadata?.isLoadingInitialReportActions,
        shouldShowAccessErrorPage,
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
                                    report={reportToUse}
                                    reportMetadata={reportMetadata}
                                    policy={policy}
                                    shouldDisplayReportFooter={isCurrentReportLoadedFromOnyx}
                                    key={report?.reportID}
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
