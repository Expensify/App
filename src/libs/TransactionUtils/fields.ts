/**
 * Pure getters that read a transaction's own fields. They import only leaf siblings and never ./index, so modules
 * that TransactionUtils/index.ts itself imports, like DistanceRequestUtils, can read a transaction without an import cycle.
 */
import DateUtils from '@libs/DateUtils';

import type {IOURequestType} from '@src/CONST';
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {DistanceExpenseType} from '@src/types/onyx/IOU';
import type {UnreportedTransaction} from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import {hasValidModifiedAmount} from './amountUtils';
import getTagArrayFromName from './getTagArrayFromName';

/**
 * Return the currency field from the transaction, return the modifiedCurrency if present.
 */
function getCurrency(transaction: OnyxInputOrEntry<Pick<Transaction, 'modifiedCurrency' | 'currency'>>): string {
    const currency = transaction?.modifiedCurrency ?? '';
    if (currency) {
        return currency;
    }
    return transaction?.currency ?? CONST.CURRENCY.USD;
}

function getCreated(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.modifiedCreated ? transaction.modifiedCreated : transaction?.created || '';
}

/**
 * Return the created field from the transaction as yyyy-MM-dd, using the modifiedCreated if present. It is the same in
 * every language, so a date shown to the user is formatted from it with the user's locale.
 */
function getFormattedCreated(transaction: OnyxInputOrEntry<Transaction>): string {
    return DateUtils.formatMachineDateWithUTCTimeZone(getCreated(transaction));
}

/**
 * Check if the customUnitRateID has a value default for P2P distance requests
 */
function isCustomUnitRateIDForP2P(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return transaction?.comment?.customUnit?.customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;
}

/**
 * Get custom unit rate (distance rate) ID from the transaction object
 */
function getRateID(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.comment?.customUnit?.customUnitRateID ?? CONST.CUSTOM_UNITS.FAKE_P2P_ID;
}

function isExpenseUnreported(transaction?: Transaction): transaction is UnreportedTransaction {
    return transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
}

function isDistanceExpenseType(requestType: IOURequestType | undefined): requestType is DistanceExpenseType {
    return (
        requestType === CONST.IOU.REQUEST_TYPE.DISTANCE ||
        requestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MAP ||
        requestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL ||
        requestType === CONST.IOU.REQUEST_TYPE.DISTANCE_GPS ||
        requestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER
    );
}

function isDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    const requestType = transaction?.iouRequestType;
    return requestType === CONST.IOU.REQUEST_TYPE.DISTANCE || isDistanceExpenseType(requestType);
}

function isManualDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL;
}

function isOdometerDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER;
}

/**
 * Return the amount field from the transaction, return the modifiedAmount if present.
 */
function getAmount(transaction: OnyxInputOrEntry<Transaction>, isFromExpenseReport = false, isFromTrackedExpense = false, allowNegative = false, disableOppositeConversion = false): number {
    // IOU requests cannot have negative values, but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport && !isFromTrackedExpense && !allowNegative) {
        const amount = Number(transaction?.modifiedAmount) ?? 0;
        if (hasValidModifiedAmount(transaction)) {
            return Math.abs(amount);
        }
        return Math.abs(transaction?.amount ?? 0);
    }

    if (disableOppositeConversion) {
        return transaction?.amount ?? 0;
    }

    // Expense report case:
    // The amounts are stored using an opposite sign and negative values can be set,
    // we need to return an opposite sign than is saved in the transaction object
    let amount = Number(transaction?.modifiedAmount) ?? 0;
    if (hasValidModifiedAmount(transaction)) {
        return -amount;
    }

    amount = transaction?.amount ?? 0;

    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    return amount ? -amount : 0;
}

/**
 * Return the tax code from the transaction.
 */
function getTaxCode(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.taxCode ?? '';
}

/**
 * Return the comment field (referred to as description in the App) from the transaction.
 * The comment does not have its modifiedComment counterpart.
 */
function getDescription(transaction: OnyxInputOrEntry<Transaction>): string {
    // Casting the description to string to avoid wrong data types (e.g. number) being returned from the API
    return transaction?.comment?.comment?.toString() ?? '';
}

/**
 * Return the merchant field from the transaction, return the modifiedMerchant if present.
 */
function getMerchant(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.modifiedMerchant ? transaction.modifiedMerchant : (transaction?.merchant ?? '');
}

/**
 * Determine whether a transaction is made with a centrally managed card (Expensify or Company Card).
 */
function isManagedCardTransaction(transaction: OnyxEntry<Pick<Transaction, 'managedCard'>>): boolean {
    return !!transaction?.managedCard;
}

function isScanRequest(transaction: OnyxEntry<Pick<Transaction, 'iouRequestType'>>): boolean {
    return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN;
}

/**
 * Verify if the transaction is expecting the distance to be calculated on the server
 */
function isFetchingWaypointsFromServer(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return !!transaction?.pendingFields?.waypoints;
}

/**
 * Whether the transaction's route distance is already known locally (from a computed route or stored quantity),
 * so amount/merchant can be recalculated without waiting for the server.
 *
 * A waypoint edit whose route is still being computed by the server zeroes the amount but leaves the
 * quantity/routes of the pre-edit route in place, so a zero amount means the stored distance is stale.
 */
function hasLocallyKnownDistance(transaction: OnyxInputOrEntry<Transaction>): boolean {
    const hasDistanceSource = !!transaction?.comment?.customUnit?.quantity || !!transaction?.routes?.route0?.distance;
    return hasDistanceSource && !!getAmount(transaction);
}

function hasAppliedCommuterExclusion(transaction: OnyxEntry<Transaction>): boolean {
    return isDistanceRequest(transaction) && (transaction?.comment?.customUnit?.commuterExclusion ?? 0) > 0;
}

/**
 * Return the category from the transaction. This "category" field has no "modified" complement.
 */
function getCategory(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.category ?? '';
}

/**
 * Return the tag from the transaction. When the tagIndex is passed, return the tag based on the index.
 * This "tag" field has no "modified" complement.
 */
function getTag(transaction: OnyxInputOrEntry<Pick<Transaction, 'tag'>>, tagIndex?: number): string {
    if (tagIndex !== undefined) {
        const tagsArray = getTagArrayFromName(transaction?.tag ?? '');
        return tagsArray.at(tagIndex) ?? '';
    }

    return transaction?.tag ?? '';
}

/**
 * Return the reimbursable value. Defaults to true to match BE logic.
 */
function getReimbursable(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return transaction?.reimbursable ?? true;
}

function hasNonReimbursableTransactions(transactions?: Transaction[]): boolean {
    return !!transactions?.some((transaction) => !getReimbursable(transaction));
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

export {
    getCurrency,
    getCreated,
    getFormattedCreated,
    isCustomUnitRateIDForP2P,
    getRateID,
    isExpenseUnreported,
    isDistanceExpenseType,
    isDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    getAmount,
    getTaxCode,
    getDescription,
    getMerchant,
    isManagedCardTransaction,
    isScanRequest,
    isFetchingWaypointsFromServer,
    hasLocallyKnownDistance,
    hasAppliedCommuterExclusion,
    getCategory,
    getTag,
    getReimbursable,
    hasNonReimbursableTransactions,
    isPending,
};
