import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useShiftRangeSelection from '@hooks/useShiftRangeSelection';

import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {canRejectReportAction} from '@libs/ReportUtils';
import {
    isGroupedItemArray,
    isReportActionListItemType,
    isReportEntry,
    isTaskListItemType,
    isTransactionEntry,
    isTransactionGroupListItemType,
    isTransactionListItemType,
    isTransactionReportGroupListItemType,
} from '@libs/SearchUIUtils';
import type {ShiftRangeBatch} from '@libs/shiftRangeSelection';
import {isTransactionPendingDelete} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OutstandingReportsByPolicyIDDerivedValue, Report, ReportNameValuePairs, SearchResults, Transaction} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import React, {useEffect, useLayoutEffect, useRef} from 'react';

import type {SearchListItem, TransactionListItemType} from './SearchList/ListItem/types';
import type {SearchData, SearchRowSelectionActionsValue, SelectedTransactionInfo, SelectedTransactions} from './types';

import useOpenGroupsRegistry from './hooks/useOpenGroupsRegistry';
import {useSearchSelectionActions, useSearchSelectionContext} from './SearchContext';
import {SearchRowSelectionActionsContext, SearchShiftRangeGroupsContext} from './SearchContextDefinitions';
import {useSyncSelectedReports} from './SearchSelectionProvider';
import {buildShiftRangeSource, isGroupSelected, isRowChecked, mapEmptyReportToSelectedEntry, mapTransactionItemToSelectedEntry, prepareTransactionsList} from './selectionBuilders';

