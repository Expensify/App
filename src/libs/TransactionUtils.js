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
 * @param {String} [category]
 * @param {String} [tag]
 * @param {Boolean} [billable]
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
    merchant = '',
    receipt = {},
    filename = '',
    existingTransactionID = null,
    category = '',
    tag = '',
    billable = false,
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

    // For the SmartScan to run successfully, we need to pass the merchant field empty to the API
    const defaultMerchant = _.isEmpty(receipt) ? CONST.TRANSACTION.DEFAULT_MERCHANT : '';

    return {
        transactionID,
        amount,
        currency,
        reportID,
        comment: commentJSON,
        merchant: merchant || defaultMerchant,
        created: created || DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        receipt,
        filename,
        category,
        tag,
        billable,
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
 * @param {Object} transaction
 * @returns {Boolean}
 */
function areRequiredFieldsEmpty(transaction) {
    return (
        transaction.modifiedMerchant === CONST.TRANSACTION.UNKNOWN_MERCHANT ||
        transaction.modifiedMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ||
        (transaction.modifiedMerchant === '' &&
            (transaction.merchant === CONST.TRANSACTION.UNKNOWN_MERCHANT || transaction.merchant === '' || transaction.merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT)) ||
        (transaction.modifiedAmount === 0 && transaction.amount === 0) ||
        (transaction.modifiedCreated === '' && transaction.created === '')
    );
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

    if (_.has(transactionChanges, 'waypoints')) {
        updatedTransaction.modifiedWaypoints = transactionChanges.waypoints;
        shouldStopSmartscan = true;
    }

    if (_.has(transactionChanges, 'billable')) {
        updatedTransaction.billable = transactionChanges.billable;
    }

    if (_.has(transactionChanges, 'category')) {
        updatedTransaction.category = transactionChanges.category;
    }

    if (_.has(transactionChanges, 'tag')) {
        updatedTransaction.tag = transactionChanges.tag;
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
        ...(_.has(transactionChanges, 'waypoints') && {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(_.has(transactionChanges, 'billable') && {billable: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(_.has(transactionChanges, 'category') && {category: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(_.has(transactionChanges, 'tag') && {tag: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
    };

    return updatedTransaction;
}

/**
 * Retrieve the particular transaction object given its ID.
 *
 * @param {String} transactionID
 * @returns {Object}
 * @deprecated Use withOnyx() or Onyx.connect() instead
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
 * Return the waypoints field from the transaction, return the modifiedWaypoints if present.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function getWaypoints(transaction) {
    return lodashGet(transaction, 'modifiedWaypoints', null) || lodashGet(transaction, ['comment', 'waypoints']);
}

/**
 * Return the category from the transaction. This "category" field has no "modified" complement.
 *
 * @param {Object} transaction
 * @return {String}
 */
function getCategory(transaction) {
    return lodashGet(transaction, 'category', '');
}

/**
 * Return the billable field from the transaction. This "billable" field has no "modified" complement.
 *
 * @param {Object} transaction
 * @return {Boolean}
 */
function getBillable(transaction) {
    return lodashGet(transaction, 'billable', false);
}

/**
 * Return the tag from the transaction. This "tag" field has no "modified" complement.
 *
 * @param {Object} transaction
 * @return {String}
 */
function getTag(transaction) {
    return lodashGet(transaction, 'tag', '');
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

function isReceiptBeingScanned(transaction) {
    return _.contains([CONST.IOU.RECEIPT_STATE.SCANREADY, CONST.IOU.RECEIPT_STATE.SCANNING], transaction.receipt.state);
}

/**
 * Check if the transaction has a non-smartscanning receipt and is missing required fields
 *
 * @param {Object} transaction
 * @returns {Boolean}
 */
function hasMissingSmartscanFields(transaction) {
    return hasReceipt(transaction) && !isDistanceRequest(transaction) && !isReceiptBeingScanned(transaction) && areRequiredFieldsEmpty(transaction);
}

/**
 * Check if the transaction has a defined route
 *
 * @param {Object} transaction
 * @returns {Boolean}
 */
function hasRoute(transaction) {
    return !!lodashGet(transaction, 'routes.route0.geometry.coordinates');
}

/**
 * Get the transactions related to a report preview with receipts
 * Get the details linked to the IOU reportAction
 *
 * @param {Object} reportAction
 * @returns {Object}
 * @deprecated Use Onyx.connect() or withOnyx() instead
 */
function getLinkedTransaction(reportAction = {}) {
    const transactionID = lodashGet(reportAction, ['originalMessage', 'IOUTransactionID'], '');
    return allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] || {};
}

function getAllReportTransactions(reportID) {
    // `reportID` from the `/CreateDistanceRequest` endpoint return's number instead of string for created `transaction`.
    // For reference, https://github.com/Expensify/App/pull/26536#issuecomment-1703573277.
    // We will update this in a follow-up Issue. According to this comment: https://github.com/Expensify/App/pull/26536#issuecomment-1703591019.
    return _.filter(allTransactions, (transaction) => `${transaction.reportID}` === `${reportID}`);
}

/**
 * Checks if a waypoint has a valid address
 * @param {Object} waypoint
 * @returns {Boolean} Returns true if the address is valid
 */
function waypointHasValidAddress(waypoint) {
    if (!waypoint || !waypoint.address || typeof waypoint.address !== 'string' || waypoint.address.trim() === '') {
        return false;
    }
    return true;
}

/**
 * Converts the key of a waypoint to its index
 * @param {String} key
 * @returns {Number} waypoint index
 */
function getWaypointIndex(key) {
    return Number(key.replace('waypoint', ''));
}

/**
 * Filters the waypoints which are valid and returns those
 * @param {Object} waypoints
 * @param {Boolean} reArrangeIndexes
 * @returns {Object} validated waypoints
 */
function getValidWaypoints(waypoints, reArrangeIndexes = false) {
    const sortedIndexes = _.map(_.keys(waypoints), (key) => getWaypointIndex(key)).sort();
    const waypointValues = _.map(sortedIndexes, (index) => waypoints[`waypoint${index}`]);
    // Ensure the number of waypoints is between 2 and 25
    if (waypointValues.length < 2 || waypointValues.length > 25) {
        return {};
    }

    let lastWaypointIndex = -1;

    const validWaypoints = _.reduce(
        waypointValues,
        (acc, currentWaypoint, index) => {
            const previousWaypoint = waypointValues[lastWaypointIndex];
            // Check if the waypoint has a valid address
            if (!waypointHasValidAddress(currentWaypoint)) {
                return acc;
            }

            // Check for adjacent waypoints with the same address
            if (previousWaypoint && currentWaypoint.address === previousWaypoint.address) {
                return acc;
            }

            const validatedWaypoints = {...acc, [`waypoint${reArrangeIndexes ? lastWaypointIndex + 1 : index}`]: currentWaypoint};

            lastWaypointIndex += 1;

            return validatedWaypoints;
        },
        {},
    );
    return validWaypoints;
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
    getCategory,
    getBillable,
    getTag,
    getLinkedTransaction,
    getAllReportTransactions,
    hasReceipt,
    hasRoute,
    isReceiptBeingScanned,
    getValidWaypoints,
    isDistanceRequest,
    getWaypoints,
    hasMissingSmartscanFields,
    getWaypointIndex,
    waypointHasValidAddress,
};
