import Onyx from 'react-native-onyx';
import {format} from 'date-fns';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import DateUtils from './DateUtils';
import * as NumberUtils from './NumberUtils';

let allTransactions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (val) => {
        if (!val) {
            return;
        }
        allTransactions = val;
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
 * @param {Object} [receipt]
 * @param {String} [existingTransactionID] When creating a distance request, an empty transaction has already been created with a transactionID. In that case, the transaction here needs to have it's transactionID match what was already generated.
 * @returns {Object}
 */
function buildOptimisticTransaction(
    amount,
    currency,
    reportID,
    comment = '',
    source = '',
    originalTransactionID = '',
    merchant = CONST.REPORT.TYPE.IOU,
    receipt = {},
    existingTransactionID = null,
) {
    // transactionIDs are random, positive, 64-bit numeric strings.
    // Because JS can only handle 53-bit numbers, transactionIDs are strings in the front-end (just like reportActionID)
    const transactionID = existingTransactionID || NumberUtils.rand64();

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
        receipt,
    };
}

/**
 * Given the edit made to the money request, return an updated transaction object.
 *
 * @param {Object} transaction
 * @param {Object} transactionChanges
 * @param {Object} isFromExpenseReport
 * @returns {Object}
 */
function getUpdatedTransaction(transaction, transactionChanges, isFromExpenseReport) {
    // Only changing the first level fields so no need for deep clone now
    const updatedTransaction = _.clone(transaction);

    // The comment property does not have its modifiedComment counterpart
    if (_.has(transactionChanges, 'comment')) {
        updatedTransaction.comment = {
            ...updatedTransaction.comment,
            comment: transactionChanges.comment,
        };
    }
    if (_.has(transactionChanges, 'created')) {
        updatedTransaction.modifiedCreated = transactionChanges.created;
    }
    if (_.has(transactionChanges, 'amount')) {
        updatedTransaction.modifiedAmount = isFromExpenseReport ? -transactionChanges.amount : transactionChanges.amount;
    }
    if (_.has(transactionChanges, 'currency')) {
        updatedTransaction.modifiedCurrency = transactionChanges.currency;
    }
    updatedTransaction.pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;

    return updatedTransaction;
}

/**
 * Retrieve the particular transaction object given its ID.
 *
 * @param {String} transactionID
 * @returns {Object}
 */
function getTransaction(transactionID) {
    return lodashGet(allTransactions, `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {});
}

/**
 * Return the comment field (referred to as description in the App) from the transaction.
 * The comment does not have its modifiedComment counterpart.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function getDescription(transaction) {
    return lodashGet(transaction, 'comment.comment', '');
}

/**
 * Return the amount field from the transaction, return the modifiedAmount if present.
 *
 * @param {Object}  transaction
 * @param {Boolean} isFromExpenseReport
 * @returns {Number}
 */
function getAmount(transaction, isFromExpenseReport) {
    // IOU requests cannot have negative values but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport) {
        const amount = lodashGet(transaction, 'modifiedAmount', 0);
        if (amount) {
            return Math.abs(amount);
        }
        return Math.abs(lodashGet(transaction, 'amount', 0));
    }

    // Expense report case:
    // The amounts are stored using an opposite sign and negative values can be set,
    // we need to return an opposite sign than is saved in the transaction object
    let amount = lodashGet(transaction, 'modifiedAmount', 0);
    if (amount) {
        return -amount;
    }

    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    amount = lodashGet(transaction, 'amount', 0);
    return amount ? -amount : 0;
}

/**
 * Return the currency field from the transaction, return the modifiedCurrency if present.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function getCurrency(transaction) {
    const currency = lodashGet(transaction, 'modifiedCurrency', '');
    if (currency) {
        return currency;
    }
    return lodashGet(transaction, 'currency', CONST.CURRENCY.USD);
}

/**
 * Return the created field from the transaction, return the modifiedCreated if present.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function getCreated(transaction) {
    const created = lodashGet(transaction, 'modifiedCreated', '') || lodashGet(transaction, 'created', '');
    if (created) {
        return format(new Date(created), CONST.DATE.FNS_FORMAT_STRING);
    }
    return '';
}

/**
 * Get the details linked to the IOU reportAction
 *
 * @param {Object} reportAction
 * @returns {Object}
 */
function getLinkedTransaction(reportAction = {}) {
    const transactionID = lodashGet(reportAction, ['originalMessage', 'IOUTransactionID'], '');
    return allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] || {};
}

function getAllReportTransactions(reportID) {
    return _.filter(allTransactions, (transaction) => transaction.reportID === reportID);
}

export {buildOptimisticTransaction, getUpdatedTransaction, getTransaction, getDescription, getAmount, getCurrency, getCreated, getLinkedTransaction, getAllReportTransactions};
