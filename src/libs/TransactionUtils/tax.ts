/**
 * Helpers for an expense's tax: resolving the default and category tax rates, calculating the tax amount,
 * and building the tax names and titles shown in the UI.
 * Extracted from TransactionUtils/index.ts to keep that file smaller.
 */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {getCategoryDefaultTaxRate} from '@libs/CategoryUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getDistanceRateCustomUnit, getDistanceRateCustomUnitRate, isSelectableTaxCode, resolveCurrentTaxCode} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {Policy, TaxRate, TaxRates, Transaction} from '@src/types/onyx';
import type {ExpenseRule, Unit} from '@src/types/onyx/Policy';

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
 * Whether a distance rate carries a tax rate the user can still pick. Disabling a tax rate leaves the rate pointing at
 * it, so a rate the user can no longer pick is treated the same as a rate that never had one.
 */
function hasSelectableRateTaxCode(policy: OnyxEntry<Policy>, customUnitRateID: string): boolean {
    const rateTaxCode = getDistanceRateCustomUnitRate(policy, customUnitRateID)?.attributes?.taxRateExternalID;
    return isSelectableTaxCode(policy, rateTaxCode);
}

/**
 * The tax rate a category rule asks for, or the given default when no rule applies. Disabling a tax rate leaves the rule
 * pointing at it, so a rule the user can no longer pick also falls back rather than saving a rate the expense cannot carry.
 */
function getSelectableCategoryTaxCode(policy: OnyxEntry<Policy>, taxRules: ExpenseRule[], category: string, defaultTaxCode: string | undefined): string | undefined {
    const categoryTaxCode = getCategoryDefaultTaxRate(taxRules, category, defaultTaxCode);
    return categoryTaxCode && isSelectableTaxCode(policy, categoryTaxCode) ? categoryTaxCode : defaultTaxCode;
}

function getTaxExpenseRules(policy: OnyxEntry<Policy>): ExpenseRule[] {
    return policy?.rules?.expenseRules?.filter((rule) => rule.tax) ?? [];
}

/**
 * The tax rate a category rule applies to a distance expense, or undefined when no rule can apply.
 */
