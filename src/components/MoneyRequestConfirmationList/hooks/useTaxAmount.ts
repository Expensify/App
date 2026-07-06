import type {OnyxEntry} from 'react-native-onyx';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {calculateTaxAmount, getDefaultTaxCode, getTaxValue, hasTaxRateWithMatchingValue} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type UseTaxAmountParams = {
    /** Transaction whose tax we're computing */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Policy that owns the active tax rates */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Destination policy when moving an expense off a track-expense */
    policyForMovingExpenses: OnyxEntry<OnyxTypes.Policy> | undefined;

    /** Whether the transaction is a distance request */
    isDistanceRequest: boolean;

    /** Whether we're moving a transaction off a track-expense flow */
    isMovingTransactionFromTrackExpense: boolean;

    /** ID of the selected mileage custom-unit rate (drives distance taxable amount) */
    customUnitRateID: string;

    /** Distance value used to compute the taxable amount for distance requests */
    distance: number;

    /** Currency the transaction had on the previous render, used to detect currency changes */
    previousTransactionCurrency: string | undefined;
};

/**
 * Computes tax-related values for the confirmation flow.
 *
 * Resolves the default tax code and value (falling back to the move-expenses policy when
 * moving a transaction off a track-expense), detects when a user's prior selection should
 * be preserved across a currency change, and returns the tax amount in the smallest
 * currency units for persistence.
 */
function useTaxAmount({
    transaction,
    policy,
    policyForMovingExpenses,
    isDistanceRequest,
    isMovingTransactionFromTrackExpense,
    customUnitRateID,
    distance,
    previousTransactionCurrency,
}: UseTaxAmountParams) {
    const {getCurrencyDecimals} = useCurrencyListActions();

    // Update the tax code when the default changes (for example, because the transaction currency changed)
    const defaultTaxCode = getDefaultTaxCode(policy, transaction) ?? (isMovingTransactionFromTrackExpense ? (getDefaultTaxCode(policyForMovingExpenses, transaction) ?? '') : '');
    const defaultTaxValue = getTaxValue(policy, transaction, defaultTaxCode) ?? null;
    const previousDefaultTaxCode = getDefaultTaxCode(policy, transaction, previousTransactionCurrency);
    const shouldKeepCurrentTaxSelection = hasTaxRateWithMatchingValue(policy, transaction) && transaction?.taxCode !== previousDefaultTaxCode;

    // Calculate and set tax amount in transaction draft
    const taxableAmount = isDistanceRequest ? DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, distance) : Math.abs(transaction?.amount ?? 0);
    // First we'll try to get the tax value from the chosen policy and if not found, we'll try to get it from the policy for moving expenses (only if the transaction is moving from track expense)
    const taxPercentage =
        getTaxValue(policy, transaction, transaction?.taxCode ?? defaultTaxCode) ??
        (isMovingTransactionFromTrackExpense ? getTaxValue(policyForMovingExpenses, transaction, transaction?.taxCode ?? defaultTaxCode) : '');
    const taxDecimals = getCurrencyDecimals(transaction?.currency ?? CONST.CURRENCY.USD);
    const taxAmount = isMovingTransactionFromTrackExpense && transaction?.taxAmount ? Math.abs(transaction?.taxAmount ?? 0) : calculateTaxAmount(taxPercentage, taxableAmount, taxDecimals);

    const taxAmountInSmallestCurrencyUnits = convertToBackendAmount(Number.parseFloat(taxAmount.toString()));

    return {defaultTaxCode, defaultTaxValue, shouldKeepCurrentTaxSelection, taxAmountInSmallestCurrencyUnits};
}

export default useTaxAmount;
