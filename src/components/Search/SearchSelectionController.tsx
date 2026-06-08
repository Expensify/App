import {useIsFocused} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import {useEffect} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelfDMReport from '@hooks/useSelfDMReport';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {canEditFieldOfMoneyRequest, canHoldUnholdReportAction, canRejectReportAction, isOneTransactionReport} from '@libs/ReportUtils';
import {getOriginalTransactionWithSplitInfo, hasValidModifiedAmount, isOnHold} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OutstandingReportsByPolicyIDDerivedValue, Report, SearchResults, Transaction} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {useSearchRowSelectionActions, useSearchSelectionContext} from './SearchContext';
import {useSyncSelectedReports} from './SearchSelectionProvider';
import {mapEmptyReportToSelectedEntry} from './selectionBuilders';
import type {SearchData, SelectedTransactions} from './types';

type SearchSelectionControllerProps = {
    /** The currently displayed (filtered, grouped) rows. Screen-derived; the controller cannot recompute it. */
    filteredData: SearchData;

    /** Number of selectable items currently in view, used by the provider's select-all coordination. */
    totalSelectableItemsCount: number;

    /** The raw search snapshot, read for denormalized transaction/report lookups during reconcile. */
    searchResults: SearchResults | undefined;

    /** The live TRANSACTION collection. Subscribed by `<Search>` (it needs it for its own rendering) and passed down. */
    transactions: OnyxCollection<Transaction>;

    /** Whether mobile selection mode is on. */
    isMobileSelectionModeEnabled: boolean;

    /** The search data type. */
    type: SearchDataTypes;

    /** Whether rows are grouped (group-by view or expense-report view). */
    areItemsGrouped: boolean;

    /** Whether this is the expense-report view (drives report-level selection propagation). */
    isExpenseReportType: boolean;

    /** Whether the current search produced no results. */
    isSearchResultsEmpty: boolean;
};

type ReconcileSelectionParams = {
    isFocused: boolean;
    type: SearchDataTypes;
    areItemsGrouped: boolean;
    isExpenseReportType: boolean;
    filteredData: SearchData;
    searchResultsData: SearchResults['data'] | undefined;
    transactions: OnyxCollection<Transaction>;
    currentUserEmail: string;
    currentUserLogin: string;
    currentUserAccountID: number;
    selfDMReport: OnyxEntry<Report>;
    isProduction: boolean;
    outstandingReportsByPolicyID: OutstandingReportsByPolicyIDDerivedValue | undefined;
};

/**
 * Rebuilds `selectedTransactions` whenever the underlying data changes (e.g. an Onyx push adds rows to a
 * selected report) so the selection stays in sync with what is on screen, then atomically commits it via
 * `reconcileSelection`. Ported verbatim from the former `<Search>` refresh-selection effect: it reads
 * `selectedTransactions` from closure (not deps) on purpose so it only re-runs on data/focus/select-all
 * changes, and keeps the deep-equality bail-out that prevents the #89588 infinite-update loop.
 */
