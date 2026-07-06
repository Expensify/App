import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useShiftRangeSelection from '@hooks/useShiftRangeSelection';

import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {canRejectReportAction} from '@libs/ReportUtils';
import {
    isGroupedItemArray,
    isReportActionListItemType,
    isTaskListItemType,
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
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import React, {useEffect, useState} from 'react';

import type {TransactionListItemType} from './SearchList/ListItem/types';
import type {SearchData, SearchRowSelectionActionsValue, SearchShiftRangeChildrenActions, SelectedTransactionInfo, SelectedTransactions} from './types';

import {useSearchSelectionActions, useSearchSelectionContext} from './SearchContext';
import {SearchRowSelectionActionsContext, SearchShiftRangeChildrenContext} from './SearchContextDefinitions';
import {useSyncSelectedReports} from './SearchSelectionProvider';
import {buildShiftRangeItems, mapEmptyReportToSelectedEntry, mapTransactionItemToSelectedEntry, prepareTransactionsList} from './selectionBuilders';

type SearchWriteActionsProviderProps = {
    /** The currently displayed (filtered, grouped) rows. Screen-derived; the provider cannot recompute it. */
    filteredData: SearchData;

    /** Keeps "select all matching" in lock-step: select-all unchecks once the selection no longer covers every item. */
    totalSelectableItemsCount: number;

    /** The raw search snapshot, read for denormalized transaction/report lookups. */
    searchResults: SearchResults | undefined;

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
}: ReconcileSelectionParams) {
    const {selectedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {applySelection} = useSearchSelectionActions();

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

                    const itemTransaction = (searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] ??
                        transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`]) as OnyxEntry<Transaction>;
                    const originalItemTransaction =
                        searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`] ??
                        transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                    const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                    const previousSelection = selectedTransactions[listKey] ?? selectedTransactions[transactionItem.transactionID];

                    // The overrides below are what reconcile computes differently from a toggle — keep them.
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

                    newTransactionList[listKey] = {
                        ...baseEntry,
                        isSelected: areAllMatchingItemsSelected || !!previousSelection?.isSelected || propagateSelectionToAllRows,
                        canReject: currentUserEmail && transactionItem.report ? canRejectReportAction(currentUserEmail, transactionItem.report) : false,
                        policyID: transactionItem.report?.policyID,
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

                newTransactionList[listKey] = {
                    ...baseEntry,
                    isSelected: areAllMatchingItemsSelected || !!flatPreviousSelection?.isSelected,
                    canReject: currentUserEmail && transactionItem.report ? canRejectReportAction(currentUserEmail, transactionItem.report) : false,
                    policyID: transactionItem.report?.policyID,
                };
            }
        }
        if (isEmptyObject(newTransactionList) && Object.keys(selectedTransactions).length === 0) {
            return;
        }

        // Bail out when the rebuilt selection is deeply equal to the current one. Without this,
        // a dep that re-derives to a new reference but the same value re-runs this effect, which
        // commits an equivalent payload and loops until React aborts with "Maximum update depth
        // exceeded". See https://github.com/Expensify/App/issues/89588
        if (deepEqual(newTransactionList, selectedTransactions)) {
            return;
        }

        // Commit without `totalSelectableItemsCount` so the select-all flag is left untouched while the data
        // reconcile is in flight (this replaces the former `isRefreshingSelection` guard). `filteredData` is passed
        // so `selectedReports` is derived atomically and a stale `useSyncSelectedReports` derivation can't briefly
        // clear it (which would close screens like SearchChangeApproverPage that dismiss on empty `selectedReports`).
        applySelection(() => newTransactionList, {data: filteredData});
        // `selectedTransactions` is intentionally omitted from the deps and read from closure instead (see the
        // hook doc above): including it would re-run this reconcile on every checkbox press. We only want it to
        // run when the underlying data, focus, or select-all state changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData, applySelection, areAllMatchingItemsSelected, isFocused, outstandingReportsByPolicyID, isExpenseReportType]);
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
    totalSelectableItemsCount,
    searchResults,
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
    const {accountID, email, login} = useCurrentUserPersonalDetails();
    const selfDMReport = useSelfDMReport();
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const {applySelection, getSelectedTransactions} = useSearchSelectionActions();

    // Group-by children load lazily in `GroupChildrenContent`, which publishes them here for the shift-range source.
    const [groupChildrenByKey, setGroupChildrenByKey] = useState<Record<string, TransactionListItemType[]>>({});

    // These stay referentially stable (they close over only setGroupChildrenByKey, so the React Compiler memoizes them). GroupChildrenContent's
    // register effect lists them as deps, so an unstable identity would loop register↔unregister; the compliance gate keeps them stable.
    const registerGroupChildren = (groupKey: string, groupChildren: TransactionListItemType[]) => {
        setGroupChildrenByKey((prev) => (prev[groupKey] === groupChildren ? prev : {...prev, [groupKey]: groupChildren}));
    };
    const unregisterGroupChildren = (groupKey: string) => {
        setGroupChildrenByKey((prev) => {
            if (!(groupKey in prev)) {
                return prev;
            }
            const next = {...prev};
            delete next[groupKey];
            return next;
        });
    };
    const shiftRangeChildrenActions: SearchShiftRangeChildrenActions = {registerGroupChildren, unregisterGroupChildren};

    const searchResultsData = searchResults?.data;
    const currentUserEmail = email ?? '';
    const currentUserLogin = login ?? '';

    // Shared selection-entry builder so the toggle / select-all / range call sites can't drift apart.
    const buildSelectedEntry = (item: TransactionListItemType, itemTransaction: OnyxEntry<Transaction>, originalItemTransaction: OnyxEntry<Transaction>, parentReport: OnyxEntry<Report>) =>
        mapTransactionItemToSelectedEntry({
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

    // Expense-report rows are the selectable unit (never headers); only real group-by rows are separators whose children flatten in.
    const hasValidGroupBy = areItemsGrouped && !isExpenseReportType;
    const flattenedShiftRangeItems = buildShiftRangeItems(filteredData, groupChildrenByKey, hasValidGroupBy);
    const isShiftRangeHeaderItem = (item: SearchData[number]) => isTransactionGroupListItemType(item) && hasValidGroupBy;

    const applyShiftRangeBatch = (batch: ShiftRangeBatch<SearchData[number]>) => {
        applySelection(
            (selectedTransactions) => {
                const updated: SelectedTransactions = {...selectedTransactions};
                const parentGroupKeyByTransactionKey = new Map<string, string>();
                if (areItemsGrouped && isGroupedItemArray(filteredData)) {
                    for (const group of filteredData) {
                        const groupKey = group.keyForList;
                        if (!groupKey) {
                            continue;
                        }
                        for (const child of groupChildrenByKey[groupKey] ?? group.transactions ?? []) {
                            if (child.keyForList) {
                                parentGroupKeyByTransactionKey.set(child.keyForList, groupKey);
                            }
                        }
                    }
                }
                const addTransaction = (tx: TransactionListItemType) => {
                    if (!tx.keyForList || isTransactionPendingDelete(tx)) {
                        return;
                    }
                    const txRef = searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${tx.transactionID}`] ?? transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${tx.transactionID}`];
                    const originalRef =
                        searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${txRef?.comment?.originalTransactionID}`] ??
                        transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${txRef?.comment?.originalTransactionID}`];
                    const parentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${tx.report?.parentReportID}`] as OnyxEntry<Report>;
                    const [key, info] = buildSelectedEntry(tx, txRef as OnyxEntry<Transaction>, originalRef, parentReport);
                    const parentGroupKey = parentGroupKeyByTransactionKey.get(tx.keyForList);
                    updated[key] = parentGroupKey ? {...info, groupKey: parentGroupKey} : info;
                };
                const removeRow = (row: SearchData[number]) => {
                    if (isTransactionListItemType(row) || (isTransactionReportGroupListItemType(row) && row.transactions.length === 0)) {
                        if (row.keyForList) {
                            delete updated[row.keyForList];
                        }
                    } else if (isTransactionGroupListItemType(row)) {
                        for (const child of row.transactions ?? []) {
                            if (child.keyForList) {
                                delete updated[child.keyForList];
                            }
                        }
                    }
                };
                const addRow = (row: SearchData[number]) => {
                    if (isTransactionListItemType(row)) {
                        addTransaction(row);
                    } else if (isTransactionReportGroupListItemType(row) && row.transactions.length === 0) {
                        if (row.keyForList && row.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                            const [key, info] = mapEmptyReportToSelectedEntry(row);
                            updated[key] = info;
                        }
                    } else if (isTransactionGroupListItemType(row)) {
                        for (const child of row.transactions ?? []) {
                            addTransaction(child);
                        }
                    }
                };
                for (const row of batch.toDeselect) {
                    removeRow(row);
                }
                for (const row of batch.toSelect) {
                    addRow(row);
                }
                return updated;
            },
            {data: filteredData, totalSelectableItemsCount},
        );
    };

    const rangeApi = useShiftRangeSelection<SearchData[number]>({
        items: flattenedShiftRangeItems,
        getItemKey: (item) => item.keyForList,
        // So a cold shift+click resolves its anchor from the existing selection instead of the first row.
        getSelectedKeys: () => {
            const selected = getSelectedTransactions();
            return Object.keys(selected).filter((key) => selected[key]?.isSelected);
        },
        isDisabledItem: (item) => isTransactionListItemType(item) && isTransactionPendingDelete(item),
        onApplyRange: applyShiftRangeBatch,
        isHeaderItem: isShiftRangeHeaderItem,
    });

    const toggle: SearchRowSelectionActionsValue['toggle'] = (item, itemTransactions, shiftKey) => {
        if (isReportActionListItemType(item) || isTaskListItemType(item)) {
            return;
        }

        // The hook rejects headers as range targets, so shift+click on one falls through to the group toggle.
        if (rangeApi.applyShiftClick(item, shiftKey)) {
            return;
        }

        if (isShiftRangeHeaderItem(item) && isTransactionGroupListItemType(item)) {
            // A group-header click selects/deselects a whole block; seed a range over the resulting selection so a later shift+click narrows it (like Select-All).
            const groupChildren = groupChildrenByKey[item.keyForList] ?? item.transactions ?? [];
            const selected = getSelectedTransactions();
            const groupWasSelected = groupChildren.some((child) => !!selected[child.keyForList]?.isSelected);
            // The toggle hasn't committed yet, so fold this group's children into the selected set to get the post-click extent.
            const selectedKeys = new Set(Object.keys(selected).filter((key) => selected[key]?.isSelected));
            for (const child of groupChildren) {
                if (!child.keyForList) {
                    continue;
                }
                if (groupWasSelected) {
                    selectedKeys.delete(child.keyForList);
                } else {
                    selectedKeys.add(child.keyForList);
                }
            }
            let firstSelected: SearchData[number] | undefined;
            let lastSelected: SearchData[number] | undefined;
            for (const row of flattenedShiftRangeItems) {
                if (isShiftRangeHeaderItem(row) || !row.keyForList || !selectedKeys.has(row.keyForList)) {
                    continue;
                }
                if (!firstSelected) {
                    firstSelected = row;
                }
                lastSelected = row;
            }
            if (firstSelected && lastSelected) {
                rangeApi.seedRange(firstSelected, lastSelected, false);
            } else {
                rangeApi.clearAnchor();
            }
        } else if (!isShiftRangeHeaderItem(item)) {
            // Non-header rows seed the anchor so a later shift+click continues from here.
            rangeApi.notifyAnchor(item);
        }

        if (isTransactionListItemType(item)) {
            if (!item.keyForList || isTransactionPendingDelete(item)) {
                return;
            }
            applySelection(
                (selectedTransactions) => {
                    const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}`] as OnyxEntry<Transaction>;
                    const originalItemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                    const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${item.report?.parentReportID}`] as OnyxEntry<Report>;
                    const updatedTransactions = prepareTransactionsList({
                        item,
                        itemTransaction,
                        originalItemTransaction,
                        selectedTransactions,
                        currentUserLogin: currentUserEmail,
                        currentUserAccountID: accountID,
                        reportNameValuePairs,
                        outstandingReportsByPolicyID,
                        selfDMReport,
                        isProduction,
                        parentReport: itemParentReport,
                    });

                    // Tag individual transactions with their parent group key so export filtering can derive the group when needed.
                    if (areItemsGrouped && isGroupedItemArray(filteredData)) {
                        const parentGroup = filteredData.find((group) => group.transactions.some((transaction) => transaction.keyForList === item.keyForList));
                        if (parentGroup?.keyForList && updatedTransactions[item.keyForList]) {
                            updatedTransactions[item.keyForList] = {...updatedTransactions[item.keyForList], groupKey: parentGroup.keyForList};
                        }
                    }

                    return updatedTransactions;
                },
                {totalSelectableItemsCount},
            );
            return;
        }

        const currentTransactions = itemTransactions ?? item.transactions;

        applySelection(
            (selectedTransactions) => {
                if (currentTransactions.length === 0 && item.keyForList) {
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

                if (currentTransactions.some((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)) {
                    const reducedSelectedTransactions: SelectedTransactions = {...selectedTransactions};
                    for (const transaction of currentTransactions) {
                        delete reducedSelectedTransactions[transaction.keyForList];
                    }
                    return reducedSelectedTransactions;
                }

                return {
                    ...selectedTransactions,
                    ...Object.fromEntries(
                        currentTransactions
                            .filter((t) => !isTransactionPendingDelete(t))
                            .map((transactionItem) => {
                                const itemTransaction = (searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] ??
                                    transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`]) as OnyxEntry<Transaction>;
                                const originalItemTransaction =
                                    searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`] ??
                                    transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                                const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                                const [key, entry] = buildSelectedEntry(transactionItem, itemTransaction, originalItemTransaction, itemParentReport);
                                return [key, {...entry, groupKey: item.keyForList}];
                            }),
                    ),
                };
            },
            {totalSelectableItemsCount},
        );
    };

    const toggleAll: SearchRowSelectionActionsValue['toggleAll'] = () => {
        // Decide select-all vs clear before the updater so the range seed/clear (a ref write) stays out of the reducer.
        if (Object.keys(getSelectedTransactions()).length > 0) {
            rangeApi.clearAnchor();
        } else {
            rangeApi.seedFullRange();
        }
        applySelection(
            (selectedTransactions) => {
                if (Object.keys(selectedTransactions).length > 0) {
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
                            const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                            const originalItemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                            const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                            const [key, entry] = buildSelectedEntry(transactionItem, itemTransaction, originalItemTransaction, itemParentReport);
                            entries.push([key, {...entry, groupKey: item.keyForList}]);
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
                    const itemTransaction = searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                    const originalItemTransaction = searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                    const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                    entries.push(buildSelectedEntry(transactionItem, itemTransaction, originalItemTransaction, itemParentReport));
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
    });
    useTurnOffSelectionModeWhenEmpty({isFocused, isMobileSelectionModeEnabled});
    useSyncMobileSelectionModeWithScreenSize({isFocused, isMobileSelectionModeEnabled, isSearchResultsEmpty});
    useSyncSelectedReports(filteredData);

    const rowSelectionActionsValue: SearchRowSelectionActionsValue = {toggle, toggleAll};

    return (
        <SearchRowSelectionActionsContext value={rowSelectionActionsValue}>
            <SearchShiftRangeChildrenContext value={shiftRangeChildrenActions}>{children}</SearchShiftRangeChildrenContext>
        </SearchRowSelectionActionsContext>
    );
}

export default SearchWriteActionsProvider;
