import CONST from '../CONST';
import DateUtils from './DateUtils';
import * as NumberUtils from './NumberUtils';

/**
 * Optimistically generate a transaction.
 *
 * @param {Number} amount – in cents
 * @param {String} currency
 * @param {String} comment
 */
function buildOptimisticTransaction(amount, currency, comment = '') {
    // transactionIDs are random, positive, 64-bit numbers.
    // Because JS can only handle 53-bit numbers, transactionIDs are strings in the front-end (just like reportActionID)
    const transactionID = NumberUtils.rand64();
    const created = DateUtils.getDBTime();
    return {
        transactionID,
        amount,
        comment,
        created,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}

export default {
    buildOptimisticTransaction,
};
