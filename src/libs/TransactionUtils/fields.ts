/**
 * Pure getters that read a transaction's own fields. They import nothing from the rest of TransactionUtils, so modules
 * that TransactionUtils/index.ts itself imports, like DistanceRequestUtils, can read a transaction without an import cycle.
 */
import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {UnreportedTransaction} from '@src/types/onyx/Transaction';

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

export {getCurrency, getCreated, getFormattedCreated, isCustomUnitRateIDForP2P, getRateID, isExpenseUnreported};
