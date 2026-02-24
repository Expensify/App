import type {NullishDeep, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CustomUnit, Rate, TaxRateAttributes} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';
import {getMicroSecondOnyxErrorWithTranslationKey} from './ErrorUtils';
import getPermittedDecimalSeparator from './getPermittedDecimalSeparator';
import {replaceAllDigits} from './MoneyRequestUtils';
import {parseFloatAnyLocale} from './NumberUtils';

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

/**
 * Get the optimistic rate name in a way that matches BE logic
 * @param rates
 */
function getOptimisticRateName(rates: Record<string, Rate>): string {
    if (Object.keys(rates).length === 0) {
        return CONST.CUSTOM_UNITS.DEFAULT_RATE;
    }
    const newRateCount = Object.values(rates).filter((rate) => rate.name?.startsWith(CONST.CUSTOM_UNITS.NEW_RATE)).length;
    return newRateCount === 0 ? CONST.CUSTOM_UNITS.NEW_RATE : `${CONST.CUSTOM_UNITS.NEW_RATE} ${newRateCount}`;
}

type PolicyDistanceRateUpdateField = keyof Pick<Rate, 'name' | 'rate'> | keyof TaxRateAttributes;

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

export {validateRateValue, getOptimisticRateName, validateTaxClaimableValue, buildOnyxDataForPolicyDistanceRateUpdates};
export type {PolicyDistanceRateUpdateField};
