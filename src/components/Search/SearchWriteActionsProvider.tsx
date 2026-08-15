import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useShiftRangeSelection from '@hooks/useShiftRangeSelection';

import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
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
import type {SearchResults, Transaction} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useRef} from 'react';

import type {SearchListItem, TransactionListItemType} from './SearchList/ListItem/types';
import type {SearchData, SearchRowSelectionActionsValue, SelectedTransactionInfo, SelectedTransactions} from './types';

import useOpenGroupsRegistry from './hooks/useOpenGroupsRegistry';
import useReconcileSelectionWithData from './hooks/useReconcileSelectionWithData';
import {useSearchSelectionActions, useSearchSelectionContext} from './SearchContext';
import {SearchRowSelectionActionsContext, SearchShiftRangeGroupsContext} from './SearchContextDefinitions';
import {useSyncSelectedReports} from './SearchSelectionProvider';
import {
    buildShiftRangeSource,
    countFullyExcludedItems,
    createSearchLookups,
    isGroupSelected,
    isRowChecked,
    mapEmptyReportToSelectedEntry,
    mapTransactionItemToSelectedEntry,
    prepareTransactionsList,
} from './selectionBuilders';

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

    // Shared with the reconcile pass, so a row's action flags can't differ by selection gesture.
    const {readTransaction, readSnapshotReport} = createSearchLookups({searchResultsData, transactions});

    const resolveTransactionRefs = (item: TransactionListItemType) => {
        const itemTransaction = readTransaction(item.transactionID);
        return {
            itemTransaction,
            originalItemTransaction: readTransaction(itemTransaction?.comment?.originalTransactionID),
            parentReport: readSnapshotReport(item.report?.parentReportID),
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

    // Every write path has to agree on this: a deselection is recorded as an exclusion only where the backend can be told about it.
    const canRecordExclusions = type === CONST.SEARCH.DATA_TYPES.EXPENSE;

    // One exit rule for every selection commit, so a change to it cannot miss a call site.
    const commitOptions = {
        totalSelectableItemsCount,
        shouldPreserveAllMatchingSelection: canRecordExclusions,
        shouldClearAllMatchingSelectionWhenEmpty: isOffline || searchResults?.search?.hasMoreResults === false,
        countFullyExcludedItems: (excludedTransactions: SelectedTransactions) => countFullyExcludedItems(filteredData, excludedTransactions, areItemsGrouped),
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

    // A row checked by select-all-matching alone has no entry to remove, so deselecting it can only be recorded as an exclusion.
    const buildExclusionForCheckedRowWithoutEntry = (row: SearchData[number]): SelectedTransactions => {
        if (!isTransactionListItemType(row) || !row.keyForList) {
            return {};
        }
        // Only select-all-matching can express a deselection as an exclusion. A group selected on its own is written out instead.
        if (!canRecordExclusions || !getAreAllMatchingItemsSelected() || isTransactionPendingDelete(row)) {
            return {};
        }
        const selectedTransactions = getSelectedTransactions();
        const parentGroupKey = groupKeyByChildKeyRef.current.get(row.keyForList);
        const isChecked = isRowChecked({
            rowKey: row.keyForList,
            parentGroupKey,
            selectedTransactions,
            excludedTransactions: getExcludedTransactions(),
            areAllMatchingItemsSelected: getAreAllMatchingItemsSelected(),
        });
        // An entry of its own is removed by the ordinary diff, so only rows checked purely by the wider selection need naming.
        if (!isChecked || selectedTransactions[row.keyForList]?.isSelected) {
            return {};
        }
        const [key, info] = buildSelectedEntry(row);
        return {[key]: parentGroupKey ? {...info, groupKey: parentGroupKey} : info};
    };

    const applyShiftRangeBatch = (batch: ShiftRangeBatch<SearchData[number]>) => {
        // Same rule as a plain click, for the rows a range gives back.
        const rangeExclusions: SelectedTransactions = {};
        for (const row of batch.toDeselect) {
            Object.assign(rangeExclusions, buildExclusionForCheckedRowWithoutEntry(row));
        }
        applySelection(
            (selectedTransactions) => {
                let updated: SelectedTransactions = {...selectedTransactions};
                // `blockGroupKey` is set only when a whole group row joins the range, which is what makes its children narrowable later.
                const addTransaction = (tx: TransactionListItemType, blockGroupKey: string | undefined) => {
                    if (!tx.keyForList || isTransactionPendingDelete(tx)) {
                        return;
                    }
                    updated = spellOutGroupSelection(updated, tx.keyForList);
                    const [key, info] = buildSelectedEntry(tx);
                    const parentGroupKey = blockGroupKey ?? groupKeyByChildKeyRef.current.get(tx.keyForList);
                    updated[key] = parentGroupKey ? {...info, groupKey: parentGroupKey, isSelectedViaGroup: !!blockGroupKey} : info;
                };
                const removeRow = (row: SearchData[number]) => {
                    if (isTransactionListItemType(row) || (isTransactionReportGroupListItemType(row) && row.transactions.length === 0)) {
                        if (row.keyForList) {
                            updated = spellOutGroupSelection(updated, row.keyForList);
                            delete updated[row.keyForList];
                        }
                        return;
                    }
                    if (isTransactionGroupListItemType(row)) {
                        // Mirrors the group toggle: a group can hold an entry under its own key as well as under its children's.
                        if (row.keyForList) {
                            delete updated[row.keyForList];
                        }
                        for (const child of row.transactions ?? []) {
                            if (child.keyForList) {
                                delete updated[child.keyForList];
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
                            updated[key] = info;
                        }
                    } else if (isTransactionGroupListItemType(row)) {
                        // The children carry the selection once they are here, the same as the group toggle: leaving the group's own entry behind would count it twice.
                        if (row.keyForList && row.transactions.length > 0) {
                            delete updated[row.keyForList];
                        }
                        for (const child of row.transactions ?? []) {
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
                return updated;
            },
            {...commitOptions, data: filteredData, deselectedWithoutEntry: rangeExclusions},
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
            } else {
                // Seed just this block: seeding the whole selection would span unrelated rows and deselect them.
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
            const clickExclusion = buildExclusionForCheckedRowWithoutEntry(item);
            applySelection(
                (selectedTransactions) => {
                    // Checked by a wider selection, so there is no entry to remove and adding one would check it twice.
                    if (!isEmptyObject(clickExclusion)) {
                        return selectedTransactions;
                    }
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
                },
                {...commitOptions, deselectedWithoutEntry: clickExclusion},
            );
            return;
        }

        // Deselecting a group has to give back the rows a wider selection covers, the same way deselecting one of them by hand does.
        const groupExclusions: SelectedTransactions = {};
        if (isGroupSelected(groupSelectionParams(item.keyForList, groupTransactions))) {
            // Naming only the rows it happens to hold would leave the rest of the group selected, so a group that is not all here is excluded whole.
            const totalCount = isTransactionGroupListItemType(item) && 'count' in item && typeof item.count === 'number' ? item.count : undefined;
            const isExcludedWhole = canRecordExclusions && getAreAllMatchingItemsSelected() && totalCount !== undefined && groupTransactions.length < totalCount;
            if (isExcludedWhole) {
                const [groupKey, groupEntry] = mapEmptyReportToSelectedEntry(item);
                groupExclusions[groupKey] = groupEntry;
            } else {
                // Skipped above because the group's own key already stands for these rows, and building them would only be work the commit discards.
                for (const child of groupTransactions) {
                    Object.assign(groupExclusions, buildExclusionForCheckedRowWithoutEntry(child));
                }
            }
        }

        applySelection(
            (selectedTransactions) => {
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
            },
            {...commitOptions, deselectedWithoutEntry: groupExclusions},
        );
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
            {
                ...commitOptions,
                data: filteredData,
                // Selecting the page covers rows that were excluded, so the exclusions go with it. Clearing must not preserve them.
                shouldPreserveAllMatchingSelection: !isClearing && canRecordExclusions,
            },
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
