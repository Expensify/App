/**
 * Pure getters that read a transaction's own fields. They import nothing from the rest of TransactionUtils, so modules
 * that TransactionUtils/index.ts itself imports, like DistanceRequestUtils, can read a transaction without an import cycle.
 */
import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {UnreportedTransaction} from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import {hasValidModifiedAmount} from './amountUtils';

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
 * The distance a distance expense is billed for, which leaves out any commuter exclusion.
 */
function getBilledDistance(transaction: OnyxEntry<Transaction>): number | undefined {
    const customUnit = transaction?.comment?.customUnit;
    if (typeof customUnit?.reimbursableDistance === 'number') {
        return customUnit.reimbursableDistance;
    }
    const quantity = customUnit?.quantity ?? undefined;
    const commuterExclusion = customUnit?.commuterExclusion;
    // The reimbursable distance isn't always stored, so derive it the same way the expense displays it
    if (quantity !== undefined && typeof commuterExclusion === 'number' && commuterExclusion > 0) {
        return Math.max(0, quantity - commuterExclusion);
    }
    return quantity;
}

export {getAmount, getBilledDistance, getCurrency, getCreated, getFormattedCreated, isCustomUnitRateIDForP2P, getRateID, isExpenseUnreported};
