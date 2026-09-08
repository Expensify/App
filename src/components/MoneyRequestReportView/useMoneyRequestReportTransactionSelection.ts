import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';

import useHandleSelectionMode from '@hooks/useHandleSelectionMode';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';

import {navigationRef} from '@libs/Navigation/Navigation';
import {getTransactionPendingAction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import {useFocusEffect} from '@react-navigation/native';
import {useEffect} from 'react';

type GroupSelectionState = {
    isSelected: boolean;
    isIndeterminate: boolean;
    isDisabled: boolean;
    pendingAction?: PendingAction;
};

type UseMoneyRequestReportTransactionSelectionParams = {
    /** ID of the report the transactions belong to — selection is cleared when it changes */
    reportID: string | undefined;

    /** Transactions bucketed by the current group-by attribute; empty when grouping is off */
    groupedTransactions: OnyxTypes.GroupedTransactions[];
};

type UseMoneyRequestReportTransactionSelectionResult = {
    /** Whether mobile selection mode is enabled */
    isMobileSelectionModeEnabled: boolean;

    /** Adds or removes a single transaction from the selection */
    toggleTransaction: (transactionID: string) => void;

    /** Whether a transaction is currently selected */
    isTransactionSelected: (transactionID: string) => boolean;

    /** groupKey → checkbox state of the group's section header */
    groupSelectionState: Map<string, GroupSelectionState>;

    /** Selects or deselects all selectable transactions of a group */
    toggleGroupSelection: (groupKey: string) => void;
};

/**
 * Owns the transaction-selection concern of the money-request report view: single/group toggles, the
 * per-group checkbox state, and clearing the selection when the user leaves the screen or switches reports.
 */
function useMoneyRequestReportTransactionSelection({reportID, groupedTransactions}: UseMoneyRequestReportTransactionSelectionParams): UseMoneyRequestReportTransactionSelectionResult {
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
        // We don't want to run the effect on change of clearSelectedTransactions since it can cause an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportID]);

    const toggleTransaction = (transactionID: string) => {
        let newSelectedTransactionIDs = selectedTransactionIDs;
        if (selectedTransactionIDs.includes(transactionID)) {
            newSelectedTransactionIDs = selectedTransactionIDs.filter((t) => t !== transactionID);
        } else {
            newSelectedTransactionIDs = [...selectedTransactionIDs, transactionID];
        }
        setSelectedTransactions(newSelectedTransactionIDs);
    };

    const isTransactionSelected = (transactionID: string) => selectedTransactionIDs.includes(transactionID);

    const groupSelectionState = new Map<string, GroupSelectionState>();
    for (const group of groupedTransactions) {
        const groupTransactionIDs = group.transactions.filter((t) => !isTransactionPendingDelete(t)).map((t) => t.transactionID);
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
        const groupTransactionIDs = group.transactions.filter((t) => !isTransactionPendingDelete(t)).map((t) => t.transactionID);
        const anySelected = groupTransactionIDs.some((id) => selectedTransactionIDs.includes(id));

        let newSelectedTransactionIDs = selectedTransactionIDs;
        if (anySelected) {
            newSelectedTransactionIDs = selectedTransactionIDs.filter((id) => !groupTransactionIDs.includes(id));
        } else {
            newSelectedTransactionIDs = [...selectedTransactionIDs, ...groupTransactionIDs];
        }
        setSelectedTransactions(newSelectedTransactionIDs);
    };

    return {
        isMobileSelectionModeEnabled,
        toggleTransaction,
        isTransactionSelected,
        groupSelectionState,
        toggleGroupSelection,
    };
}

export default useMoneyRequestReportTransactionSelection;
