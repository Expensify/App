import {useCurrencyListActions} from '@hooks/useCurrencyList';

import {convertToBackendAmount} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import {calculateTaxAmount, getCategoryTaxCode, getDefaultTaxCode, getTaxValue, hasTaxRateWithMatchingValue} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

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

    /** Active distance unit for the selected mileage rate */
    distanceUnit: Unit | undefined;

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
    distanceUnit,
    previousTransactionCurrency,
}: UseTaxAmountParams) {
    const {getCurrencyDecimals} = useCurrencyListActions();

    // Update the tax code when the default changes (for example, because the transaction currency changed)
    const workspaceDefaultTaxCode = getDefaultTaxCode(policy, transaction) ?? (isMovingTransactionFromTrackExpense ? (getDefaultTaxCode(policyForMovingExpenses, transaction) ?? '') : '');
    const previousWorkspaceDefaultTaxCode = getDefaultTaxCode(policy, transaction, previousTransactionCurrency);
    const hasCurrencyChanged = transaction?.currency !== previousTransactionCurrency;
    // The distance rate's default category is written by CategoryDefaultsSetter after this runs, so the rule is
    // resolved against the category the expense is about to carry rather than the empty one this render still sees.
    const category = transaction?.category || (isDistanceRequest ? (getDistanceRateCustomUnit(policy)?.defaultCategory ?? '') : '');
    // Only the workspace default follows the currency, so after a currency change the selection is compared against that
    // default. The rest of the time it is compared against the category rule's rate, otherwise picking the workspace
    // default while a rule is active reads as "no selection" and the rule's rate is written straight back over it.
    const previousDefaultTaxCode = hasCurrencyChanged
        ? previousWorkspaceDefaultTaxCode
        : (getCategoryTaxCode(category, transaction, policy, previousTransactionCurrency) ?? previousWorkspaceDefaultTaxCode);
    // A tax that was the old currency's workspace default keeps following that default, so it moves to the new
    // currency's one instead of being taken over by the category rule.
    const isFollowingWorkspaceDefault = hasCurrencyChanged && !!transaction?.taxCode && transaction.taxCode === previousWorkspaceDefaultTaxCode;
    // A category tax rule outranks the workspace default, so resolve it here as well. Otherwise this default overwrites
    // the rule's tax rate on the first render of the confirmation page.
    const defaultTaxCode = isFollowingWorkspaceDefault ? workspaceDefaultTaxCode : (getCategoryTaxCode(category, transaction, policy) ?? workspaceDefaultTaxCode);
    const defaultTaxValue = getTaxValue(policy, transaction, defaultTaxCode) ?? null;
    const shouldKeepCurrentTaxSelection = hasTaxRateWithMatchingValue(policy, transaction) && transaction?.taxCode !== previousDefaultTaxCode;

    const commuterExclusionData = isDistanceRequest
        ? DistanceRequestUtils.getCommuterExclusionDisplayData(
              transaction?.comment?.customUnit,
              transaction?.comment?.customUnit?.distanceUnit ?? distanceUnit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
          )
        : null;
    const taxableDistance = commuterExclusionData ? DistanceRequestUtils.convertToDistanceInMeters(commuterExclusionData.reimbursableDistance, commuterExclusionData.distanceUnit) : distance;
    // Calculate and set tax amount in transaction draft
    const taxableAmount = isDistanceRequest ? DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, taxableDistance) : Math.abs(transaction?.amount ?? 0);
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
