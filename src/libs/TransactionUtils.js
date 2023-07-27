import CONST from '../CONST';
import DateUtils from './DateUtils';
import * as NumberUtils from './NumberUtils';

/**
 * Optimistically generate a receipt.
 *
 * @param {Object} receipt 
 * @returns {Object}
 */
function buildOptimisticReceipt(receipt) {
    return ({
        receiptID: NumberUtils.rand64(),
        source: receipt.source,
        state: CONST.IOU.RECEIPT_STATE.SCANREADY,
    });
}

/**
 * Optimistically generate a transaction.
 *
 * @param {Number} amount – in cents
 * @param {String} currency
 * @param {String} reportID
 * @param {String} [comment]
 * @param {String} [source]
 * @param {String} [originalTransactionID]
 * @param {String} [merchant]
 * @param {Object} [receipt]
 * @returns {Object}
 */
function buildOptimisticTransaction(amount, currency, reportID, comment = '', source = '', originalTransactionID = '', merchant = CONST.REPORT.TYPE.IOU, receipt = undefined) {
    // transactionIDs are random, positive, 64-bit numeric strings.
    // Because JS can only handle 53-bit numbers, transactionIDs are strings in the front-end (just like reportActionID)
    const transactionID = NumberUtils.rand64();

    const commentJSON = {comment};
    if (source) {
        commentJSON.source = source;
    }
    if (originalTransactionID) {
        commentJSON.originalTransactionID = originalTransactionID;
    }

    return {
        transactionID,
        amount,
        currency,
        reportID,
        comment: commentJSON,
        merchant,
        created: DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        ...(receipt ? {receipt: buildOptimisticReceipt(receipt)} : {}),
    };
}

export default {
    buildOptimisticTransaction,
    buildOptimisticReceipt,
};