function useReconcileSelectionWithData({
    isFocused,
    type,
    areItemsGrouped,
    isExpenseReportType,
    filteredData,
    searchResultsData,
    transactions,
    currentUserEmail,
    currentUserLogin,
    currentUserAccountID,
    selfDMReport,
    isProduction,
    outstandingReportsByPolicyID,
}: ReconcileSelectionParams) {
    const {selectedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {reconcileSelection} = useSearchRowSelectionActions();

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
            return;
        }
        const newTransactionList: SelectedTransactions = {};
        if (areItemsGrouped) {
            for (const transactionGroup of filteredData) {
                if (!Object.hasOwn(transactionGroup, 'transactions') || !('transactions' in transactionGroup)) {
                    continue;
                }

                if (transactionGroup.transactions.length === 0) {
                    const reportKey = transactionGroup.keyForList;
                    if (transactionGroup.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                        continue;
                    }
                    if (reportKey && (reportKey in selectedTransactions || areAllMatchingItemsSelected)) {
                        const [, emptyReportSelection] = mapEmptyReportToSelectedEntry(transactionGroup);
                        newTransactionList[reportKey] = {
                            ...emptyReportSelection,
                            isSelected: areAllMatchingItemsSelected || selectedTransactions[reportKey]?.isSelected,
                        };
                    }
                    continue;
                }

                // For expense reports: when ANY transaction is selected, we want ALL transactions in the report selected.
                // This ensures report-level selection persists when new transactions are added.
                // Also check if the report itself was selected (when it was empty) by checking the reportID key
                const reportKey = transactionGroup.keyForList;
                const wasReportSelected = !!(reportKey && reportKey in selectedTransactions);
                const hasIndividualSelectedInGroup = transactionGroup.transactions.some(
                    (transaction) => (!!transaction.keyForList && transaction.keyForList in selectedTransactions) || transaction.transactionID in selectedTransactions,
                );
                const propagateSelectionToAllRows = (isExpenseReportType && (wasReportSelected || hasIndividualSelectedInGroup)) || (wasReportSelected && !isExpenseReportType);

                for (const transactionItem of transactionGroup.transactions) {
                    const listKey = transactionItem.keyForList ?? transactionItem.transactionID;
                    const isSelected = listKey in selectedTransactions || transactionItem.transactionID in selectedTransactions;

                    // Include transaction if: already individually selected, part of select-all, or group-level propagation (expense report / empty group expanded)
                    const shouldInclude = isSelected || areAllMatchingItemsSelected || propagateSelectionToAllRows;
                    if (!shouldInclude) {
                        continue;
                    }

                    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(
                        transactionItem.report,
                        transactionItem.reportAction,
                        transactionItem.holdReportAction,
                        transactionItem,
                        transactionItem.policy,
                        currentUserAccountID,
                    );
                    const canRejectRequest = currentUserEmail && transactionItem.report ? canRejectReportAction(currentUserEmail, transactionItem.report) : false;

                    const itemTransaction = (searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] ??
                        transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`]) as OnyxEntry<Transaction>;
                    const originalItemTransaction =
                        searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`] ??
                        transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                    const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                    const isItemUnreported = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
                    const reportForSplit = transactionItem.report ?? (isItemUnreported ? selfDMReport : undefined);

                    const previousSelection = selectedTransactions[listKey] ?? selectedTransactions[transactionItem.transactionID];

                    newTransactionList[listKey] = {
                        transaction: transactionItem,
                        action: transactionItem.action,
                        canHold: canHoldRequest,
                        isHeld: isOnHold(transactionItem),
                        canUnhold: canUnholdRequest,
                        canSplit: isSplitAction(
                            reportForSplit,
                            [itemTransaction],
                            originalItemTransaction,
                            currentUserLogin,
                            currentUserAccountID,
                            transactionItem.policy,
                            itemParentReport,
                            isProduction,
                        ),
                        hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
                        canChangeReport: canEditFieldOfMoneyRequest({
                            reportAction: transactionItem.reportAction,
                            fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                            outstandingReportsByPolicyID,
                            transaction: transactionItem,
                            report: transactionItem.report,
                            policy: transactionItem.policy,
                        }),

                        isSelected: areAllMatchingItemsSelected || !!previousSelection?.isSelected || propagateSelectionToAllRows,
                        canReject: canRejectRequest,
                        reportID: transactionItem.reportID,
                        policyID: transactionItem.report?.policyID,
                        amount: hasValidModifiedAmount(transactionItem) ? Number(transactionItem.modifiedAmount) : transactionItem.amount,
                        groupAmount: transactionItem.groupAmount,
                        groupCurrency: transactionItem.groupCurrency,
                        groupExchangeRate: transactionItem.groupExchangeRate,
                        currencyConversionRate: transactionItem.currencyConversionRate,
                        currency: transactionItem.currency,
                        ownerAccountID: transactionItem.reportAction?.actorAccountID,
                        reportAction: transactionItem.reportAction,
                        isFromOneTransactionReport: isOneTransactionReport(transactionItem.report),
                        report: transactionItem.report,
                        groupKey: previousSelection?.groupKey ?? (propagateSelectionToAllRows && !isExpenseReportType ? reportKey : undefined),
                    };
                }
            }
        } else {
            for (const transactionItem of filteredData) {
                if (!Object.hasOwn(transactionItem, 'transactionID') || !('transactionID' in transactionItem)) {
                    continue;
                }
                const listKey = transactionItem.keyForList ?? transactionItem.transactionID;
                if (!(listKey in selectedTransactions) && !(transactionItem.transactionID in selectedTransactions) && !areAllMatchingItemsSelected) {
                    continue;
                }

                const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(
                    transactionItem.report,
                    transactionItem.reportAction,
                    transactionItem.holdReportAction,
                    transactionItem,
                    transactionItem.policy,
                    currentUserAccountID,
                );
                const canRejectRequest = currentUserEmail && transactionItem.report ? canRejectReportAction(currentUserEmail, transactionItem.report) : false;

                const itemTransaction = searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                const originalItemTransaction = searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                const isItemUnreported = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
                const reportForSplit = transactionItem.report ?? (isItemUnreported ? selfDMReport : undefined);

                const flatPreviousSelection = selectedTransactions[listKey] ?? selectedTransactions[transactionItem.transactionID];

                newTransactionList[listKey] = {
                    transaction: transactionItem,
                    action: transactionItem.action,
                    canHold: canHoldRequest,
                    isHeld: isOnHold(transactionItem),
                    canUnhold: canUnholdRequest,
                    canSplit: isSplitAction(
                        reportForSplit,
                        [itemTransaction],
                        originalItemTransaction,
                        currentUserLogin,
                        currentUserAccountID,
                        transactionItem.policy,
                        itemParentReport,
                        isProduction,
                    ),
                    hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
                    canChangeReport: canEditFieldOfMoneyRequest({
                        reportAction: transactionItem.reportAction,
                        fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                        outstandingReportsByPolicyID,
                        transaction: transactionItem,
                        report: transactionItem.report,
                        policy: transactionItem.policy,
                    }),

                    isSelected: areAllMatchingItemsSelected || !!flatPreviousSelection?.isSelected,
                    canReject: canRejectRequest,
                    reportID: transactionItem.reportID,
                    policyID: transactionItem.report?.policyID,
                    amount: hasValidModifiedAmount(transactionItem) ? Number(transactionItem.modifiedAmount) : transactionItem.amount,
                    groupAmount: transactionItem.groupAmount,
                    groupCurrency: transactionItem.groupCurrency,
                    groupExchangeRate: transactionItem.groupExchangeRate,
                    currencyConversionRate: transactionItem.currencyConversionRate,
                    currency: transactionItem.currency,
                    ownerAccountID: transactionItem.reportAction?.actorAccountID,
                    reportAction: transactionItem.reportAction,
                    isFromOneTransactionReport: isOneTransactionReport(transactionItem.report),
                    report: transactionItem.report,
                };
            }
        }
        if (isEmptyObject(newTransactionList) && Object.keys(selectedTransactions).length === 0) {
            return;
        }

        // Bail out when the rebuilt selection is deeply equal to the current one. Without this,
        // a dep that re-derives to a new reference but the same value re-runs this effect, which
        // calls setSelectedTransactions with an equivalent payload and loops until React aborts
        // with "Maximum update depth exceeded". See https://github.com/Expensify/App/issues/89588
        if (deepEqual(newTransactionList, selectedTransactions)) {
            return;
        }

        // Pass `filteredData` so `selectedReports` is updated atomically with `selectedTransactions`.
        // Otherwise a stale `useSyncSelectedReports` derivation in the same commit can briefly clear
        // `selectedReports` while an Onyx push expands the selection, which can close screens like
        // SearchChangeApproverPage that auto-dismiss when `selectedReports` is empty.
        reconcileSelection(newTransactionList, filteredData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData, reconcileSelection, areAllMatchingItemsSelected, isFocused, outstandingReportsByPolicyID, isExpenseReportType]);
}

