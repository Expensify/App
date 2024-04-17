import lodashHas from 'lodash/has';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RecentWaypoint, Report, TaxRate, TaxRates, TaxRatesWithDefault, Transaction, TransactionViolation} from '@src/types/onyx';
import type {Comment, Receipt, TransactionChanges, TransactionPendingFieldsKey, Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {IOURequestType} from './actions/IOU';
import {isCorporateCard, isExpensifyCard} from './CardUtils';
import DateUtils from './DateUtils';
import * as Localize from './Localize';
import * as NumberUtils from './NumberUtils';
import {getCleanedTagName} from './PolicyUtils';

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

function isDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the request creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    }

    // This is the case for transaction objects once they have been saved to the server
    const type = transaction?.comment?.type;
    const customUnitName = transaction?.comment?.customUnit?.name;
    return type === CONST.TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST.CUSTOM_UNITS.NAME_DISTANCE;
}

function isScanRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the request creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN;
    }

    return Boolean(transaction?.receipt?.source);
}

function getRequestType(transaction: OnyxEntry<Transaction>): IOURequestType {
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
    pendingFields: Partial<{[K in TransactionPendingFieldsKey]: ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>}> | undefined = undefined,
    reimbursable = true,
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
        ...(!isEmptyObject(pendingFields) ? {pendingFields} : {}),
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
        reimbursable,
    };
}

/**
 * Check if the transaction has an Ereceipt
 */
function hasEReceipt(transaction: Transaction | undefined | null): boolean {
    return !!transaction?.hasEReceipt;
}

function hasReceipt(transaction: OnyxEntry<Transaction> | undefined): boolean {
    return !!transaction?.receipt?.state || hasEReceipt(transaction);
}

function isMerchantMissing(transaction: OnyxEntry<Transaction>) {
    if (transaction?.modifiedMerchant && transaction.modifiedMerchant !== '') {
        return transaction.modifiedMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    }
    const isMerchantEmpty = transaction?.merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || transaction?.merchant === '';

    return isMerchantEmpty;
}

/**
 * Check if the merchant is partial i.e. `(none)`
 */
function isPartialMerchant(merchant: string): boolean {
    return merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
}

function isAmountMissing(transaction: OnyxEntry<Transaction>) {
    return transaction?.amount === 0 && (!transaction.modifiedAmount || transaction.modifiedAmount === 0);
}

function isCreatedMissing(transaction: OnyxEntry<Transaction>) {
    return transaction?.created === '' && (!transaction.created || transaction.modifiedCreated === '');
}

