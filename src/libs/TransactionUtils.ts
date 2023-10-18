import Onyx, {OnyxCollection} from 'react-native-onyx';
import {format, parseISO, isValid} from 'date-fns';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import DateUtils from './DateUtils';
import {isExpensifyCard} from './CardUtils';
import * as NumberUtils from './NumberUtils';
import {RecentWaypoint, ReportAction, Transaction} from '../types/onyx';
import {Receipt, Comment, WaypointCollection, Waypoint} from '../types/onyx/Transaction';

type AdditionalTransactionChanges = {comment?: string; waypoints?: WaypointCollection};

type TransactionChanges = Partial<Transaction> & AdditionalTransactionChanges;

let allTransactions: OnyxCollection<Transaction> = {};

Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        allTransactions = Object.fromEntries(Object.entries(value).filter(([, transaction]) => !!transaction));
    },
});

/**
 * Optimistically generate a transaction.
 *
 * @param amount – in cents
 * @param [existingTransactionID] When creating a distance request, an empty transaction has already been created with a transactionID. In that case, the transaction here needs to have it's transactionID match what was already generated.
 */
function buildOptimisticTransaction(
    amount: number,
    currency: string,
    reportID: string,
    comment = '',
    created = '',
    source = '',
    originalTransactionID = '',
    merchant = '',
    receipt: Receipt = {},
    filename = '',
    existingTransactionID: string | null = null,
    category = '',
    tag = '',
    billable = false,
): Transaction {
    // transactionIDs are random, positive, 64-bit numeric strings.
    // Because JS can only handle 53-bit numbers, transactionIDs are strings in the front-end (just like reportActionID)
    const transactionID = existingTransactionID ?? NumberUtils.rand64();

    const commentJSON: Comment = {comment};
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
        category,
        tag,
        billable,
    };
}

/**
 * Check if the transaction has an Ereceipt
 */
function hasEReceipt(transaction: Transaction | undefined | null): boolean {
    return !!transaction?.hasEReceipt;
}

function hasReceipt(transaction: Transaction | undefined | null): boolean {
    return !!transaction?.receipt?.state || hasEReceipt(transaction);
}

function isMerchantMissing(transaction: Transaction) {
    const isMerchantEmpty =
        transaction.merchant === CONST.TRANSACTION.UNKNOWN_MERCHANT || transaction.merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || transaction.merchant === '';

    const isModifiedMerchantEmpty =
        !transaction.modifiedMerchant ||
        transaction.modifiedMerchant === CONST.TRANSACTION.UNKNOWN_MERCHANT ||
        transaction.modifiedMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ||
        transaction.modifiedMerchant === '';

    return isMerchantEmpty && isModifiedMerchantEmpty;
}

function isAmountMissing(transaction: Transaction) {
    return transaction.amount === 0 && (!transaction.modifiedAmount || transaction.modifiedAmount === 0);
}

function isCreatedMissing(transaction: Transaction) {
    return transaction.created === '' && (!transaction.created || transaction.modifiedCreated === '');
}

function areRequiredFieldsEmpty(transaction: Transaction): boolean {
    return isMerchantMissing(transaction) || isAmountMissing(transaction) || isCreatedMissing(transaction);
}

/**
 * Given the edit made to the money request, return an updated transaction object.
 */
