import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';

import useHandleSelectionMode from '@hooks/useHandleSelectionMode';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';

import {isSelectableReportTransaction} from '@libs/MoneyRequestReportUtils';
import {navigationRef} from '@libs/Navigation/Navigation';
import {getTransactionPendingAction} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import {useFocusEffect} from '@react-navigation/native';
import {useEffect} from 'react';

import useReportTransactionShiftRange from './useReportTransactionShiftRange';

type GroupSelectionState = {
    isSelected: boolean;
    isIndeterminate: boolean;
    isDisabled: boolean;
    pendingAction?: PendingAction;
};

type UseMoneyRequestReportTransactionSelectionParams = {
    /** ID of the report the transactions belong to. Selection is cleared when it changes. */
    reportID: string | undefined;

    /** Transactions bucketed by the current group-by attribute. Empty when grouping is off. */
    groupedTransactions: OnyxTypes.GroupedTransactions[];

    /** Every transaction in the order the list renders it, grouped or not, which is the order a shift+click range spans */
    visualOrderTransactions: OnyxTypes.Transaction[];
};

type UseMoneyRequestReportTransactionSelectionResult = {
    /** Whether mobile selection mode is enabled */
    isMobileSelectionModeEnabled: boolean;

    /** Adds or removes a single transaction from the selection, or extends a range when the click carried Shift */
    toggleTransaction: (transactionID: string, shiftKey?: boolean) => void;

    /** Whether a transaction is currently selected */
    isTransactionSelected: (transactionID: string) => boolean;

    /** groupKey → checkbox state of the group's section header */
    groupSelectionState: Map<string, GroupSelectionState>;

    /** Selects or deselects all selectable transactions of a group */
    toggleGroupSelection: (groupKey: string) => void;

    /** The transactions Select All writes, in list order */
    selectableTransactionIDs: string[];

    /** Selects every selectable transaction, or clears the selection when anything is already selected */
    toggleAll: () => void;
};

/**
 * Owns the transaction-selection concern of the money-request report view: single/group/all toggles, the
 * per-group checkbox state, and clearing the selection when the user leaves the screen or switches reports.
 */
function useMoneyRequestReportTransactionSelection({
    reportID,
    groupedTransactions,
    visualOrderTransactions,
}: UseMoneyRequestReportTransactionSelectionParams): UseMoneyRequestReportTransactionSelectionResult {
    const {selectedTransactionIDs} = useSearchSelectionContext();
    const {setSelectedTransactions, clearSelectedTransactions} = useSearchSelectionActions();
    useHandleSelectionMode(selectedTransactionIDs);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    useFocusEffect(() => {
        return () => {
            if (navigationRef?.getRootState()?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
                return;
            }
            clearSelectedTransactions(true);
        };
    });

    useEffect(() => {
        clearSelectedTransactions(true);
    }, [reportID, clearSelectedTransactions]);

    const {toggleTransaction, toggleGroup, toggleAll} = useReportTransactionShiftRange({
        reportID,
        transactions: visualOrderTransactions,
        selectedTransactionIDs,
        setSelectedTransactions,
        clearSelectedTransactions,
    });

    const isTransactionSelected = (transactionID: string) => selectedTransactionIDs.includes(transactionID);

    // Narrower than the rows the list renders: a rejected expense still renders and opens, but no checkbox can hold it.
    const selectableTransactionIDs = visualOrderTransactions.filter(isSelectableReportTransaction).map((transaction) => transaction.transactionID);

    const groupSelectionState = new Map<string, GroupSelectionState>();
    for (const group of groupedTransactions) {
        const groupTransactionIDs = group.transactions.filter(isSelectableReportTransaction).map((t) => t.transactionID);
        const groupPendingAction = group.transactions.some((t) => getTransactionPendingAction(t)) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined;

        if (groupTransactionIDs.length === 0) {
            groupSelectionState.set(group.groupKey, {isSelected: false, isIndeterminate: false, isDisabled: true, pendingAction: groupPendingAction});
            continue;
        }

        const selectedCount = groupTransactionIDs.filter((id) => selectedTransactionIDs.includes(id)).length;
        groupSelectionState.set(group.groupKey, {
            isSelected: selectedCount === groupTransactionIDs.length,
            isIndeterminate: selectedCount > 0 && selectedCount < groupTransactionIDs.length,
            isDisabled: false,
            pendingAction: groupPendingAction,
        });
    }

    const toggleGroupSelection = (groupKey: string) => {
        const group = groupedTransactions.find((g) => g.groupKey === groupKey);
        if (!group) {
            return;
        }
        toggleGroup(group.transactions.filter(isSelectableReportTransaction).map((t) => t.transactionID));
    };

    return {
        isMobileSelectionModeEnabled,
        toggleTransaction,
        isTransactionSelected,
        groupSelectionState,
        toggleGroupSelection,
        selectableTransactionIDs,
        toggleAll: () => toggleAll(selectableTransactionIDs),
    };
}

export default useMoneyRequestReportTransactionSelection;