function areRequiredFieldsEmpty(transaction: OnyxEntry<Transaction>): boolean {
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`] ?? null;
    const isFromExpenseReport = parentReport?.type === CONST.REPORT.TYPE.EXPENSE;
    const isSplitPolicyExpenseChat = !!transaction?.comment?.splits?.some((participant) => allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.chatReportID}`]?.isOwnPolicyExpenseChat);
    const isMerchantRequired = isFromExpenseReport || isSplitPolicyExpenseChat;
    return (isMerchantRequired && isMerchantMissing(transaction)) || isAmountMissing(transaction) || isCreatedMissing(transaction);
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

    if (Object.hasOwn(transactionChanges, 'taxAmount') && typeof transactionChanges.taxAmount === 'number') {
        updatedTransaction.taxAmount = isFromExpenseReport ? -transactionChanges.taxAmount : transactionChanges.taxAmount;
        shouldStopSmartscan = true;
    }

    if (Object.hasOwn(transactionChanges, 'taxCode') && typeof transactionChanges.taxCode === 'string') {
        updatedTransaction.taxCode = transactionChanges.taxCode;
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
        ...(Object.hasOwn(transactionChanges, 'taxAmount') && {taxAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'taxCode') && {taxCode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
    };

    return updatedTransaction;
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
function getAmount(transaction: OnyxEntry<Transaction>, isFromExpenseReport = false, isFromTrackedExpense = false): number {
    // IOU requests cannot have negative values, but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport || isFromTrackedExpense) {
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
 * Return the tax amount field from the transaction.
 */
function getTaxAmount(transaction: OnyxEntry<Transaction>, isFromExpenseReport: boolean): number {
    // IOU requests cannot have negative values but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport) {
        return Math.abs(transaction?.taxAmount ?? 0);
    }

    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    const amount = transaction?.taxAmount ?? 0;
    return amount ? -amount : 0;
}

/**
 * Return the tax code from the transaction.
 */
function getTaxCode(transaction: OnyxEntry<Transaction>): string {
    return transaction?.taxCode ?? '';
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
 * Verify if the transaction is expecting the distance to be calculated on the server
 */
function isFetchingWaypointsFromServer(transaction: OnyxEntry<Transaction>): boolean {
    return !!transaction?.pendingFields?.waypoints;
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
 * Return a colon-delimited tag string as an array, considering escaped colons and double backslashes.
 */
function getTagArrayFromName(tagName: string): string[] {
    // WAIT!!!!!!!!!!!!!!!!!!
    // You need to keep this in sync with TransactionUtils.php

    // We need to be able to preserve double backslashes in the original string
    // and not have it interfere with splitting on a colon (:).
    // So, let's replace it with something absurd to begin with, do our split, and
    // then replace the double backslashes in the end.
    const tagWithoutDoubleSlashes = tagName.replace(/\\\\/g, '☠');
    const tagWithoutEscapedColons = tagWithoutDoubleSlashes.replace(/\\:/g, '☢');

    // Do our split
    const matches = tagWithoutEscapedColons.split(':');
    const newMatches: string[] = [];

    for (const item of matches) {
        const tagWithEscapedColons = item.replace(/☢/g, '\\:');
        const tagWithDoubleSlashes = tagWithEscapedColons.replace(/☠/g, '\\\\');
        newMatches.push(tagWithDoubleSlashes);
    }

    return newMatches;
}

/**
 * Return the tag from the transaction. When the tagIndex is passed, return the tag based on the index.
 * This "tag" field has no "modified" complement.
 */
function getTag(transaction: OnyxEntry<Transaction>, tagIndex?: number): string {
    if (tagIndex !== undefined) {
        const tagsArray = getTagArrayFromName(transaction?.tag ?? '');
        return tagsArray[tagIndex] ?? '';
    }

    return transaction?.tag ?? '';
}

function getTagForDisplay(transaction: OnyxEntry<Transaction>, tagIndex?: number): string {
    return getCleanedTagName(getTag(transaction, tagIndex));
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
function getHeaderTitleTranslationKey(transaction: OnyxEntry<Transaction>): TranslationPaths {
    const headerTitles: Record<IOURequestType, TranslationPaths> = {
        [CONST.IOU.REQUEST_TYPE.DISTANCE]: 'tabSelector.distance',
        [CONST.IOU.REQUEST_TYPE.MANUAL]: 'tabSelector.manual',
        [CONST.IOU.REQUEST_TYPE.SCAN]: 'tabSelector.scan',
    };

    return headerTitles[getRequestType(transaction)];
}

/**
 * Determine whether a transaction is made with an Expensify card.
 */
function isExpensifyCardTransaction(transaction: OnyxEntry<Transaction>): boolean {
    if (!transaction?.cardID) {
        return false;
    }
    return isExpensifyCard(transaction.cardID);
}

/**
 * Determine whether a transaction is made with a card (Expensify or Company Card).
 */
function isCardTransaction(transaction: OnyxEntry<Transaction>): boolean {
    const cardID = transaction?.cardID ?? 0;
    return isCorporateCard(cardID);
}

/**
 * Check if the transaction status is set to Pending.
 */
function isPending(transaction: OnyxEntry<Transaction>): boolean {
    if (!transaction?.status) {
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
    return Boolean(transaction && !isDistanceRequest(transaction) && !isReceiptBeingScanned(transaction) && areRequiredFieldsEmpty(transaction));
}

/**
 * Check if the transaction has a defined route
 */
function hasRoute(transaction: OnyxEntry<Transaction>): boolean {
    return !!transaction?.routes?.route0?.geometry?.coordinates;
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
function getValidWaypoints(waypoints: WaypointCollection | undefined, reArrangeIndexes = false): WaypointCollection {
    if (!waypoints) {
        return {};
    }

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
 * Check if transaction is on hold
 */
function isOnHold(transaction: OnyxEntry<Transaction>): boolean {
    if (!transaction) {
        return false;
    }

    return !!transaction.comment?.hold;
}

/**
 * Checks if any violations for the provided transaction are of type 'violation'
 */
function hasViolation(transactionID: string, transactionViolations: OnyxCollection<TransactionViolation[]>): boolean {
    return Boolean(
        transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transactionID]?.some((violation: TransactionViolation) => violation.type === CONST.VIOLATION_TYPES.VIOLATION),
    );
}

function getTransactionViolations(transactionID: string, transactionViolations: OnyxCollection<TransactionViolation[]>): TransactionViolation[] | null {
    return transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transactionID] ?? null;
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
function getEnabledTaxRateCount(options: TaxRates) {
    return Object.values(options).filter((option: TaxRate) => !option.isDisabled).length;
}

/**
 * Gets the default tax name
 */
function getDefaultTaxName(taxRates: TaxRatesWithDefault, transaction?: Transaction) {
    const defaultTaxKey = taxRates.defaultExternalID;
    const defaultTaxName =
        (defaultTaxKey && `${taxRates.taxes[defaultTaxKey]?.name} (${taxRates.taxes[defaultTaxKey]?.value}) ${CONST.DOT_SEPARATOR} ${Localize.translateLocal('common.default')}`) || '';
    return transaction?.taxRate?.text ?? defaultTaxName;
}

/**
 * Gets the tax name
 */
function getTaxName(taxes: TaxRates, transactionTaxCode: string) {
    const taxName = taxes[transactionTaxCode]?.name ?? '';
    const taxValue = taxes[transactionTaxCode]?.value ?? '';
    return transactionTaxCode && taxName && taxValue ? `${taxName} (${taxValue})` : '';
}

export {
    buildOptimisticTransaction,
    calculateTaxAmount,
    getTaxName,
    getDefaultTaxName,
    getEnabledTaxRateCount,
    getUpdatedTransaction,
    getDescription,
    getHeaderTitleTranslationKey,
    getRequestType,
    isManualRequest,
    isScanRequest,
    getAmount,
    getTaxAmount,
    getTaxCode,
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
    getTagArrayFromName,
    getTagForDisplay,
    getTransactionViolations,
    getAllReportTransactions,
    hasReceipt,
    hasEReceipt,
    hasRoute,
    isReceiptBeingScanned,
    getValidWaypoints,
    isDistanceRequest,
    isFetchingWaypointsFromServer,
    isExpensifyCardTransaction,
    isCardTransaction,
    isPending,
    isPosted,
    isOnHold,
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

export type {TransactionChanges};