function getUpdatedTransaction(transaction: Transaction, transactionChanges: TransactionChanges, isFromExpenseReport: boolean, shouldUpdateReceiptState = true): Transaction {
    // Only changing the first level fields so no need for deep clone now
    const updatedTransaction = {...transaction};
    let shouldStopSmartscan = false;

    // The comment property does not have its modifiedComment counterpart
    if (Object.hasOwn(transactionChanges, 'comment')) {
        updatedTransaction.comment = {
            ...updatedTransaction.comment,
            comment: transactionChanges.comment,
        };
    }
    if (Object.hasOwn(transactionChanges, 'created')) {
        updatedTransaction.modifiedCreated = transactionChanges.created;
        shouldStopSmartscan = true;
    }
    if (Object.hasOwn(transactionChanges, 'amount') && typeof transactionChanges.amount === 'number') {
        updatedTransaction.modifiedAmount = isFromExpenseReport ? -transactionChanges.amount : transactionChanges.amount;
        shouldStopSmartscan = true;
    }
    if (Object.hasOwn(transactionChanges, 'currency')) {
        updatedTransaction.modifiedCurrency = transactionChanges.currency;
        shouldStopSmartscan = true;
    }

    if (Object.hasOwn(transactionChanges, 'merchant')) {
        updatedTransaction.modifiedMerchant = transactionChanges.merchant;
        shouldStopSmartscan = true;
    }

    if (Object.hasOwn(transactionChanges, 'waypoints')) {
        updatedTransaction.modifiedWaypoints = transactionChanges.waypoints;
        shouldStopSmartscan = true;
    }

    if (Object.hasOwn(transactionChanges, 'billable') && typeof transactionChanges.billable === 'boolean') {
        updatedTransaction.billable = transactionChanges.billable;
    }

    if (Object.hasOwn(transactionChanges, 'category') && typeof transactionChanges.category === 'string') {
        updatedTransaction.category = transactionChanges.category;
    }

    if (Object.hasOwn(transactionChanges, 'tag') && typeof transactionChanges.tag === 'string') {
        updatedTransaction.tag = transactionChanges.tag;
    }

    if (
        shouldUpdateReceiptState &&
        shouldStopSmartscan &&
        transaction?.receipt &&
        Object.keys(transaction.receipt).length > 0 &&
        transaction?.receipt?.state !== CONST.IOU.RECEIPT_STATE.OPEN
    ) {
        updatedTransaction.receipt.state = CONST.IOU.RECEIPT_STATE.OPEN;
    }

    updatedTransaction.pendingFields = {
        ...(Object.hasOwn(transactionChanges, 'comment') && {comment: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'created') && {created: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'amount') && {amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'currency') && {currency: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'merchant') && {merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'waypoints') && {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'billable') && {billable: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'category') && {category: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'tag') && {tag: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
    };

    return updatedTransaction;
}

/**
 * Retrieve the particular transaction object given its ID.
 *
 * @deprecated Use withOnyx() or Onyx.connect() instead
 */
function getTransaction(transactionID: string): Transaction | Record<string, never> {
    return allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] ?? {};
}

/**
 * Return the comment field (referred to as description in the App) from the transaction.
 * The comment does not have its modifiedComment counterpart.
 */
function getDescription(transaction: Transaction): string {
    return transaction?.comment?.comment ?? '';
}

/**
 * Return the amount field from the transaction, return the modifiedAmount if present.
 */
function getAmount(transaction: Transaction, isFromExpenseReport: boolean): number {
    // IOU requests cannot have negative values but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport) {
        const amount = transaction?.modifiedAmount ?? 0;
        if (amount) {
            return Math.abs(amount);
        }
        return Math.abs(transaction?.amount ?? 0);
    }

    // Expense report case:
    // The amounts are stored using an opposite sign and negative values can be set,
    // we need to return an opposite sign than is saved in the transaction object
    let amount = transaction?.modifiedAmount ?? 0;
    if (amount) {
        return -amount;
    }

    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    amount = transaction?.amount ?? 0;
    return amount ? -amount : 0;
}

/**
 * Return the currency field from the transaction, return the modifiedCurrency if present.
 */
function getCurrency(transaction: Transaction): string {
    const currency = transaction?.modifiedCurrency ?? '';
    if (currency) {
        return currency;
    }
    return transaction?.currency ?? CONST.CURRENCY.USD;
}

/**
 * Return the original currency field from the transaction.
 */
function getOriginalCurrency(transaction: Transaction): string {
    return transaction?.originalCurrency ?? '';
}