function getDistanceCategoryTaxCode(policy: OnyxEntry<Policy>, customUnitRateID: string, category: string, defaultTaxCode: string | undefined): string | undefined {
    const taxRules = getTaxExpenseRules(policy);
    // Tax tracking being off for distance rates hides the Tax field, so a value written there would be invisible, and a
    // rate carrying its own tax rate outranks the rule.
    if (taxRules.length === 0 || !getDistanceRateCustomUnit(policy)?.attributes?.taxEnabled || hasSelectableRateTaxCode(policy, customUnitRateID)) {
        return undefined;
    }
    return getSelectableCategoryTaxCode(policy, taxRules, category, defaultTaxCode);
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
        const customUnit = getDistanceRateCustomUnit(policy);
        if (!hasSelectableRateTaxCode(policy, customUnitRateID)) {
            // The policy default is only used while it is selectable itself.
            const defaultExternalID = policy?.taxRates?.defaultExternalID;
            return customUnit?.attributes?.taxEnabled && isSelectableTaxCode(policy, defaultExternalID) ? defaultExternalID : undefined;
        }
        return getDistanceRateCustomUnitRate(policy, customUnitRateID)?.attributes?.taxRateExternalID;
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
function transformedTaxRates(translate: LocalizedTranslate, policy: OnyxEntry<Policy> | undefined, transaction?: OnyxEntry<Transaction>): Record<string, TaxRate> {
    const taxRates = policy?.taxRates;
    const defaultExternalID = taxRates?.defaultExternalID;

    const defaultTaxCode = () => {
        if (!transaction) {
            return defaultExternalID;
        }

        return policy && getDefaultTaxCode(policy, transaction);
    };
    const getModifiedName = (data: TaxRate, code: string) => `${data.name} (${data.value})${defaultTaxCode() === code ? ` ${CONST.DOT_SEPARATOR} ${translate('common.default')}` : ''}`;
    const taxes = Object.fromEntries(Object.entries(taxRates?.taxes ?? {}).map(([code, data]) => [code, {...data, code, modifiedName: getModifiedName(data, code), name: data.name}]));
    return taxes;
}

/**
 * Gets the policy tax rate stored under the given tax code
 */
function getPolicyTaxRate(policy: OnyxEntry<Policy>, taxCode: string | undefined): TaxRate | undefined {
    return Object.entries(policy?.taxRates?.taxes ?? {}).find(([code]) => code === taxCode)?.[1];
}

/**
 * Gets the tax value of a selected tax
 */
function getTaxValue(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, taxCode: string) {
    return getPolicyTaxRate(policy, resolveCurrentTaxCode(policy, taxCode))?.value;
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
    category?: string,
): {taxAmount: number; taxCode: string; taxValue: string | undefined; categoryTaxCode: string | undefined} {
    const defaultTaxCode = getDefaultTaxCode(policy, transaction, undefined, customUnitRateID) ?? '';
    // A rate's own tax rate wins over a category rule, because vehicle types coded to the same category can each
    // reclaim at a different rate.
    const categoryTaxCode = getDistanceCategoryTaxCode(policy, customUnitRateID, category ?? transaction?.category ?? '', defaultTaxCode);
    const taxCode = categoryTaxCode ?? defaultTaxCode;
    const unit = distanceUnit ?? transaction?.comment?.customUnit?.distanceUnit;
    // A commute the workspace excludes from reimbursement is not reclaimable either, so only the rest of the trip is taxed.
    const commuterExclusionData = DistanceRequestUtils.getCommuterExclusionDisplayData(transaction?.comment?.customUnit, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
    const taxableDistance = commuterExclusionData
        ? DistanceRequestUtils.convertToDistanceInMeters(commuterExclusionData.reimbursableDistance, commuterExclusionData.distanceUnit)
        : getDistanceInMeters(transaction, unit);
    const taxableAmount = DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, taxableDistance);
    const taxValue = taxCode ? getTaxValue(policy, transaction, taxCode) : undefined;
    const mileageRates = DistanceRequestUtils.getMileageRates(policy);
    const rateCurrency = mileageRates[customUnitRateID]?.currency ?? transaction?.currency ?? CONST.CURRENCY.USD;
    const taxAmount = convertToBackendAmount(calculateTaxAmount(taxValue, taxableAmount, getCurrencyDecimals(rateCurrency)));

    return {taxAmount, taxCode, taxValue, categoryTaxCode};
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
function getWorkspaceTaxesSettingsName(translate: LocalizedTranslate, policy: OnyxEntry<Policy>, taxCode: string) {
    return Object.values(transformedTaxRates(translate, policy)).find((taxRate) => taxRate.code === taxCode)?.modifiedName;
}

/**
 * Gets the name corresponding to the taxCode that is displayed to the user
 */
function getTaxName(translate: LocalizedTranslate, policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, shouldFallbackToValue = false) {
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);

    // Only fall back to the default tax code when tax tracking is enabled on the policy.
    // When taxes are disabled and the user deletes a tax, taxCode becomes undefined (the API returns null, which Onyx strips).
    // Without this check, getTaxName would fall back to defaultTaxCode and display the default tax rate instead of showing empty.
    // We use || instead of ?? because taxCode may be an empty string, which should also trigger the fallback.
    const taxCodeToMatch = transaction?.taxCode || (policy?.tax?.trackingEnabled ? defaultTaxCode : undefined);
    const resolvedTaxCode = taxCodeToMatch ? resolveCurrentTaxCode(policy, taxCodeToMatch) : taxCodeToMatch;
    const taxRate = taxCodeToMatch ? Object.values(transformedTaxRates(translate, policy, transaction)).find((rate) => rate.code === resolvedTaxCode) : undefined;

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
    const taxRate = getPolicyTaxRate(policy, resolvedTaxCode);

    if (!transaction?.taxValue) {
        return !!taxRate;
    }

    return taxRate?.value === transaction?.taxValue;
}

/**
 * Gets the tax rate title for display, handling the case when moving expenses from track to submit
 */
function getTaxRateTitle(
    translate: LocalizedTranslate,
    policy: OnyxEntry<Policy>,
    transaction: OnyxEntry<Transaction>,
    isMovingFromTrackExpense: boolean,
    policyForMovingExpenses?: OnyxEntry<Policy>,
): string {
    const currentTaxName = getTaxName(translate, policy, transaction);

    if (currentTaxName) {
        // If moving from track expense show the tax name from the moving policy
        if (isMovingFromTrackExpense && !hasTaxRateWithMatchingValue(policy, transaction)) {
            return getTaxName(translate, policyForMovingExpenses, transaction) ?? '';
        }
        return getTaxName(translate, policy, transaction, true) ?? '';
    }

    // If no tax name on current policy but moving from track expense, use the moving policy
    if (isMovingFromTrackExpense) {
        return getTaxName(translate, policyForMovingExpenses, transaction, true) ?? '';
    }

    return '';
}

/**
 * Resolves the tax code an expense defaults to once the policy's category tax rules are applied, or undefined when no
 * rule can apply.
 */
function getCategoryTaxCode(category: string, transaction: OnyxEntry<Transaction>, policy: OnyxEntry<Policy>, currency?: string): string | undefined {
    if (isDistanceRequest(transaction)) {
        const customUnitRateID = getRateID(transaction);
        return getDistanceCategoryTaxCode(policy, customUnitRateID, category, getDefaultTaxCode(policy, transaction, undefined, customUnitRateID));
    }

    const taxRules = getTaxExpenseRules(policy);
    if (taxRules.length === 0) {
        return undefined;
    }

    return getSelectableCategoryTaxCode(policy, taxRules, category, getDefaultTaxCode(policy, transaction, currency ?? getCurrency(transaction)));
}

function getCategoryTaxDetails(
    category: string,
    transaction: OnyxEntry<Transaction>,
    policy: OnyxEntry<Policy>,
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
    currency?: string,
) {
    // Distance tax is charged on the taxable portion of the mileage rate rather than the full amount, so reuse the
    // rate-aware calculation instead of taxing the expense amount.
    if (isDistanceRequest(transaction)) {
        const {
            categoryTaxCode: distanceCategoryTaxCode,
            taxAmount,
            taxValue,
        } = getDistanceRateTaxUpdates(policy, transaction, getRateID(transaction), getCurrencyDecimals, undefined, category);
        if (!distanceCategoryTaxCode) {
            return {categoryTaxCode: undefined, categoryTaxAmount: undefined, categoryTaxValue: undefined};
        }
        return {categoryTaxCode: distanceCategoryTaxCode, categoryTaxAmount: taxAmount, categoryTaxValue: taxValue};
    }

    const categoryTaxCode = getCategoryTaxCode(category, transaction, policy, currency);
    if (!categoryTaxCode) {
        return {categoryTaxCode: undefined, categoryTaxAmount: undefined, categoryTaxValue: undefined};
    }

    const categoryTaxPercentage = getTaxValue(policy, transaction, categoryTaxCode);
    let categoryTaxAmount;

    if (categoryTaxPercentage) {
        categoryTaxAmount = convertToBackendAmount(calculateTaxAmount(categoryTaxPercentage, getAmount(transaction), getCurrencyDecimals(getCurrency(transaction))));
    }

    return {categoryTaxCode, categoryTaxAmount, categoryTaxValue: categoryTaxPercentage};
}

export {
    calculateTaxAmount,
    getCalculatedTaxAmount,
    getCategoryTaxCode,
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