type SearchWriteActionsProviderProps = {
    /** The currently displayed (filtered, grouped) rows. Screen-derived; the provider cannot recompute it. */
    filteredData: SearchData;

    /** The exact rows the list renders, so a range spans the on-screen order rather than the pre-sort `filteredData` */
    renderedData: SearchListItem[];

    /** Keeps "select all matching" in lock-step: select-all unchecks once the selection no longer covers every item. */
    totalSelectableItemsCount: number;

    /** The raw search snapshot, read for denormalized transaction/report lookups. */
    searchResults: SearchResults | undefined;

    /** Identity of the query being rendered. Everything scoped to one search — the registry, its openness, the range session — is keyed on it. */
    searchHash: number;

    /** The live TRANSACTION collection, subscribed by `<Search>` and passed down. */
    transactions: OnyxCollection<Transaction>;

    /** Whether mobile selection mode is on. */
    isMobileSelectionModeEnabled: boolean;

    /** The search data type. */
    type: SearchDataTypes;

    /** Grouped meaning either a group-by view or the expense-report view. */
    areItemsGrouped: boolean;

    /** Drives report-level selection propagation. */
    isExpenseReportType: boolean;

    /** Whether the current search produced no results. */
    isSearchResultsEmpty: boolean;

    /** The list subtree whose rows and header consume the write actions. */
    children: React.ReactNode;
};

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
    const {selectedTransactions, excludedTransactions = getEmptyObject<SelectedTransactions>(), areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {applySelection} = useSearchSelectionActions();

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
            return;
        }
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
                    // An entry of its own wins, the same rule the checkbox renders from: a row picked back out of an excluded group is not covered by it.
                    const isExcluded = !isSelected && (isParentGroupExcluded || isDirectlyExcluded);

                    // Include transaction if: already individually selected, part of select-all, or group-level propagation (expense report / empty group expanded)
                    const shouldInclude = !isExcluded && (isSelected || areAllMatchingItemsSelected || propagateSelectionToAllRows);
                    if (!shouldInclude && !isDirectlyExcluded) {
                        continue;
                    }

                    const itemTransaction = (searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] ??
                        transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`]) as OnyxEntry<Transaction>;
                    const originalItemTransaction =
                        searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`] ??
                        transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                    const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
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
                        groupKey: previousSelection?.groupKey ?? (propagateSelectionToAllRows && !isExpenseReportType ? reportKey : undefined),
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

                const itemTransaction = searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                const originalItemTransaction = searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
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

        // A group written out into its loaded rows keeps them while the group is still here, since a lazy group's children never reach `filteredData`.
        if (areItemsGrouped) {
            for (const [key, selectedTransaction] of Object.entries(selectedTransactions)) {
                const parentGroupKey = selectedTransaction.groupKey;
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

        // `isFocused` is intentionally omitted from the deps: it is only read for the early-return guard above,
        // and we don't want the effect to re-run when focus changes.
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

// Screen-level owner of the selection write path. Actions commit via `applySelection` instead of closing over
// `selectedTransactions`, so dispatching one re-renders neither this provider's stable children nor the rows.
function SearchWriteActionsProvider({
    filteredData,
    renderedData,
    totalSelectableItemsCount,
    searchResults,
    searchHash,
    transactions,
    isMobileSelectionModeEnabled,
    type,
    areItemsGrouped,
    isExpenseReportType,
    isSearchResultsEmpty,
    children,
}: SearchWriteActionsProviderProps) {
    const isFocused = useIsFocused();
    const {isProduction} = useEnvironment();
    const {isOffline} = useNetwork();
    const {accountID, email, login} = useCurrentUserPersonalDetails();
    const selfDMReport = useSelfDMReport();
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const {applySelection, getSelectedTransactions, getExcludedTransactions, getAreAllMatchingItemsSelected} = useSearchSelectionActions();

    const {openGroupKeys, shiftRangeGroupsActions} = useOpenGroupsRegistry(searchHash);

    // Read at the gesture, not from render scope: closing over it would give every row a new `toggle` each time a group opens.
    const groupKeyByChildKeyRef = useRef<ReadonlyMap<string, string>>(new Map());
    const childrenByGroupKeyRef = useRef<ReadonlyMap<string, TransactionListItemType[]>>(new Map());

    const searchResultsData = searchResults?.data;
    const currentUserEmail = email ?? '';
    const currentUserLogin = login ?? '';

    // One policy for every gesture, live Onyx first: the hold and split flags read the optimistic row, and the snapshot only refreshes when the search returns.
    const readTransaction = (transactionID: string | undefined): OnyxEntry<Transaction> => {
        if (!transactionID) {
            return undefined;
        }
        const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        return isTransactionEntry(key) ? (transactions?.[key] ?? searchResultsData?.[key]) : undefined;
    };

    const resolveTransactionRefs = (item: TransactionListItemType) => {
        const itemTransaction = readTransaction(item.transactionID);
        const parentReportID = item.report?.parentReportID;
        const parentReportKey = `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`;
        return {
            itemTransaction,
            originalItemTransaction: readTransaction(itemTransaction?.comment?.originalTransactionID),
            parentReport: parentReportID && isReportEntry(parentReportKey) ? searchResultsData?.[parentReportKey] : undefined,
        };
    };

    // Shared selection-entry builder so the toggle / select-all / range call sites can't drift apart.
    const buildSelectedEntry = (item: TransactionListItemType) => {
        const {itemTransaction, originalItemTransaction, parentReport} = resolveTransactionRefs(item);
        return mapTransactionItemToSelectedEntry({
            item,
            itemTransaction,
            originalItemTransaction,
            currentUserLogin: currentUserEmail,
            currentUserAccountID: accountID,
            reportNameValuePairs,
            outstandingReportsByPolicyID,
            selfDMReport,
            isProduction,
            allowNegativeAmount: true,
            parentReport,
        });
    };

    // One exit rule for every selection commit, so the range path cannot be the one call site that forgets it.
    const commitOptions = {
        totalSelectableItemsCount,
        shouldPreserveAllMatchingSelection: type === CONST.SEARCH.DATA_TYPES.EXPENSE,
        shouldClearAllMatchingSelectionWhenEmpty: isOffline || searchResults?.search?.hasMoreResults === false,
    };

    // Expense-report rows are the selectable unit. Only group-by rows are headers whose children flatten in.
    const hasValidGroupBy = areItemsGrouped && !isExpenseReportType;
    // One pass: the rows a range spans and the parent each belongs to cannot be built separately without being able to disagree.
    const {items: flattenedShiftRangeItems, childrenByGroupKey, groupKeyByChildKey} = buildShiftRangeSource(renderedData, openGroupKeys, hasValidGroupBy);
    useLayoutEffect(() => {
        groupKeyByChildKeyRef.current = groupKeyByChildKey;
        childrenByGroupKeyRef.current = childrenByGroupKey;
    }, [groupKeyByChildKey, childrenByGroupKey]);
    const isShiftRangeHeaderItem = (item: SearchData[number]) => isTransactionGroupListItemType(item) && hasValidGroupBy;

    // A child's parent, resolved once, or undefined where the group is not a whole-group selection this code may enumerate.
    const resolveGroupBlock = (selection: SelectedTransactions, childKey: string) => {
        const groupKey = groupKeyByChildKeyRef.current.get(childKey);
        if (!groupKey || getAreAllMatchingItemsSelected() || !selection[groupKey]?.isSelected) {
            return undefined;
        }
        return {groupKey, loaded: childrenByGroupKeyRef.current.get(groupKey) ?? []};
    };

    // A group selected before its children loaded lives under the group key alone, so dropping one child needs the group written out first.
    const spellOutGroupSelection = (selection: SelectedTransactions, childKey: string): SelectedTransactions => {
        const block = resolveGroupBlock(selection, childKey);
        // Nothing to write it out into is not the same as a group with no rows: it would delete the entry and put nothing back.
        if (!block || block.loaded.length === 0) {
            return selection;
        }
        const {groupKey} = block;
        const spelledOut: SelectedTransactions = {...selection};
        delete spelledOut[groupKey];
        for (const child of block.loaded) {
            if (isTransactionPendingDelete(child)) {
                continue;
            }
            const [key, info] = buildSelectedEntry(child);
            // No `isSelectedViaGroup`: the caller is about to drop one of these, so the group stops being a whole-group selection.
            spelledOut[key] = {...info, groupKey};
        }
        return spelledOut;
    };

    // Defaults to the refs, so asking whether a group is checked never re-renders this provider. A reducer passes its own map.
    const groupSelectionParams = (groupKey: string | undefined, groupChildren: TransactionListItemType[], selectedTransactions = getSelectedTransactions()) => ({
        groupKey,
        children: groupChildren,
        selectedTransactions,
        excludedTransactions: getExcludedTransactions(),
        areAllMatchingItemsSelected: getAreAllMatchingItemsSelected(),
    });

    const applyShiftRangeBatch = (batch: ShiftRangeBatch<SearchData[number]>) => {
        applySelection(
            (selectedTransactions) => {
                let updated: SelectedTransactions = {...selectedTransactions};
                // The same rule the group toggle follows: a batch that writes nothing returns the map it was given, so the commit bails on identity rather than re-rendering every row.
                let hasWritten = false;
                // Groups this batch took a row from, and groups it took whole. Whole wins, since that is the gesture a header click makes.
                const partialGroupKeys = new Set<string>();
                const wholeGroupKeys = new Set<string>();
                const dropKey = (key: string) => {
                    if (!Object.hasOwn(updated, key)) {
                        return;
                    }
                    delete updated[key];
                    hasWritten = true;
                };
                // `blockGroupKey` is set only when a whole group row joins the range, which is what makes its children narrowable later.
                const addTransaction = (tx: TransactionListItemType, blockGroupKey: string | undefined) => {
                    if (!tx.keyForList || isTransactionPendingDelete(tx)) {
                        return;
                    }
                    updated = spellOutGroupSelection(updated, tx.keyForList);
                    const [key, info] = buildSelectedEntry(tx);
                    const parentGroupKey = blockGroupKey ?? groupKeyByChildKeyRef.current.get(tx.keyForList);
                    if (parentGroupKey) {
                        (blockGroupKey ? wholeGroupKeys : partialGroupKeys).add(parentGroupKey);
                    }
                    const entry = parentGroupKey ? {...info, groupKey: parentGroupKey, isSelectedViaGroup: !!blockGroupKey} : info;
                    // Extending a range re-covers rows it already holds, so writing an equal entry would commit a map nothing reads differently.
                    if (deepEqual(updated[key], entry)) {
                        return;
                    }
                    updated[key] = entry;
                    hasWritten = true;
                };
                const removeRow = (row: SearchData[number]) => {
                    if (isTransactionListItemType(row) || (isTransactionReportGroupListItemType(row) && row.transactions.length === 0)) {
                        if (row.keyForList) {
                            const parentGroupKey = groupKeyByChildKeyRef.current.get(row.keyForList);
                            if (parentGroupKey) {
                                partialGroupKeys.add(parentGroupKey);
                            }
                            updated = spellOutGroupSelection(updated, row.keyForList);
                            dropKey(row.keyForList);
                        }
                        return;
                    }
                    if (isTransactionGroupListItemType(row)) {
                        // Mirrors the group toggle: a group can hold an entry under its own key as well as under its children's.
                        if (row.keyForList) {
                            dropKey(row.keyForList);
                        }
                        for (const child of row.transactions ?? []) {
                            if (child.keyForList) {
                                dropKey(child.keyForList);
                            }
                        }
                    }
                };
                const addRow = (row: SearchData[number]) => {
                    if (isTransactionListItemType(row)) {
                        addTransaction(row, undefined);
                    } else if (isTransactionReportGroupListItemType(row) && row.transactions.length === 0) {
                        if (row.keyForList && row.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                            const [key, info] = mapEmptyReportToSelectedEntry(row);
                            if (!deepEqual(updated[key], info)) {
                                updated[key] = info;
                                hasWritten = true;
                            }
                        }
                    } else if (isTransactionGroupListItemType(row)) {
                        // Same as the group toggle: a group with nothing it can select is left exactly as it was.
                        const selectable = (row.transactions ?? []).filter((child) => !isTransactionPendingDelete(child));
                        if (selectable.length === 0) {
                            return;
                        }
                        // The children carry the selection once they are here, the same as the group toggle: leaving the group's own entry behind would count it twice.
                        if (row.keyForList) {
                            dropKey(row.keyForList);
                        }
                        for (const child of selectable) {
                            addTransaction(child, row.keyForList);
                        }
                    }
                };
                for (const row of batch.toDeselect) {
                    removeRow(row);
                }
                for (const row of batch.toSelect) {
                    addRow(row);
                }
                // Taking part of a group makes it partial, so the rows left behind stop claiming it covers them. Otherwise an export sends a whole-group filter.
                for (const [key, transaction] of Object.entries(updated)) {
                    if (transaction.isSelectedViaGroup && transaction.groupKey && partialGroupKeys.has(transaction.groupKey) && !wholeGroupKeys.has(transaction.groupKey)) {
                        updated[key] = {...transaction, isSelectedViaGroup: false};
                        hasWritten = true;
                    }
                }
                return hasWritten ? updated : selectedTransactions;
            },
            {...commitOptions, data: filteredData},
        );
    };

    // The same predicate the checkbox renders from, so a range reaches exactly the rows the user sees checked.
    const isRowVisiblyChecked = (item: SearchData[number]) => {
        const selectedTransactions = getSelectedTransactions();
        const excludedTransactions = getExcludedTransactions();
        const areAllMatchingItemsSelected = getAreAllMatchingItemsSelected();
        if (isTransactionGroupListItemType(item) && item.transactions.length > 0) {
            return item.transactions.some((transaction) =>
                isRowChecked({rowKey: transaction.keyForList, parentGroupKey: item.keyForList, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected}),
            );
        }
        if (!item.keyForList) {
            return false;
        }
        return isRowChecked({
            rowKey: item.keyForList,
            parentGroupKey: groupKeyByChildKeyRef.current.get(item.keyForList),
            selectedTransactions,
            excludedTransactions,
            areAllMatchingItemsSelected,
        });
    };

    // A row checked through a group header belongs to that block, so a range may take it back. Report rows are the row the user clicked, not a block.
    const isRowHandPicked = (item: SearchData[number]) => {
        const selectedTransactions = getSelectedTransactions();
        // A report row is the row the user clicked, so any selected child makes it hand-picked. A group header selects a block instead.
        if (isTransactionGroupListItemType(item) && item.transactions.length > 0) {
            return item.transactions.some((transaction) => selectedTransactions[transaction.keyForList]?.isSelected);
        }
        const entry = item.keyForList ? selectedTransactions[item.keyForList] : undefined;
        return !!entry?.isSelected && !entry.isSelectedViaGroup;
    };

    const rangeApi = useShiftRangeSelection<SearchData[number]>({
        items: flattenedShiftRangeItems,
        getItemKey: (item) => item.keyForList,
        isItemSelected: isRowVisiblyChecked,
        isItemProtected: isRowHandPicked,
        isDisabledItem: (item) => (isTransactionListItemType(item) ? isTransactionPendingDelete(item) : item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
        onApplyRange: applyShiftRangeBatch,
        isHeaderItem: isShiftRangeHeaderItem,
    });

    // The session belongs to one search, the same as the registry: a row matching both queries would otherwise let the old span collapse rows in the new results.
    useEffect(() => {
        rangeApi.clearAnchor();
    }, [searchHash, rangeApi]);

    // Seeded as membership rather than rows, so a group whose children are still loading seeds correctly once they arrive.
    const seedGroup = (groupKey: string) => rangeApi.seedRangeFromSelection((childKey) => groupKeyByChildKeyRef.current.get(childKey) === groupKey);

    const toggle: SearchRowSelectionActionsValue['toggle'] = (item, itemTransactions, shiftKey) => {
        if (isReportActionListItemType(item) || isTaskListItemType(item)) {
            return;
        }

        // The hook rejects headers as range targets, so shift+click on one falls through to the group toggle.
        if (rangeApi.applyShiftClick(item, shiftKey)) {
            return;
        }

        // One children source for the seed and the selection, so a group can't seed a different block than it selects.
        const groupTransactions = isTransactionGroupListItemType(item) ? (itemTransactions ?? item.transactions ?? []) : [];

        if (isTransactionGroupListItemType(item) && isShiftRangeHeaderItem(item)) {
            if (isGroupSelected(groupSelectionParams(item.keyForList, groupTransactions))) {
                // Deselecting paints no block, so reset instead of leaving a stale span to collapse.
                rangeApi.clearAnchor();
            } else if (groupTransactions.length === 0 || groupTransactions.some((transactionItem) => !isTransactionPendingDelete(transactionItem))) {
                // Seed just this block: seeding the whole selection would span unrelated rows and deselect them. A group holding rows it cannot select commits nothing, so it seeds nothing.
                seedGroup(item.keyForList);
            }
        } else if (!isShiftRangeHeaderItem(item)) {
            // Seed the anchor so a later shift+click continues from here. The hook ignores rows a range can't reach.
            rangeApi.notifyAnchor(item);
        }

        if (isTransactionListItemType(item)) {
            if (!item.keyForList || isTransactionPendingDelete(item)) {
                return;
            }
            applySelection((selectedTransactions) => {
                const {itemTransaction, originalItemTransaction, parentReport: itemParentReport} = resolveTransactionRefs(item);
                const baseSelection = spellOutGroupSelection(selectedTransactions, item.keyForList);
                const updatedTransactions = prepareTransactionsList({
                    item,
                    itemTransaction,
                    originalItemTransaction,
                    selectedTransactions: baseSelection,
                    currentUserLogin: currentUserEmail,
                    currentUserAccountID: accountID,
                    reportNameValuePairs,
                    outstandingReportsByPolicyID,
                    selfDMReport,
                    isProduction,
                    parentReport: itemParentReport,
                });

                if (areItemsGrouped && isGroupedItemArray(filteredData)) {
                    const parentGroup = filteredData.find((group) => group.transactions.some((transaction) => transaction.keyForList === item.keyForList));
                    const groupKey = baseSelection[item.keyForList]?.groupKey ?? groupKeyByChildKeyRef.current.get(item.keyForList) ?? parentGroup?.keyForList;
                    // Toggling one expense makes this group a partial selection, so export the remaining expenses individually.
                    if (groupKey) {
                        for (const [key, transaction] of Object.entries(updatedTransactions)) {
                            if (transaction.groupKey === groupKey && transaction.isSelectedViaGroup) {
                                updatedTransactions[key] = {...transaction, isSelectedViaGroup: false};
                            }
                        }
                    }
                    // If the clicked expense is still selected, keep its parent group key.
                    if (groupKey && updatedTransactions[item.keyForList]) {
                        updatedTransactions[item.keyForList] = {...updatedTransactions[item.keyForList], groupKey};
                    }
                }

                return updatedTransactions;
            }, commitOptions);
            return;
        }

        applySelection((selectedTransactions) => {
            if (groupTransactions.length === 0 && item.keyForList) {
                const reportKey = item.keyForList;

                if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return selectedTransactions;
                }

                if (selectedTransactions[reportKey]?.isSelected) {
                    const reducedSelectedTransactions: SelectedTransactions = {...selectedTransactions};
                    delete reducedSelectedTransactions[reportKey];
                    return reducedSelectedTransactions;
                }

                const [, emptyReportSelection] = mapEmptyReportToSelectedEntry(item);
                return {...selectedTransactions, [reportKey]: emptyReportSelection};
            }

            // A group selected before its children were fetched is stored under the group key. Once the children load,
            // deselecting has to clear that entry too, otherwise the group stays selected with no way to deselect it.
            const groupKey = item.keyForList;

            if (isGroupSelected(groupSelectionParams(groupKey, groupTransactions, selectedTransactions))) {
                const reducedSelectedTransactions: SelectedTransactions = {...selectedTransactions};
                if (groupKey) {
                    delete reducedSelectedTransactions[groupKey];
                }
                for (const transaction of groupTransactions) {
                    delete reducedSelectedTransactions[transaction.keyForList];
                }
                return reducedSelectedTransactions;
            }

            const selectableTransactions = groupTransactions.filter((transactionItem) => !isTransactionPendingDelete(transactionItem));
            // Same map, not an equal one: the commit bails on identity, so a group with nothing to select must not re-render every row.
            if (selectableTransactions.length === 0) {
                return selectedTransactions;
            }
            return {
                ...selectedTransactions,
                ...Object.fromEntries(
                    selectableTransactions.map((transactionItem) => {
                        const [key, entry] = buildSelectedEntry(transactionItem);
                        return [key, {...entry, groupKey: item.keyForList, isSelectedViaGroup: !!item.keyForList}];
                    }),
                ),
            };
        }, commitOptions);
    };

    const toggleAll: SearchRowSelectionActionsValue['toggleAll'] = () => {
        // Read once, so the session and the selection cannot act on two different answers.
        const isClearing = Object.keys(getSelectedTransactions()).length > 0;
        if (isClearing) {
            rangeApi.clearAnchor();
        } else {
            rangeApi.seedFullRange();
        }
        applySelection(
            () => {
                if (isClearing) {
                    return {};
                }

                if (areItemsGrouped && isGroupedItemArray(filteredData)) {
                    const allSelections: Array<[string, SelectedTransactionInfo]> = filteredData.flatMap((item) => {
                        if (item.transactions.length === 0 && item.keyForList) {
                            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                                return [];
                            }
                            return [mapEmptyReportToSelectedEntry(item)];
                        }
                        const entries: Array<[string, SelectedTransactionInfo]> = [];
                        for (const transactionItem of item.transactions) {
                            if (isTransactionPendingDelete(transactionItem)) {
                                continue;
                            }
                            const [key, entry] = buildSelectedEntry(transactionItem);
                            entries.push([key, {...entry, groupKey: item.keyForList, isSelectedViaGroup: !!item.keyForList}]);
                        }
                        return entries;
                    });
                    return Object.fromEntries(allSelections);
                }

                // When items are not grouped, data is TransactionListItemType[] not TransactionGroupListItemType[]
                const entries: Array<[string, SelectedTransactionInfo]> = [];
                for (const transactionItem of filteredData) {
                    if (!isTransactionListItemType(transactionItem)) {
                        continue;
                    }
                    if (isTransactionPendingDelete(transactionItem)) {
                        continue;
                    }
                    entries.push(buildSelectedEntry(transactionItem));
                }
                return Object.fromEntries(entries);
            },
            {data: filteredData, totalSelectableItemsCount},
        );
    };

    useReconcileSelectionWithData({
        isFocused,
        type,
        areItemsGrouped,
        isExpenseReportType,
        filteredData,
        searchResultsData,
        transactions,
        currentUserEmail,
        currentUserLogin,
        currentUserAccountID: accountID,
        selfDMReport,
        isProduction,
        reportNameValuePairs,
        outstandingReportsByPolicyID,
        shouldReconcileExcludedTransactions: type === CONST.SEARCH.DATA_TYPES.EXPENSE && !!searchResultsData && searchResults?.search?.isLoading === false && !searchResults?.errors,
    });
    useTurnOffSelectionModeWhenEmpty({isFocused, isMobileSelectionModeEnabled});
    useSyncMobileSelectionModeWithScreenSize({isFocused, isMobileSelectionModeEnabled, isSearchResultsEmpty});
    useSyncSelectedReports(filteredData);

    const rowSelectionActionsValue: SearchRowSelectionActionsValue = {toggle, toggleAll};

    return (
        <SearchRowSelectionActionsContext value={rowSelectionActionsValue}>
            <SearchShiftRangeGroupsContext value={shiftRangeGroupsActions}>{children}</SearchShiftRangeGroupsContext>
        </SearchRowSelectionActionsContext>
    );
}

export default SearchWriteActionsProvider;
