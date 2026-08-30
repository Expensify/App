import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {GovernmentRateCountry, IOURequestType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {CustomUnit, Rate, RateAttributes, Unit} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

import type {NullishDeep, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {getMicroSecondOnyxErrorWithTranslationKey} from './ErrorUtils';
import getPermittedDecimalSeparator from './getPermittedDecimalSeparator';
import {replaceAllDigits} from './MoneyRequestUtils';
import {parseFloatAnyLocale} from './NumberUtils';
import {isRequiredFulfilled} from './ValidationUtils';

type RateValueForm = typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM | typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM;

type TaxReclaimableForm = typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT_FORM;

function validateRateValue(values: FormOnyxValues<RateValueForm>, toLocaleDigit: (arg: string) => string, translate: LocalizedTranslate): FormInputErrors<RateValueForm> {
    const errors: FormInputErrors<RateValueForm> = {};
    const parsedRate = replaceAllDigits(values.rate, toLocaleDigit);
    const decimalSeparator = toLocaleDigit('.');

    // Allow one more decimal place for accuracy
    const rateValueRegex = RegExp(String.raw`^-?\d{0,${CONST.IOU.AMOUNT_MAX_LENGTH}}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{0,${CONST.MAX_TAX_RATE_DECIMAL_PLACES}})?$`, 'i');
    if (!rateValueRegex.test(parsedRate) || parsedRate === '') {
        errors.rate = translate('common.error.invalidRateError');
    } else if (parseFloatAnyLocale(parsedRate) <= 0) {
        errors.rate = translate('common.error.lowRateError');
    }
    return errors;
}

function validateTaxClaimableValue(values: FormOnyxValues<TaxReclaimableForm>, rate: Rate | undefined, translate: LocalizedTranslate): FormInputErrors<TaxReclaimableForm> {
    const errors: FormInputErrors<TaxReclaimableForm> = {};

    if (rate?.rate && Number(values.taxClaimableValue) >= rate.rate / 100) {
        errors.taxClaimableValue = translate('workspace.taxes.error.updateTaxClaimableFailureMessage');
    }
    return errors;
}

function validateCreateDistanceRateForm(
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>,
    toLocaleDigit: (arg: string) => string,
    translate: LocalizedTranslate,
    existingRateNames: string[],
): FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM> {
    const errors: FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM> = {};
    const trimmedName = values.name?.trim() ?? '';

    if (!isRequiredFulfilled(trimmedName)) {
        errors.name = translate('workspace.distanceRates.errors.nameRequired');
    } else if ([...trimmedName].length > CONST.TAX_RATES.NAME_MAX_LENGTH) {
        errors.name = translate('common.error.characterLimitExceedCounter', [...trimmedName].length, CONST.TAX_RATES.NAME_MAX_LENGTH);
    } else if (existingRateNames.includes(trimmedName)) {
        errors.name = translate('workspace.distanceRates.errors.existingRateName');
    }

    if (!isRequiredFulfilled(values.rate)) {
        errors.rate = translate('workspace.distanceRates.errors.amountRequired');
    } else {
        const rateErrors = validateRateValue(values, toLocaleDigit, translate);
        if (rateErrors.rate) {
            errors.rate = rateErrors.rate;
        }
    }

    if (values.startDate && values.endDate && values.startDate > values.endDate) {
        errors.startDate = translate('workspace.distanceRates.errors.startDateMustBeBeforeEndDate');
    }

    return errors;
}

type PolicyDistanceRateUpdateField = keyof Pick<Rate, 'name' | 'rate' | 'startDate' | 'endDate'> | keyof RateAttributes;

/**
 * Builds optimistic, success, and failure Onyx data for policy distance rate updates
 * @param policyID - The policy ID
 * @param customUnit - The custom unit being updated
 * @param customUnitRates - The rates being updated
 * @param fieldName - The field name being updated
 * @returns Object containing optimisticData, successData, and failureData arrays
 */
function buildOnyxDataForPolicyDistanceRateUpdates(
    policyID: string,
    customUnit: CustomUnit,
    customUnitRates: Rate[],
    fieldName: PolicyDistanceRateUpdateField,
): OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> {
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, NullishDeep<Rate>> = {};
    const successRates: Record<string, NullishDeep<Rate>> = {};
    const failureRates: Record<string, NullishDeep<Rate>> = {};
    const rateIDs = new Set(customUnitRates.map((rate) => rate.customUnitRateID));

    for (const rateID of Object.keys(customUnit.rates)) {
        if (rateIDs.has(rateID)) {
            const foundRate = customUnitRates.find((rate) => rate.customUnitRateID === rateID);
            optimisticRates[rateID] = {
                ...foundRate,
                pendingFields: {[fieldName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            };
            successRates[rateID] = {
                ...foundRate,
                pendingFields: {[fieldName]: null},
            };
            failureRates[rateID] = {
                ...currentRates[rateID],
                pendingFields: {[fieldName]: null},
                errorFields: {[fieldName]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
            };
        }
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: optimisticRates,
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: successRates,
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: failureRates,
                    },
                },
            },
        },
    ];

    return {optimisticData, successData, failureData};
}

function getRateStatus(rate: Rate): string {
    if (!rate.enabled) {
        return CONST.CUSTOM_UNITS.RATE_STATUS.INACTIVE;
    }

    const today = new Date();
    const now = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (rate.startDate && rate.startDate > now) {
        return CONST.CUSTOM_UNITS.RATE_STATUS.FUTURE;
    }

    if (rate.endDate && rate.endDate < now) {
        return CONST.CUSTOM_UNITS.RATE_STATUS.EXPIRED;
    }

    return CONST.CUSTOM_UNITS.RATE_STATUS.ACTIVE;
}

/**
 * Whether a government-managed rate still matches the government-published snapshot it was copied from.
 * Returns true only when the rate amount, start date, and end date each match the snapshot in attributes.governmentRate.
 * The amount is compared within a small tolerance to absorb floating-point noise from the stored cents value.
 * A date omitted on both sides counts as a match; a date omitted on only one side does not.
 */
function isGovernmentRateUnmodified(rate: Rate): boolean {
    const governmentRate = rate.attributes?.governmentRate;
    // A snapshot without a rate amount (e.g. malformed data) can never be matched, otherwise `undefined === undefined` would
    // incorrectly report an unset rate as unmodified.
    if (!governmentRate || governmentRate.rate === undefined || rate.rate === undefined) {
        return false;
    }

    // The submit path stores the amount as `Number(value) * 100`, which can introduce tiny floating-point errors (e.g. restoring
    // 0.29 yields 28.999999999999996), so compare amounts within a tolerance rather than requiring strict equality.
    const isRateAmountMatching = Math.abs(rate.rate - governmentRate.rate) < CONST.CUSTOM_UNITS.GOVERNMENT_RATE_MATCH_TOLERANCE;

    return isRateAmountMatching && (rate.startDate ?? undefined) === governmentRate.startDate && (rate.endDate ?? undefined) === governmentRate.endDate;
}

/** The country publishing government mileage rates for a currency, or undefined when we can't auto-update them. */
function getGovernmentRateCountryForCurrency(currency?: string): GovernmentRateCountry | undefined {
    if (!currency) {
        return undefined;
    }

    const currencyToCountry: Record<string, GovernmentRateCountry> = CONST.CUSTOM_UNITS.GOVERNMENT_RATE_CURRENCY_TO_COUNTRY;
    return currencyToCountry[currency];
}

/** Whether we can auto-update government distance rates for this output currency. */
function isCurrencySupportedForAutoUpdate(currency?: string): boolean {
    return !!getGovernmentRateCountryForCurrency(currency);
}

/** The unit the currency's country publishes its mileage rates in. */
function getExpectedUnitForCurrency(currency?: string): Unit | undefined {
    const country = getGovernmentRateCountryForCurrency(currency);
    return country ? CONST.CUSTOM_UNITS.GOVERNMENT_RATE_COUNTRY_TO_UNIT[country] : undefined;
}

/** Translation key for the country phrase in the auto-update copy, e.g. "the United States". */
function getGovernmentRateCountryPhraseTranslationKey(currency?: string): TranslationPaths | undefined {
    const country = getGovernmentRateCountryForCurrency(currency);
    if (!country) {
        return undefined;
    }

    return `workspace.distanceRates.governmentRateCountries.${country}`;
}

function isCommuterExclusionEnabled(policy: Policy | null | undefined): policy is Policy & {id: string; commuterExclusions: NonNullable<Policy['commuterExclusions']>} {
    return !!policy?.id && !!policy.commuterExclusions;
}

/**
 * Whether distance expenses on this workspace must come from a mapped route or a GPS track, which rules out the
 * manual and odometer flows. Commuter exclusions are derived from the mapped route, so configuring them enforces
 * the requirement on its own, whatever `requireMapOrGPS` is set to.
 */
function isMapOrGPSRequired(policy: Policy | null | undefined): boolean {
    if (!policy?.id) {
        return false;
    }

    return !!policy.requireMapOrGPS || isCommuterExclusionEnabled(policy);
}

/**
 * The distance type an entry point should open the flow on. `lastDistanceExpenseType` only records what the member
 * picked last time, so it goes stale the moment the workspace starts requiring GPS or map entry. Falling back to map
 * matches what the start page renders anyway, since it hides the manual and odometer tabs, and it keeps a stale
 * preference from blocking a flow the member is still allowed to start.
 */
function getDistanceExpenseTypeForPolicy(policy: Policy | null | undefined, lastDistanceExpenseType: IOURequestType | undefined): IOURequestType | undefined {
    const isManualOrOdometer = lastDistanceExpenseType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL || lastDistanceExpenseType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER;

    if (!isManualOrOdometer || !isMapOrGPSRequired(policy)) {
        return lastDistanceExpenseType;
    }

    return CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
}

export {
    validateRateValue,
    validateTaxClaimableValue,
    validateCreateDistanceRateForm,
    buildOnyxDataForPolicyDistanceRateUpdates,
    getRateStatus,
    getGovernmentRateCountryForCurrency,
    isCurrencySupportedForAutoUpdate,
    getExpectedUnitForCurrency,
    getGovernmentRateCountryPhraseTranslationKey,
    isCommuterExclusionEnabled,
    isMapOrGPSRequired,
    getDistanceExpenseTypeForPolicy,
    isGovernmentRateUnmodified,
};
