import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useOnyx from '@hooks/useOnyx';
import useRulesPrefetch from '@hooks/useRulesPrefetch';

import {convertToBackendAmount} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {arePolicyRulesEnabled, getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import {calculateTaxAmount, getCategoryTaxCode, getDefaultTaxCode, getTaxValue, hasTaxRateWithMatchingValue} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useState} from 'react';

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
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    // A category's tax default lives in the `rules_` collection, which only `GetRules` populates. Onyx hydrates it
    // as empty first, so without waiting the expense picks up the workspace default and the rule never applies.
    const {areRulesLoading} = useRulesPrefetch(arePolicyRulesEnabled(policy, policyCategories));

    // Update the tax code when the default changes (for example, because the transaction currency changed)
    const workspaceDefaultTaxCode = getDefaultTaxCode(policy, transaction) ?? (isMovingTransactionFromTrackExpense ? (getDefaultTaxCode(policyForMovingExpenses, transaction) ?? '') : '');
    const previousWorkspaceDefaultTaxCode = getDefaultTaxCode(policy, transaction, previousTransactionCurrency);
    const hasCurrencyChanged = transaction?.currency !== previousTransactionCurrency;
    // The distance rate's default category is written by CategoryDefaultsSetter after this runs, so the rule is
    // resolved against the category the expense is about to carry rather than the empty one this render still sees.
    // The rate is read into its own value so React Compiler can cache the lookup. The hooks below split the block
    // it used to be cached in, which left it running on every render.
    const distanceRateCustomUnit = isDistanceRequest ? getDistanceRateCustomUnit(policy) : undefined;
    const category = transaction?.category || (distanceRateCustomUnit?.defaultCategory ?? '');
    // The category whose rate the expense is currently carrying, which only moves on once a rate has been resolved
    // for it. While the rules are loading nothing is resolved, so a category picked in that window stays pending
    // here until they land. Tracking the last rendered category instead would let the change pass unseen, and the
    // rate the old category left behind would then be held in place as though the user had chosen it.
    const [previousCategory, setPreviousCategory] = useState(category);
    useEffect(() => {
        if (areRulesLoading || previousCategory === category) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- the category has to advance only once a render has resolved a rate for it, which is not knowable during that render
        setPreviousCategory(category);
    }, [areRulesLoading, category, previousCategory]);
    // Only the workspace default follows the currency, so after a currency change the selection is compared against that
    // default. The rest of the time it is compared against the rate the category asked for before this render, so that
    // changing category is not mistaken for a rate the user picked. Comparing against the new category's rule instead
    // would make the rate the old category left behind look chosen, and the new rule would never be applied.
    const previousDefaultTaxCode = hasCurrencyChanged
        ? previousWorkspaceDefaultTaxCode
        : (getCategoryTaxCode(previousCategory, transaction, policy, rules, previousTransactionCurrency) ?? previousWorkspaceDefaultTaxCode);
    // A tax that was the old currency's workspace default keeps following that default, so it moves to the new
    // currency's one instead of being taken over by the category rule.
    const isFollowingWorkspaceDefault = hasCurrencyChanged && !!transaction?.taxCode && transaction.taxCode === previousWorkspaceDefaultTaxCode;
    // A category tax rule outranks the workspace default, so resolve it here as well. Otherwise this default overwrites
    // the rule's tax rate on the first render of the confirmation page.
    const categoryTaxCode = isFollowingWorkspaceDefault ? undefined : getCategoryTaxCode(category, transaction, policy, rules);
    // A category rule that has applied can be dropped again by picking a category without one, and by then the
    // transaction is carrying the rule's rate. Only a rate read before the first rule applied is the expense's own.
    const [arrivedTax, setArrivedTax] = useState<Pick<OnyxTypes.Transaction, 'taxCode' | 'taxValue' | 'taxAmount'>>();
    const [hasCategoryRuleApplied, setHasCategoryRuleApplied] = useState(false);
    useEffect(() => {
        if (!isMovingTransactionFromTrackExpense || !!arrivedTax || !transaction) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- the rate has to be read before the render that writes a rule's rate over it, which is not knowable during that render
        setArrivedTax({taxCode: transaction.taxCode, taxValue: transaction.taxValue, taxAmount: transaction.taxAmount});
    }, [arrivedTax, isMovingTransactionFromTrackExpense, transaction]);
    useEffect(() => {
        if (hasCategoryRuleApplied || !categoryTaxCode) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- whether a rule has ever applied is history, so it cannot be derived from the current render
        setHasCategoryRuleApplied(true);
    }, [categoryTaxCode, hasCategoryRuleApplied]);
    // A moved track expense keeps the tax it arrived with rather than taking the destination workspace's default,
    // which is a rate nobody chose for it. A category rule is a rate the destination's admin chose, so it still
    // applies. Dropping that category puts the arrived rate back, since the rule's rate belonged to the category
    // the expense has just left.
    const isKeepingArrivedTax = isMovingTransactionFromTrackExpense && !categoryTaxCode;
    const shouldRestoreArrivedTax = isKeepingArrivedTax && hasCategoryRuleApplied;
    const shouldHoldBackDefault = isKeepingArrivedTax && !hasCategoryRuleApplied;
    const defaultTaxCode = categoryTaxCode ?? (shouldRestoreArrivedTax ? (arrivedTax?.taxCode ?? '') : workspaceDefaultTaxCode);
    const defaultTaxValue = (shouldRestoreArrivedTax ? arrivedTax?.taxValue : getTaxValue(policy, transaction, defaultTaxCode)) ?? null;
    // The default this hook has already handed over. A `GetRules` that fails or times out settles the wait with no
    // rules, so the expense is given the workspace default. Without knowing that rate came from here, the category's
    // rule landing on a retry would read as a rate the user chose and would never be applied. Only a default the
    // hook has since moved on from counts, so a rate the user picked that happens to match is still left alone.
    const [appliedDefaultTaxCode, setAppliedDefaultTaxCode] = useState<string>();
    const isCarryingSupersededDefault = !!appliedDefaultTaxCode && transaction?.taxCode === appliedDefaultTaxCode && defaultTaxCode !== appliedDefaultTaxCode;
    const shouldKeepCurrentTaxSelection = hasTaxRateWithMatchingValue(policy, transaction) && transaction?.taxCode !== previousDefaultTaxCode && !isCarryingSupersededDefault;

    useEffect(() => {
        if (areRulesLoading || shouldHoldBackDefault || !defaultTaxCode || defaultTaxCode === appliedDefaultTaxCode) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- which default was handed over is history, so it cannot be derived from the current render
        setAppliedDefaultTaxCode(defaultTaxCode);
    }, [appliedDefaultTaxCode, areRulesLoading, defaultTaxCode, shouldHoldBackDefault]);

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
    // A moved track expense keeps the tax amount it arrived with, since it keeps the rate that amount was charged at.
    // A category rule on the destination workspace replaces that rate, so the amount has to be charged again.
    const keptTaxAmount = shouldRestoreArrivedTax ? arrivedTax?.taxAmount : transaction?.taxAmount;
    const shouldKeepMovedTaxAmount = isKeepingArrivedTax && !!keptTaxAmount;

    // A kept amount is read off a transaction, which holds it in the smallest currency units already, so only a
    // freshly calculated one is converted.
    const taxAmountInSmallestCurrencyUnits = shouldKeepMovedTaxAmount ? Math.abs(keptTaxAmount ?? 0) : convertToBackendAmount(calculateTaxAmount(taxPercentage, taxableAmount, taxDecimals));

    return {categoryTaxCode, defaultTaxCode, defaultTaxValue, shouldHoldBackDefault, shouldKeepCurrentTaxSelection, taxAmountInSmallestCurrencyUnits, areRulesLoading};
}

export default useTaxAmount;
