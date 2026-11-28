import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

/**
 * Whether the server rejected the request that creates this expense. The failure data of a create keeps the expense
 * pending as added and sets its error, so the user can retry or dismiss it. Until then the server has no such expense,
 * and any change sent for it, such as moving it to a report, is rejected too.
 */
function hasCreateFailed(transaction: OnyxInputOrEntry<Pick<Transaction, 'pendingAction' | 'errors'>>): boolean {
    return transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyObject(transaction.errors);
}

export default hasCreateFailed;
