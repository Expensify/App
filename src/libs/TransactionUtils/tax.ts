/**
 * Helpers for an expense's tax: resolving the default and category tax rates, calculating the tax amount,
 * and building the tax names and titles shown in the UI.
 * Extracted from TransactionUtils/index.ts to keep that file smaller.
 */
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {getCategoryDefaultTaxRate} from '@libs/CategoryUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {translateLocal} from '@libs/Localize';
import {getDistanceRateCustomUnit, getDistanceRateCustomUnitRate, isSelectableTaxCode, resolveCurrentTaxCode} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {Policy, TaxRate, TaxRates, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import getDistanceInMeters from './getDistanceInMeters';
// This cycle import is safe because this file was extracted from TransactionUtils/index.ts, which re-exports it.
// The functions imported here are pure helpers that aren't called at initialization time.
// eslint-disable-next-line import/no-cycle
import {getAmount, getCurrency, getRateID, getTaxCode, isDistanceRequest} from './index';

/**
 * Calculates tax amount from the given expense amount and tax percentage
 */
function calculateTaxAmount(percentage: string | undefined, amount: number, decimals: number) {
    if (!percentage) {
        return 0;
    }

    const divisor = Number(percentage.slice(0, -1)) / 100 + 1;
    const taxAmount = (amount - amount / divisor) / 100;
    return parseFloat(taxAmount.toFixed(decimals));
}

/**
 * Calculates count of all tax enabled options
 */
function getEnabledTaxRateCount(options: TaxRates) {
    return Object.values(options).filter((option: TaxRate) => !option.isDisabled).length;
}

/**
 * Gets the tax code based on the type of transaction and selected currency.
 * If it is distance request, then returns the tax code corresponding to the custom unit rate
 * Else returns policy default tax rate if transaction is in policy default currency, otherwise foreign default tax rate
 */
function getDefaultTaxCode(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, currency?: string | undefined, newCustomUnitRateID?: string): string | undefined {
    if (isDistanceRequest(transaction)) {
        // When editing a distance rate, the draft transaction's customUnitRateID
        // does not reflect the newly selected rate until setMoneyRequestDistanceRate is called, and the draft transaction's is updated.
        // Therefore, to correctly determine the tax code for the selected rate, we must use the newly selected distance rate's customUnitRateID (newCustomUnitRateID)
        // instead of relying on the transaction's current customUnitRateID.
        const customUnitRateID = newCustomUnitRateID ?? getRateID(transaction) ?? '';
        const customUnitRate = getDistanceRateCustomUnitRate(policy, customUnitRateID);
        const customUnit = getDistanceRateCustomUnit(policy);
        const rateTaxCode = customUnitRate?.attributes?.taxRateExternalID;
        // Disabling a tax rate leaves the distance rate still pointing at it, so a rate the user can no longer pick is
        // treated the same as a missing one, and the policy default is only used while it is selectable.
        const isRateTaxCodeUnusable = !!rateTaxCode && !isSelectableTaxCode(policy, rateTaxCode);
        if ((!rateTaxCode || isRateTaxCodeUnusable) && customUnit?.attributes?.taxEnabled) {
            const defaultExternalID = policy?.taxRates?.defaultExternalID;
            return isSelectableTaxCode(policy, defaultExternalID) ? defaultExternalID : undefined;
        }
        return isRateTaxCodeUnusable ? undefined : rateTaxCode;
    }
    const defaultExternalID = policy?.taxRates?.defaultExternalID;
    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault;
    return policy?.outputCurrency === (currency ?? getCurrency(transaction)) ? defaultExternalID : foreignTaxDefault;
}

/**
 * Transforms tax rates to a new object format - to add codes and new name with concatenated name and value.
 *
 * @param  policy - The policy which the user has access to and which the report is tied to.
 * @returns The transformed tax rates object.g
 */
function transformedTaxRates(policy: OnyxEntry<Policy> | undefined, transaction?: OnyxEntry<Transaction>): Record<string, TaxRate> {
    const taxRates = policy?.taxRates;
    const defaultExternalID = taxRates?.defaultExternalID;

    const defaultTaxCode = () => {
        if (!transaction) {
            return defaultExternalID;
        }

        return policy && getDefaultTaxCode(policy, transaction);
    };
    const getModifiedName = (data: TaxRate, code: string) => `${data.name} (${data.value})${defaultTaxCode() === code ? ` ${CONST.DOT_SEPARATOR} ${translateLocal('common.default')}` : ''}`;
    const taxes = Object.fromEntries(Object.entries(taxRates?.taxes ?? {}).map(([code, data]) => [code, {...data, code, modifiedName: getModifiedName(data, code), name: data.name}]));
    return taxes;
}

/**
 * Gets the tax value of a selected tax
 */
function getTaxValue(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, taxCode: string) {
    const resolvedTaxCode = resolveCurrentTaxCode(policy, taxCode);
    return Object.values(transformedTaxRates(policy, transaction)).find((taxRate) => taxRate.code === resolvedTaxCode)?.value;
}

/**
 * Computes tax amount, code, and value when a workspace distance expense uses a given mileage rate.
 */
function getDistanceRateTaxUpdates(
    policy: OnyxEntry<Policy>,
    transaction: OnyxEntry<Transaction>,
    customUnitRateID: string,
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
    distanceUnit?: Unit,
): {taxAmount: number; taxCode: string; taxValue: string | undefined} {
    // getDefaultTaxCode already returns the rate's own tax code when it is still selectable, and falls back to the policy
    // default when it is empty, disabled, or pending delete.
    const taxCode = getDefaultTaxCode(policy, transaction, undefined, customUnitRateID) ?? '';
    const taxableAmount = DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, getDistanceInMeters(transaction, distanceUnit ?? transaction?.comment?.customUnit?.distanceUnit));
    const taxValue = taxCode ? getTaxValue(policy, transaction, taxCode) : undefined;
    const mileageRates = DistanceRequestUtils.getMileageRates(policy);
    const rateCurrency = mileageRates[customUnitRateID]?.currency ?? transaction?.currency ?? CONST.CURRENCY.USD;
    const taxAmount = convertToBackendAmount(calculateTaxAmount(taxValue, taxableAmount, getCurrencyDecimals(rateCurrency)));

    return {taxAmount, taxCode, taxValue};
}