/**
 * Return the absolute value of the original amount field from the transaction.
 */
function getOriginalAmount(transaction: Transaction): number {
    const amount = transaction?.originalAmount ?? 0;
    return Math.abs(amount);
}

/**
 * Return the merchant field from the transaction, return the modifiedMerchant if present.
 */
function getMerchant(transaction: Transaction): string {
    return transaction?.modifiedMerchant ? transaction.modifiedMerchant : transaction?.merchant || '';
}

/**
 * Return the mccGroup field from the transaction, return the modifiedMCCGroup if present.
 */
function getMCCGroup(transaction: Transaction): string {
    return transaction?.modifiedMCCGroup ? transaction.modifiedMCCGroup : transaction?.mccGroup ?? '';
}

/**
 * Return the waypoints field from the transaction, return the modifiedWaypoints if present.
 */
function getWaypoints(transaction: Transaction): WaypointCollection | undefined {
    return transaction?.modifiedWaypoints ?? transaction?.comment?.waypoints;
}

/**
 * Return the category from the transaction. This "category" field has no "modified" complement.
 */
function getCategory(transaction: Transaction): string {
    return transaction?.category ?? '';
}

/**
 * Return the cardID from the transaction.
 */
function getCardID(transaction: Transaction): number {
    return transaction?.cardID ?? 0;
}

/**
 * Return the billable field from the transaction. This "billable" field has no "modified" complement.
 */
function getBillable(transaction: Transaction): boolean {
    return transaction?.billable ?? false;
}

/**
 * Return the tag from the transaction. This "tag" field has no "modified" complement.
 */
function getTag(transaction: Transaction): string {
    return transaction?.tag ?? '';
}

/**
 * Return the created field from the transaction, return the modifiedCreated if present.
 */
function getCreated(transaction: Transaction, dateFormat: string = CONST.DATE.FNS_FORMAT_STRING): string {
    const created = transaction?.modifiedCreated ? transaction.modifiedCreated : transaction?.created || '';
    const createdDate = parseISO(created);
    if (isValid(createdDate)) {
        return format(createdDate, dateFormat);
    }

    return '';
}

function isDistanceRequest(transaction: Transaction): boolean {
    const type = transaction?.comment?.type;
    const customUnitName = transaction?.comment?.customUnit?.name;
    return type === CONST.TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST.CUSTOM_UNITS.NAME_DISTANCE;
}

/**
 * Determine whether a transaction is made with an Expensify card.
 */
function isExpensifyCardTransaction(transaction: Transaction): boolean {
    if (!transaction.cardID) {
        return false;
    }
    return isExpensifyCard(transaction.cardID);
}

/**
 * Check if the transaction status is set to Pending.
 */
function isPending(transaction: Transaction): boolean {
    if (!transaction.status) {
        return false;
    }
    return transaction.status === CONST.TRANSACTION.STATUS.PENDING;
}

/**
 * Check if the transaction status is set to Posted.
 */
function isPosted(transaction: Transaction): boolean {
    if (!transaction.status) {
        return false;
    }
    return transaction.status === CONST.TRANSACTION.STATUS.POSTED;
}

function isReceiptBeingScanned(transaction: Transaction): boolean {
    return [CONST.IOU.RECEIPT_STATE.SCANREADY, CONST.IOU.RECEIPT_STATE.SCANNING].some((value) => value === transaction.receipt.state);
}

/**
 * Check if the transaction has a non-smartscanning receipt and is missing required fields
 */
function hasMissingSmartscanFields(transaction: Transaction): boolean {
    return hasReceipt(transaction) && !isDistanceRequest(transaction) && !isReceiptBeingScanned(transaction) && areRequiredFieldsEmpty(transaction);
}

/**
 * Check if the transaction has a defined route
 */
function hasRoute(transaction: Transaction): boolean {
    return !!transaction?.routes?.route0?.geometry?.coordinates;
}