/** Turn mobile selection mode off once nothing is selected and the selection asked to exit the mode. */
function useTurnOffSelectionModeWhenEmpty({isFocused, isMobileSelectionModeEnabled}: {isFocused: boolean; isMobileSelectionModeEnabled: boolean}) {
    const {selectedTransactions, shouldTurnOffSelectionMode} = useSearchSelectionContext();

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const selectedKeys = Object.keys(selectedTransactions).filter((transactionKey) => selectedTransactions[transactionKey]);
        if (selectedKeys.length === 0 && isMobileSelectionModeEnabled && shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }

        // We don't want to run the effect on isFocused change as we only need it to early return when it is false.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTransactions, isMobileSelectionModeEnabled, shouldTurnOffSelectionMode]);
}

/** Switch mobile selection mode on/off as the screen size changes, based on whether anything is selected. */
function useSyncMobileSelectionModeWithScreenSize({
    isFocused,
    isMobileSelectionModeEnabled,
    isSearchResultsEmpty,
}: {
    isFocused: boolean;
    isMobileSelectionModeEnabled: boolean;
    isSearchResultsEmpty: boolean;
}) {
    const {selectedTransactions} = useSearchSelectionContext();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const selectedKeys = Object.keys(selectedTransactions).filter((transactionKey) => selectedTransactions[transactionKey]);
        if (!isSmallScreenWidth) {
            if (selectedKeys.length === 0 && isMobileSelectionModeEnabled) {
                turnOffMobileSelectionMode();
            }
            return;
        }
        if (selectedKeys.length > 0 && !isMobileSelectionModeEnabled && !isSearchResultsEmpty) {
            turnOnMobileSelectionMode();
        }

        // We only want this effect to handle the switching of mobile selection mode state when screen size changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSmallScreenWidth]);
}