/**
 * Returns the maximum allowed tax amount (in the smallest currency units) for a transaction,
 * i.e. the tax computed from the selected tax rate (or the policy default) and the expense amount.
 * Used to validate manually entered tax amounts so they can't exceed the calculated tax.
 */
function getCalculatedTaxAmount(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, currency: string, decimals: number): number {
    const taxableAmount = Math.abs(getAmount(transaction));
    const taxCode = transaction?.taxCode ?? getDefaultTaxCode(policy, transaction, currency) ?? '';
    const taxPercentage = getTaxValue(policy, transaction, taxCode) ?? '';
    return convertToBackendAmount(calculateTaxAmount(taxPercentage, taxableAmount, decimals));
}

/**
 * Gets the tax name for Workspace Taxes Settings
 */
function getWorkspaceTaxesSettingsName(policy: OnyxEntry<Policy>, taxCode: string) {
    return Object.values(transformedTaxRates(policy)).find((taxRate) => taxRate.code === taxCode)?.modifiedName;
}

/**
 * Gets the name corresponding to the taxCode that is displayed to the user
 */
function getTaxName(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, shouldFallbackToValue = false) {
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);

    // Only fall back to the default tax code when tax tracking is enabled on the policy.
    // When taxes are disabled and the user deletes a tax, taxCode becomes undefined (the API returns null, which Onyx strips).
    // Without this check, getTaxName would fall back to defaultTaxCode and display the default tax rate instead of showing empty.
    // We use || instead of ?? because taxCode may be an empty string, which should also trigger the fallback.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const taxCodeToMatch = transaction?.taxCode || (policy?.tax?.trackingEnabled ? defaultTaxCode : undefined);
    const resolvedTaxCode = taxCodeToMatch ? resolveCurrentTaxCode(policy, taxCodeToMatch) : taxCodeToMatch;
    const taxRate = taxCodeToMatch ? Object.values(transformedTaxRates(policy, transaction)).find((rate) => rate.code === resolvedTaxCode) : undefined;

    if (shouldFallbackToValue && transaction?.taxValue !== undefined && taxRate?.value !== transaction?.taxValue) {
        return transaction?.taxValue;
    }

    return taxRate?.modifiedName;
}