/**
 * Get the transactions related to a report preview with receipts
 * Get the details linked to the IOU reportAction
 *
 * @deprecated Use Onyx.connect() or withOnyx() instead
 */
function getLinkedTransaction(reportAction: ReportAction): Transaction | Record<string, never> {
    let transactionID = '';

    if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
        transactionID = reportAction.originalMessage?.IOUTransactionID ?? '';
    }

    return allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] ?? {};
}

function getAllReportTransactions(reportID?: string): Transaction[] {
    // `reportID` from the `/CreateDistanceRequest` endpoint return's number instead of string for created `transaction`.
    // For reference, https://github.com/Expensify/App/pull/26536#issuecomment-1703573277.
    // We will update this in a follow-up Issue. According to this comment: https://github.com/Expensify/App/pull/26536#issuecomment-1703591019.
    const transactions: Transaction[] = Object.values(allTransactions ?? {}).filter((transaction): transaction is Transaction => transaction !== null);
    return transactions.filter((transaction) => `${transaction.reportID}` === `${reportID}`);
}

/**
 * Checks if a waypoint has a valid address
 */
function waypointHasValidAddress(waypoint: RecentWaypoint | Waypoint): boolean {
    return !!waypoint?.address?.trim();
}

/**
 * Converts the key of a waypoint to its index
 */
function getWaypointIndex(key: string): number {
    return Number(key.replace('waypoint', ''));
}

/**
 * Filters the waypoints which are valid and returns those
 */
function getValidWaypoints(waypoints: WaypointCollection, reArrangeIndexes = false): WaypointCollection {
    const sortedIndexes = Object.keys(waypoints).map(getWaypointIndex).sort();
    const waypointValues = sortedIndexes.map((index) => waypoints[`waypoint${index}`]);
    // Ensure the number of waypoints is between 2 and 25
    if (waypointValues.length < 2 || waypointValues.length > 25) {
        return {};
    }

    let lastWaypointIndex = -1;

    return waypointValues.reduce<WaypointCollection>((acc, currentWaypoint, index) => {
        const previousWaypoint = waypointValues[lastWaypointIndex];

        // Check if the waypoint has a valid address
        if (!waypointHasValidAddress(currentWaypoint)) {
            return acc;
        }

        // Check for adjacent waypoints with the same address
        if (previousWaypoint && currentWaypoint?.address === previousWaypoint.address) {
            return acc;
        }

        const validatedWaypoints: WaypointCollection = {...acc, [`waypoint${reArrangeIndexes ? lastWaypointIndex + 1 : index}`]: currentWaypoint};

        lastWaypointIndex += 1;

        return validatedWaypoints;
    }, {});
}

/**
 * Returns the most recent transactions in an object
 */
function getRecentTransactions(transactions: Record<string, string>, size = 2): string[] {
    return Object.keys(transactions)
        .sort((transactionID1, transactionID2) => (new Date(transactions[transactionID1]) < new Date(transactions[transactionID2]) ? 1 : -1))
        .slice(0, size);
}

export {
    buildOptimisticTransaction,
    getUpdatedTransaction,
    getTransaction,
    getDescription,
    getAmount,
    getCurrency,
    getCardID,
    getOriginalCurrency,
    getOriginalAmount,
    getMerchant,
    getMCCGroup,
    getCreated,
    getCategory,
    getBillable,
    getTag,
    getLinkedTransaction,
    getAllReportTransactions,
    hasReceipt,
    hasEReceipt,
    hasRoute,
    isReceiptBeingScanned,
    getValidWaypoints,
    isDistanceRequest,
    isExpensifyCardTransaction,
    isPending,
    isPosted,
    getWaypoints,
    isAmountMissing,
    isMerchantMissing,
    isCreatedMissing,
    areRequiredFieldsEmpty,
    hasMissingSmartscanFields,
    getWaypointIndex,
    waypointHasValidAddress,
    getRecentTransactions,
};
