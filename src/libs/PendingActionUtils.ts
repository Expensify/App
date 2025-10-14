import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type TransactionWithPendingAction = {
    pendingAction?: PendingAction;
};

/**
 * Resolves the appropriate pending action for visual feedback in the UI.
 * This function properly maps data-level pending actions to visual feedback states,
 * ensuring that operations like splits show correct pending states (update) rather than
 * incorrectly showing delete states with strikethrough styling.
 *
 * @param itemPendingAction - The pending action on the item itself
 * @param transactions - Array of transactions that may have their own pending actions
 * @returns The resolved pending action for visual feedback, or undefined if no pending action
 */
function resolvePendingActionForVisualFeedback(
    itemPendingAction: OnyxEntry<PendingAction>,
    transactions?: TransactionWithPendingAction[],
): PendingAction | undefined {
    // If the item itself has a pending action, use it directly
    // This ensures 'update' stays as 'update', 'add' stays as 'add', etc.
    if (itemPendingAction) {
        return itemPendingAction;
    }

    // If no item-level pending action but we have transactions,
    // check if ALL transactions are being deleted
    if (transactions && transactions.length > 0) {
        const allTransactionsBeingDeleted = transactions.every(
            (transaction) => transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );

        if (allTransactionsBeingDeleted) {
            return CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        }
    }

    // No pending action
    return undefined;
}

export default resolvePendingActionForVisualFeedback;
export type {TransactionWithPendingAction};
