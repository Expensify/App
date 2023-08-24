import Onyx from 'react-native-onyx';
import {format, parseISO, isValid} from 'date-fns';
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
        allTransactions = _.pick(val, (transaction) => transaction);
    },
});

/**
 * Optimistically generate a transaction.
 *
 * @param {Number} amount – in cents
 * @param {String} currency
 * @param {String} reportID
 * @param {String} [comment]
 * @param {String} [created]
 * @param {String} [source]
 * @param {String} [originalTransactionID]
 * @param {String} [merchant]
 * @param {Object} [receipt]
 * @param {String} [filename]
 * @param {String} [existingTransactionID] When creating a distance request, an empty transaction has already been created with a transactionID. In that case, the transaction here needs to have it's transactionID match what was already generated.
 * @returns {Object}
 */
function buildOptimisticTransaction(
    amount,
    currency,
    reportID,
    comment = '',
    created = '',
    source = '',
    originalTransactionID = '',
    merchant = CONST.TRANSACTION.DEFAULT_MERCHANT,
    receipt = {},
    filename = '',
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
        merchant: merchant || CONST.TRANSACTION.DEFAULT_MERCHANT,
        created: created || DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        receipt,
        filename,
    };
}

/**
 * @param {Object|null} transaction
 * @returns {Boolean}
 */
function hasReceipt(transaction) {
    return lodashGet(transaction, 'receipt.state', '') !== '';
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
    let shouldStopSmartscan = false;

    // The comment property does not have its modifiedComment counterpart
    if (_.has(transactionChanges, 'comment')) {
        updatedTransaction.comment = {
            ...updatedTransaction.comment,
            comment: transactionChanges.comment,
        };
    }
    if (_.has(transactionChanges, 'created')) {
        updatedTransaction.modifiedCreated = transactionChanges.created;
        shouldStopSmartscan = true;
    }
    if (_.has(transactionChanges, 'amount')) {
        updatedTransaction.modifiedAmount = isFromExpenseReport ? -transactionChanges.amount : transactionChanges.amount;
        shouldStopSmartscan = true;
    }
    if (_.has(transactionChanges, 'currency')) {
        updatedTransaction.modifiedCurrency = transactionChanges.currency;
        shouldStopSmartscan = true;
    }

    if (_.has(transactionChanges, 'merchant')) {
        updatedTransaction.modifiedMerchant = transactionChanges.merchant;
        shouldStopSmartscan = true;
    }

    if (shouldStopSmartscan && _.has(transaction, 'receipt') && !_.isEmpty(transaction.receipt) && lodashGet(transaction, 'receipt.state') !== CONST.IOU.RECEIPT_STATE.OPEN) {
        updatedTransaction.receipt.state = CONST.IOU.RECEIPT_STATE.OPEN;
    }
    updatedTransaction.pendingFields = {
        ...(_.has(transactionChanges, 'comment') && {comment: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(_.has(transactionChanges, 'created') && {created: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(_.has(transactionChanges, 'amount') && {amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(_.has(transactionChanges, 'currency') && {currency: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(_.has(transactionChanges, 'merchant') && {merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
    };

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
 * Return the merchant field from the transaction, return the modifiedMerchant if present.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function getMerchant(transaction) {
    return lodashGet(transaction, 'modifiedMerchant', null) || lodashGet(transaction, 'merchant', '');
}

/**
 * Return the created field from the transaction, return the modifiedCreated if present.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function getCreated(transaction) {
    const created = lodashGet(transaction, 'modifiedCreated', '') || lodashGet(transaction, 'created', '');
    const createdDate = parseISO(created);
    if (isValid(createdDate)) {
        return format(createdDate, CONST.DATE.FNS_FORMAT_STRING);
    }

    return '';
}

/**
 * Get the transactions related to a report preview with receipts
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

function isReceiptBeingScanned(transaction) {
    return transaction.receipt.state === CONST.IOU.RECEIPT_STATE.SCANREADY || transaction.receipt.state === CONST.IOU.RECEIPT_STATE.SCANNING;
}

/**
 * Verifies that the provided waypoints are valid
 * @param {Object} waypoints
 * @returns {Boolean}
 */
function validateWaypoints(waypoints) {
    const waypointValues = _.values(waypoints);

    // Ensure the number of waypoints is between 2 and 25
    if (waypointValues.length < 2 || waypointValues.length > 25) {
        return false;
    }

    for (let i = 0; i < waypointValues.length; i++) {
        const currentWaypoint = waypointValues[i];
        const previousWaypoint = waypointValues[i - 1];

        // Check if the waypoint has a valid address
        if (!currentWaypoint || !currentWaypoint.address || typeof currentWaypoint.address !== 'string' || currentWaypoint.address.trim() === '') {
            return false;
        }

        // Check for adjacent waypoints with the same address
        if (previousWaypoint && currentWaypoint.address === previousWaypoint.address) {
            return false;
        }
    }

    return true;
}

/*
 * @param {Object} transaction
 * @param {Object} transaction.comment
 * @param {String} transaction.comment.type
 * @param {Object} [transaction.comment.customUnit]
 * @param {String} [transaction.comment.customUnit.name]
 * @returns {Boolean}
 */
function isDistanceRequest(transaction) {
    const type = lodashGet(transaction, 'comment.type');
    const customUnitName = lodashGet(transaction, 'comment.customUnit.name');
    return type === CONST.TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST.CUSTOM_UNITS.NAME_DISTANCE;
}

export {
    buildOptimisticTransaction,
    getUpdatedTransaction,
    getTransaction,
    getDescription,
    getAmount,
    getCurrency,
    getMerchant,
    getCreated,
    getLinkedTransaction,
    getAllReportTransactions,
    hasReceipt,
    isReceiptBeingScanned,
    validateWaypoints,
    isDistanceRequest,
};
