import lodashHas from 'lodash/has';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RecentWaypoint, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';
import type {PolicyTaxRate, PolicyTaxRates} from '@src/types/onyx/PolicyTaxRates';
import type {Comment, Receipt, Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import {isCorporateCard, isExpensifyCard} from './CardUtils';
import DateUtils from './DateUtils';
import * as NumberUtils from './NumberUtils';

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

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

function isDistanceRequest(transaction: Transaction): boolean {
    // This is used during the request creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    }

    // This is the case for transaction objects once they have been saved to the server
    const type = transaction?.comment?.type;
    const customUnitName = transaction?.comment?.customUnit?.name;
    return type === CONST.TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST.CUSTOM_UNITS.NAME_DISTANCE;
}

function isScanRequest(transaction: Transaction): boolean {
    // This is used during the request creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN;
    }

    return Boolean(transaction?.receipt?.source);
}

function getRequestType(transaction: Transaction): ValueOf<typeof CONST.IOU.REQUEST_TYPE> {
    if (isDistanceRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.DISTANCE;
    }
    if (isScanRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.SCAN;
    }
    return CONST.IOU.REQUEST_TYPE.MANUAL;
}

function isManualRequest(transaction: Transaction): boolean {
    // This is used during the request creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL;
    }

    return getRequestType(transaction) === CONST.IOU.REQUEST_TYPE.MANUAL;
}

/**
 * Optimistically generate a transaction.
 *
 * @param amount – in cents
 * @param [existingTransactionID] When creating a distance request, an empty transaction has already been created with a transactionID. In that case, the transaction here needs to have
 * it's transactionID match what was already generated.
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
        merchant: merchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
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
    if (transaction.modifiedMerchant && transaction.modifiedMerchant !== '') {
        return transaction.modifiedMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    }
    const isMerchantEmpty = transaction.merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || transaction.merchant === '';

    return isMerchantEmpty;
}

/**
 * Check if the merchant is partial i.e. `(none)`
 */
function isPartialMerchant(merchant: string): boolean {
    return merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
}

function isAmountMissing(transaction: Transaction) {
    return transaction.amount === 0 && (!transaction.modifiedAmount || transaction.modifiedAmount === 0);
}

function isCreatedMissing(transaction: Transaction) {
    return transaction.created === '' && (!transaction.created || transaction.modifiedCreated === '');
}

