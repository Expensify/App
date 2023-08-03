import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import DateUtils from './DateUtils';
import * as NumberUtils from './NumberUtils';
import * as CollectionUtils from './CollectionUtils';

const allTransactions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    callback: (transaction, key) => {
        if (!key || !transaction) {
            return;
        }

        const transactionID = CollectionUtils.extractCollectionItemID(key);
        allTransactions[transactionID] = transaction;
    },
});

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
 * @returns {Object}
 */
function buildOptimisticTransaction(amount, currency, reportID, comment = '', source = '', originalTransactionID = '', merchant = CONST.REPORT.TYPE.IOU) {
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
    };
}

/**
 * Given the edit made to the money request, return an updated transaction object.
 *
 * @param {Object} transaction
 * @param {Object} transactionChanges
 * @returns {Object}
 */
function getUpdatedTransaction(transaction, transactionChanges) {
    const updatedTransaction = {...transaction};

    // The comment property does not have its modifiedComment counterpart
    if (_.has(transactionChanges, 'comment')) {
        updatedTransaction['comment'] = {
            ...updatedTransaction.comment,
            comment: transactionChanges.comment,
        };
    }
    if (_.has(transactionChanges, 'created')) {
        updatedTransaction['modifiedCreated'] = transactionChanges.created;
    }
    if (_.has(transactionChanges, 'amount')) {
        updatedTransaction['modifiedAmount'] = transactionChanges.amount;
    }
    if (_.has(transactionChanges, 'currency')) {
        updatedTransaction['modifiedCurrency'] = transactionChanges.currency;
    }
    updatedTransaction['pendingAction'] = CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;

    return updatedTransaction;
}

/**
 * Retrieve the particular transaction object given its ID.
 *
 * @param {String} transactionID
 * @returns {Object}
 */
function getTransaction(transactionID) {
    return lodashGet(allTransactions, [transactionID], {});
}

/**
 * Return the comment (in other words description) from the transaction object.
 * The comment does not have its modifiedComment counterpart.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function getDescription(transaction) {
    return lodashGet(transaction, 'comment.comment', '');
}

/**
 * Return the amount from the transaction, take the modifiedAmount if present.
 *
 * @param {Object} transaction
 * @returns {Number}
 */
function getAmount(transaction) {
    const amount = lodashGet(transaction, 'modifiedAmount', 0);
    if (amount) {
        return amount;
    }
    return lodashGet(transaction, 'amount', 0);
}

/**
 * Return the currency from the transaction, take the modifiedCurrency if present.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function getCurrency(transaction) {
    const currency = lodashGet(transaction, 'modifiedCurrency', '');
    if (currency) {
        return currency;
    }
    return lodashGet(transaction, 'currency', '');
}

/**
 * Return the created from the transaction, take the modifiedCreated if present.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function getCreated(transaction) {
    const created = lodashGet(transaction, 'modifiedCreated', '');
    if (created) {
        return created;
    }
    return lodashGet(transaction, 'created', '');
}

export {buildOptimisticTransaction, getUpdatedTransaction, getTransaction, getDescription, getAmount, getCurrency, getCreated};