/**
 * Checks if the tax rate with matching transaction's tax rate value exists in the policy tax rates
 */
function hasTaxRateWithMatchingValue(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>) {
    if (!policy || !transaction) {
        return false;
    }

    const transactionTaxCode = getTaxCode(transaction);
    const resolvedTaxCode = transactionTaxCode ? resolveCurrentTaxCode(policy, transactionTaxCode) : transactionTaxCode;
    const transformedRates = transformedTaxRates(policy, transaction);
    const taxRate = Object.values(transformedRates).find((rate) => rate.code === resolvedTaxCode);

    if (!transaction?.taxValue) {
        return !!taxRate;
    }

    return taxRate?.value === transaction?.taxValue;
}

/**
 * Gets the tax rate title for display, handling the case when moving expenses from track to submit
 */
function getTaxRateTitle(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, isMovingFromTrackExpense: boolean, policyForMovingExpenses?: OnyxEntry<Policy>): string {
    const currentTaxName = getTaxName(policy, transaction);

    if (currentTaxName) {
        // If moving from track expense show the tax name from the moving policy
        if (isMovingFromTrackExpense && !hasTaxRateWithMatchingValue(policy, transaction)) {
            return getTaxName(policyForMovingExpenses, transaction) ?? '';
        }
        return getTaxName(policy, transaction, true) ?? '';
    }

    // If no tax name on current policy but moving from track expense, use the moving policy
    if (isMovingFromTrackExpense) {
        return getTaxName(policyForMovingExpenses, transaction, true) ?? '';
    }

    return '';
}

function getCategoryTaxDetails(category: string, transaction: OnyxEntry<Transaction>, policy: OnyxEntry<Policy>, getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals']) {
    const taxRules = policy?.rules?.expenseRules?.filter((rule) => rule.tax);
    if (!taxRules || taxRules?.length === 0 || isDistanceRequest(transaction)) {
        return {categoryTaxCode: undefined, categoryTaxAmount: undefined, categoryTaxValue: undefined};
    }

    const defaultTaxCode = getDefaultTaxCode(policy, transaction, getCurrency(transaction));
    const categoryTaxCode = getCategoryDefaultTaxRate(taxRules, category, defaultTaxCode);
    const categoryTaxPercentage = getTaxValue(policy, transaction, categoryTaxCode ?? '');
    let categoryTaxAmount;

    if (categoryTaxPercentage) {
        categoryTaxAmount = convertToBackendAmount(calculateTaxAmount(categoryTaxPercentage, getAmount(transaction), getCurrencyDecimals(getCurrency(transaction))));
    }

    return {categoryTaxCode, categoryTaxAmount, categoryTaxValue: categoryTaxPercentage};
}

export {
    calculateTaxAmount,
    getCalculatedTaxAmount,
    getCategoryTaxDetails,
    getDefaultTaxCode,
    getDistanceRateTaxUpdates,
    getEnabledTaxRateCount,
    getTaxName,
    getTaxRateTitle,
    getTaxValue,
    getWorkspaceTaxesSettingsName,
    hasTaxRateWithMatchingValue,
    transformedTaxRates,
};