function areRequiredFieldsEmpty(transaction: Transaction): boolean {
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`] ?? null;
    const isFromExpenseReport = parentReport?.type === CONST.REPORT.TYPE.EXPENSE;
    return (isFromExpenseReport && isMerchantMissing(transaction)) || isAmountMissing(transaction) || isCreatedMissing(transaction);
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
        transaction?.receipt?.state !== CONST.IOU.RECEIPT_STATE.OPEN &&
        updatedTransaction.receipt
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
function getTransaction(transactionID: string): OnyxEntry<Transaction> | EmptyObject {
    return allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] ?? {};
}

/**
 * Return the comment field (referred to as description in the App) from the transaction.
 * The comment does not have its modifiedComment counterpart.
 */
function getDescription(transaction: OnyxEntry<Transaction>): string {
    // Casting the description to string to avoid wrong data types (e.g. number) being returned from the API
    return transaction?.comment?.comment?.toString() ?? '';
}

/**
 * Return the amount field from the transaction, return the modifiedAmount if present.
 */
function getAmount(transaction: OnyxEntry<Transaction>, isFromExpenseReport: boolean): number {
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
function getCurrency(transaction: OnyxEntry<Transaction>): string {
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
function getMerchant(transaction: OnyxEntry<Transaction>): string {
    return transaction?.modifiedMerchant ? transaction.modifiedMerchant : transaction?.merchant ?? '';
}

function getDistance(transaction: Transaction): number {
    return transaction?.routes?.route0?.distance ?? 0;
}

/**
 * Return the mccGroup field from the transaction, return the modifiedMCCGroup if present.
 */
function getMCCGroup(transaction: Transaction): ValueOf<typeof CONST.MCC_GROUPS> | undefined {
    return transaction?.modifiedMCCGroup ? transaction.modifiedMCCGroup : transaction?.mccGroup;
}

/**
 * Return the waypoints field from the transaction, return the modifiedWaypoints if present.
 */
function getWaypoints(transaction: OnyxEntry<Transaction>): WaypointCollection | undefined {
    return transaction?.modifiedWaypoints ?? transaction?.comment?.waypoints;
}

/**
 * Return the category from the transaction. This "category" field has no "modified" complement.
 */
function getCategory(transaction: OnyxEntry<Transaction>): string {
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
function getBillable(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.billable ?? false;
}

/**
 * Return the tag from the transaction. This "tag" field has no "modified" complement.
 */
function getTag(transaction: OnyxEntry<Transaction>): string {
    return transaction?.tag ?? '';
}

/**
 * Return the created field from the transaction, return the modifiedCreated if present.
 */
function getCreated(transaction: OnyxEntry<Transaction>, dateFormat: string = CONST.DATE.FNS_FORMAT_STRING): string {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const created = transaction?.modifiedCreated ? transaction.modifiedCreated : transaction?.created || '';

    return DateUtils.formatWithUTCTimeZone(created, dateFormat);
}

/**
 * Returns the translation key to use for the header title
 */
function getHeaderTitleTranslationKey(transaction: Transaction): string {
    const headerTitles = {
        [CONST.IOU.REQUEST_TYPE.DISTANCE]: 'tabSelector.distance',
        [CONST.IOU.REQUEST_TYPE.MANUAL]: 'tabSelector.manual',
        [CONST.IOU.REQUEST_TYPE.SCAN]: 'tabSelector.scan',
    };
    return headerTitles[getRequestType(transaction)];
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
 * Determine whether a transaction is made with a card (Expensify or Company Card).
 */
function isCardTransaction(transaction: Transaction): boolean {
    const cardID = transaction?.cardID ?? 0;
    return isCorporateCard(cardID);
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

function isReceiptBeingScanned(transaction: OnyxEntry<Transaction>): boolean {
    return [CONST.IOU.RECEIPT_STATE.SCANREADY, CONST.IOU.RECEIPT_STATE.SCANNING].some((value) => value === transaction?.receipt?.state);
}

/**
 * Check if the transaction has a non-smartscanning receipt and is missing required fields
 */
function hasMissingSmartscanFields(transaction: OnyxEntry<Transaction>): boolean {
    return Boolean(transaction && hasReceipt(transaction) && !isDistanceRequest(transaction) && !isReceiptBeingScanned(transaction) && areRequiredFieldsEmpty(transaction));
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
function getLinkedTransaction(reportAction: OnyxEntry<ReportAction>): Transaction | EmptyObject {
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
    const sortedIndexes = Object.keys(waypoints)
        .map(getWaypointIndex)
        .sort((a, b) => a - b);
    const waypointValues = sortedIndexes.map((index) => waypoints[`waypoint${index}`]);
    // Ensure the number of waypoints is between 2 and 25
    if (waypointValues.length < 2 || waypointValues.length > 25) {
        return {};
    }

    let lastWaypointIndex = -1;
    let waypointIndex = -1;

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

        const validatedWaypoints: WaypointCollection = {...acc, [`waypoint${reArrangeIndexes ? waypointIndex + 1 : index}`]: currentWaypoint};

        lastWaypointIndex = index;
        waypointIndex += 1;

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

/**
 * Checks if any violations for the provided transaction are of type 'violation'
 */
function hasViolation(transactionID: string, transactionViolations: OnyxCollection<TransactionViolation[]>): boolean {
    return Boolean(transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transactionID]?.some((violation: TransactionViolation) => violation.type === 'violation'));
}

/**
 * this is the formulae to calculate tax
 */
function calculateTaxAmount(percentage: string, amount: number) {
    const divisor = Number(percentage.slice(0, -1)) / 100 + 1;
    return Math.round(amount - amount / divisor) / 100;
}

/**
 * Calculates count of all tax enabled options
 */
function getEnabledTaxRateCount(options: PolicyTaxRates) {
    return Object.values(options).filter((option: PolicyTaxRate) => !option.isDisabled).length;
}

export {
    buildOptimisticTransaction,
    calculateTaxAmount,
    getEnabledTaxRateCount,
    getUpdatedTransaction,
    getTransaction,
    getDescription,
    getHeaderTitleTranslationKey,
    getRequestType,
    isManualRequest,
    isScanRequest,
    getAmount,
    getCurrency,
    getDistance,
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
    isCardTransaction,
    isPending,
    isPosted,
    getWaypoints,
    isAmountMissing,
    isMerchantMissing,
    isPartialMerchant,
    isCreatedMissing,
    areRequiredFieldsEmpty,
    hasMissingSmartscanFields,
    getWaypointIndex,
    waypointHasValidAddress,
    getRecentTransactions,
    hasViolation,
};