/**
 * Coordinator for Search selection. Owns the selection-only Onyx subscriptions and the effects
 * that keep selection in sync with data and mobile selection mode, and publishes the screen-derived inputs the
 * provider's stable write actions read at call time. Returns null, so its per-press re-renders are free — and
 * keep `<Search>` itself out of the selection read/write path entirely.
 */
function SearchSelectionController({
    filteredData,
    totalSelectableItemsCount,
    searchResults,
    transactions,
    isMobileSelectionModeEnabled,
    type,
    areItemsGrouped,
    isExpenseReportType,
    isSearchResultsEmpty,
}: SearchSelectionControllerProps) {
    const isFocused = useIsFocused();
    const {isProduction} = useEnvironment();
    const {accountID, email, login} = useCurrentUserPersonalDetails();
    const selfDMReport = useSelfDMReport();
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const {screenContextRef} = useSearchRowSelectionActions();

    const searchResultsData = searchResults?.data;

    // Publish call-time inputs for the provider's stable write actions. Written in an effect (not render) so it
    // never reads/writes a ref mid-render; the write actions are event handlers, so they always see the latest.
    useEffect(() => {
        screenContextRef.current = {
            filteredData,
            transactions,
            searchResultsData,
            currentUserLogin: email ?? '',
            currentUserAccountID: accountID,
            outstandingReportsByPolicyID,
            selfDMReport,
            isProduction,
            areItemsGrouped,
            totalSelectableItemsCount,
        };
    });

    useReconcileSelectionWithData({
        isFocused,
        type,
        areItemsGrouped,
        isExpenseReportType,
        filteredData,
        searchResultsData,
        transactions,
        currentUserEmail: email ?? '',
        currentUserLogin: login ?? '',
        currentUserAccountID: accountID,
        selfDMReport,
        isProduction,
        outstandingReportsByPolicyID,
    });
    useTurnOffSelectionModeWhenEmpty({isFocused, isMobileSelectionModeEnabled});
    useSyncMobileSelectionModeWithScreenSize({isFocused, isMobileSelectionModeEnabled, isSearchResultsEmpty});
    useSyncSelectedReports(filteredData);

    return null;
}

SearchSelectionController.displayName = 'SearchSelectionController';

export default SearchSelectionController;
