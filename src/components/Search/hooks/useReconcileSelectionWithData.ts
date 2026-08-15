import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import {createSearchLookups, mapEmptyReportToSelectedEntry, mapTransactionItemToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SearchData, SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';

import {canRejectReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {OutstandingReportsByPolicyIDDerivedValue, Report, ReportNameValuePairs, SearchResults, Transaction} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {deepEqual} from 'fast-equals';
import {useEffect} from 'react';

type ReconcileSelectionParams = {
    /** Whether the search screen is currently focused */
    isFocused: boolean;

    /** The search data type (expense, chat, etc.) */
    type: SearchDataTypes;

    /** Whether rows are grouped (a group-by view or the expense-report view) */
    areItemsGrouped: boolean;

    /** Whether this is the expense-report view */
    isExpenseReportType: boolean;

    /** The currently displayed (filtered, grouped) rows */
    filteredData: SearchData;

    /** Raw search snapshot data, used for denormalized transaction/report lookups */
    searchResultsData: SearchResults['data'] | undefined;

    /** The live TRANSACTION Onyx collection */
    transactions: OnyxCollection<Transaction>;

    /** Email of the current user */
    currentUserEmail: string;

    /** Login (email or phone) of the current user */
    currentUserLogin: string;

    /** Account ID of the current user */
    currentUserAccountID: number;

    /** The current user's self-DM report, used as the parent for unreported (track) expenses */
    selfDMReport: OnyxEntry<Report>;

    /** Whether the app is running in production (affects split eligibility) */
    isProduction: boolean;

    /** Report name-value pairs collection, used for the change-report eligibility archived check */
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;

    /** Derived outstanding reports per policy, used for the change-report eligibility check */
    outstandingReportsByPolicyID: OutstandingReportsByPolicyIDDerivedValue | undefined;

    /** Whether the current snapshot is settled and can safely refresh/prune exclusions */
    shouldReconcileExcludedTransactions: boolean;
};

/**
 * Rebuilds `selectedTransactions` whenever the underlying data changes (e.g. an Onyx push adds rows to a
 * selected report) so the selection stays in sync with what is on screen, then atomically commits it via
 * `applySelection`. Ported verbatim from the former `<Search>` refresh-selection effect: it reads
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
    reportNameValuePairs,
    outstandingReportsByPolicyID,
    shouldReconcileExcludedTransactions,
}: ReconcileSelectionParams) {
    const {selectedTransactions, excludedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {applySelection} = useSearchSelectionActions();

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
            return;
        }
        // The same lookups the write path uses, so a reconcile cannot compute different action flags than the click that selected the row.
        const {readTransaction, readSnapshotReport} = createSearchLookups({searchResultsData, transactions});
        const newTransactionList: SelectedTransactions = {};
        const liveSelectionEntries = new Map<string, SelectedTransactionInfo>();
        const presentGroupKeys = new Set<string>();
        if (areItemsGrouped) {
            for (const transactionGroup of filteredData) {
                if (!Object.hasOwn(transactionGroup, 'transactions') || !('transactions' in transactionGroup)) {
                    continue;
                }

                const reportKey = transactionGroup.keyForList;
                // Only group-by groups that carry no rows, since anything missing from a group that does carry them is gone for real.
                if (reportKey && !isExpenseReportType && transactionGroup.transactions.length === 0 && transactionGroup.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    presentGroupKeys.add(reportKey);
                }
                if (shouldReconcileExcludedTransactions && reportKey && transactionGroup.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    const [, groupSelection] = mapEmptyReportToSelectedEntry(transactionGroup);
                    liveSelectionEntries.set(reportKey, groupSelection);
                }

                if (transactionGroup.transactions.length === 0) {
                    if (transactionGroup.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                        continue;
                    }
                    if (reportKey && !Object.hasOwn(excludedTransactions, reportKey) && (reportKey in selectedTransactions || areAllMatchingItemsSelected)) {
                        const emptyReportSelection = liveSelectionEntries.get(reportKey) ?? mapEmptyReportToSelectedEntry(transactionGroup)[1];
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
                const wasReportSelected = !!(reportKey && reportKey in selectedTransactions);
                const hasIndividualSelectedInGroup = transactionGroup.transactions.some(
                    (transaction) => (!!transaction.keyForList && transaction.keyForList in selectedTransactions) || transaction.transactionID in selectedTransactions,
                );
                const propagateSelectionToAllRows = (isExpenseReportType && (wasReportSelected || hasIndividualSelectedInGroup)) || (wasReportSelected && !isExpenseReportType);
                const isParentGroupExcluded = type === CONST.SEARCH.DATA_TYPES.EXPENSE && !!reportKey && Object.hasOwn(excludedTransactions, reportKey);

                for (const transactionItem of transactionGroup.transactions) {
                    const listKey = transactionItem.keyForList ?? transactionItem.transactionID;
                    const isDirectlyExcluded = Object.hasOwn(excludedTransactions, listKey) || Object.hasOwn(excludedTransactions, transactionItem.transactionID);
                    const isSelected = listKey in selectedTransactions || transactionItem.transactionID in selectedTransactions;
                    const isExcluded = !isSelected && (isParentGroupExcluded || isDirectlyExcluded);

                    // Include transaction if: already individually selected, part of select-all, or group-level propagation (expense report / empty group expanded)
                    const shouldInclude = !isExcluded && (isSelected || areAllMatchingItemsSelected || propagateSelectionToAllRows);
                    if (!shouldInclude && !isDirectlyExcluded) {
                        continue;
                    }

                    const itemTransaction = readTransaction(transactionItem.transactionID);
                    const originalItemTransaction = readTransaction(itemTransaction?.comment?.originalTransactionID);
                    const itemParentReport = readSnapshotReport(transactionItem.report?.parentReportID);
                    const previousSelection = selectedTransactions[listKey] ?? selectedTransactions[transactionItem.transactionID];

                    // The overrides below are what reconcile computes differently from a toggle, so keep them.
                    const [, baseEntry] = mapTransactionItemToSelectedEntry({
                        item: transactionItem,
                        itemTransaction,
                        originalItemTransaction,
                        currentUserLogin,
                        currentUserAccountID,
                        reportNameValuePairs,
                        outstandingReportsByPolicyID,
                        selfDMReport,
                        isProduction,
                        allowNegativeAmount: true,
                        parentReport: itemParentReport,
                    });

                    const liveSelectionEntry: SelectedTransactionInfo = {
                        ...baseEntry,
                        isSelected: !isExcluded && (areAllMatchingItemsSelected || !!previousSelection?.isSelected || propagateSelectionToAllRows),
                        canReject: currentUserEmail && transactionItem.report ? canRejectReportAction(currentUserEmail, transactionItem.report) : false,
                        policyID: transactionItem.report?.policyID,
                        groupKey: previousSelection?.groupKey ?? (isExpenseReportType ? undefined : reportKey),
                        isSelectedViaGroup: previousSelection?.isSelectedViaGroup,
                    };
                    liveSelectionEntries.set(listKey, liveSelectionEntry);
                    liveSelectionEntries.set(transactionItem.transactionID, liveSelectionEntry);
                    if (shouldInclude) {
                        newTransactionList[listKey] = liveSelectionEntry;
                    }
                }
            }
        } else {
            for (const transactionItem of filteredData) {
                if (!Object.hasOwn(transactionItem, 'transactionID') || !('transactionID' in transactionItem)) {
                    continue;
                }
                const listKey = transactionItem.keyForList ?? transactionItem.transactionID;
                const isExcluded = Object.hasOwn(excludedTransactions, listKey) || Object.hasOwn(excludedTransactions, transactionItem.transactionID);
                if (!isExcluded && !(listKey in selectedTransactions) && !(transactionItem.transactionID in selectedTransactions) && !areAllMatchingItemsSelected) {
                    continue;
                }

                const itemTransaction = readTransaction(transactionItem.transactionID);
                const originalItemTransaction = readTransaction(itemTransaction?.comment?.originalTransactionID);
                const itemParentReport = readSnapshotReport(transactionItem.report?.parentReportID);
                const flatPreviousSelection = selectedTransactions[listKey] ?? selectedTransactions[transactionItem.transactionID];

                const [, baseEntry] = mapTransactionItemToSelectedEntry({
                    item: transactionItem,
                    itemTransaction,
                    originalItemTransaction,
                    currentUserLogin,
                    currentUserAccountID,
                    reportNameValuePairs,
                    outstandingReportsByPolicyID,
                    selfDMReport,
                    isProduction,
                    allowNegativeAmount: true,
                    parentReport: itemParentReport,
                });

                const liveSelectionEntry: SelectedTransactionInfo = {
                    ...baseEntry,
                    isSelected: areAllMatchingItemsSelected || !!flatPreviousSelection?.isSelected,
                    canReject: currentUserEmail && transactionItem.report ? canRejectReportAction(currentUserEmail, transactionItem.report) : false,
                    policyID: transactionItem.report?.policyID,
                };
                liveSelectionEntries.set(listKey, liveSelectionEntry);
                liveSelectionEntries.set(transactionItem.transactionID, liveSelectionEntry);
                if (!isExcluded) {
                    newTransactionList[listKey] = liveSelectionEntry;
                }
            }
        }

        // Kept while the parent group is still here, the same rule the exclusions below follow, since a lazy group's children never reach `filteredData`.
        if (areItemsGrouped) {
            for (const [key, selectedTransaction] of Object.entries(selectedTransactions)) {
                const parentGroupKey = selectedTransaction.groupKey;
                // A group excluded whole covers its children, the same rule the grouped loop above applies, or the group would come back partly checked.
                if (
                    !parentGroupKey ||
                    Object.hasOwn(newTransactionList, key) ||
                    Object.hasOwn(excludedTransactions, key) ||
                    Object.hasOwn(excludedTransactions, parentGroupKey) ||
                    !presentGroupKeys.has(parentGroupKey)
                ) {
                    continue;
                }
                newTransactionList[key] = liveSelectionEntries.get(key) ?? selectedTransaction;
            }
        }

        let reconciledExcludedTransactions = excludedTransactions;
        if (shouldReconcileExcludedTransactions && areAllMatchingItemsSelected && !isEmptyObject(excludedTransactions)) {
            const nextExcludedTransactions: SelectedTransactions = {};
            for (const [key, excludedTransaction] of Object.entries(excludedTransactions)) {
                const transactionID = excludedTransaction.transaction?.transactionID;
                const liveEntry = liveSelectionEntries.get(key) ?? (transactionID ? liveSelectionEntries.get(transactionID) : undefined);
                if (liveEntry) {
                    nextExcludedTransactions[key] = {
                        ...liveEntry,
                        groupKey: excludedTransaction.groupKey,
                        isSelectedViaGroup: excludedTransaction.isSelectedViaGroup,
                    };
                    continue;
                }

                // Lazy group children are held in a separate snapshot. Keep their exclusions while the parent
                // group is still present. If the parent disappears, the child no longer matches this search.
                if (excludedTransaction.groupKey && liveSelectionEntries.has(excludedTransaction.groupKey)) {
                    nextExcludedTransactions[key] = excludedTransaction;
                }
            }
            if (!deepEqual(nextExcludedTransactions, excludedTransactions)) {
                reconciledExcludedTransactions = nextExcludedTransactions;
            }
        }

        const isSelectionUnchanged = deepEqual(newTransactionList, selectedTransactions);
        const areExclusionsUnchanged = reconciledExcludedTransactions === excludedTransactions;
        if (isEmptyObject(newTransactionList) && Object.keys(selectedTransactions).length === 0 && areExclusionsUnchanged) {
            return;
        }

        // Bail out when the rebuilt selection is deeply equal to the current one. Without this,
        // a dep that re-derives to a new reference but the same value re-runs this effect, which
        // commits an equivalent payload and loops until React aborts with "Maximum update depth
        // exceeded". See https://github.com/Expensify/App/issues/89588
        if (isSelectionUnchanged && areExclusionsUnchanged) {
            return;
        }

        // Commit without `totalSelectableItemsCount` so the select-all flag is left untouched while the data
        // reconcile is in flight (this replaces the former `isRefreshingSelection` guard). `filteredData` is passed
        // so `selectedReports` is derived atomically and a stale `useSyncSelectedReports` derivation can't briefly
        // clear it (which would close screens like SearchChangeApproverPage that dismiss on empty `selectedReports`).
        applySelection(() => (isSelectionUnchanged ? selectedTransactions : newTransactionList), {
            data: filteredData,
            ...(areExclusionsUnchanged ? {} : {reconciledExcludedTransactions}),
        });
        // `selectedTransactions` and `excludedTransactions` are intentionally omitted from the deps and read from
        // closure instead (see the hook doc above): including them would re-run this reconcile on every checkbox
        // press. We only want it to run when the underlying data, focus, or select-all state changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData, applySelection, areAllMatchingItemsSelected, isFocused, outstandingReportsByPolicyID, isExpenseReportType, shouldReconcileExcludedTransactions]);
}

export default useReconcileSelectionWithData;
