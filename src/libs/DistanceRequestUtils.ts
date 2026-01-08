import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {LastSelectedDistanceRates, OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getCurrencySymbol} from './CurrencyUtils';
import {getDistanceRateCustomUnit, getDistanceRateCustomUnitRate, getPersonalPolicy, getUnitRateValue} from './PolicyUtils';
import {getCurrency, getRateID, isCustomUnitRateIDForP2P} from './TransactionUtils';

type MileageRate = {
    customUnitRateID?: string;
    rate?: number;
    currency?: string;
    unit: Unit;
    name?: string;
    enabled?: boolean;
    index?: number;
};

const METERS_TO_KM = 0.001; // 1 kilometer is 1000 meters
const METERS_TO_MILES = 0.000621371; // There are approximately 0.000621371 miles in a meter

function getMileageRates(policy: OnyxInputOrEntry<Policy>, includeDisabledRates = false, selectedRateID?: string): Record<string, MileageRate> {
    const mileageRates: Record<string, MileageRate> = {};

    if (!policy?.customUnits) {
        return mileageRates;
    }

    const distanceUnit = getDistanceRateCustomUnit(policy);
    if (!distanceUnit?.rates) {
        return mileageRates;
    }

    for (const [rateID, rate] of Object.entries(distanceUnit.rates)) {
        if (!includeDisabledRates && rate.enabled === false && (!selectedRateID || rateID !== selectedRateID)) {
            continue;
        }

        if (!distanceUnit.attributes) {
            continue;
        }

        mileageRates[rateID] = {
            rate: rate.rate,
            currency: rate.currency,
            unit: distanceUnit.attributes.unit,
            name: rate.name,
            customUnitRateID: rate.customUnitRateID,
            enabled: rate.enabled,
            index: rate.index,
        };
    }

    return mileageRates;
}

/**
 * Retrieves the default mileage rate based on a given policy.
 * Default rate is the first created rate when you create the policy.
 * It's NOT always the rate whose name is "Default rate" because rate name is now changeable.
 *
 * @param policy - The policy from which to extract the default mileage rate.
 *
 * @returns An object containing the rate and unit for the default mileage or null if not found.
 * @returns [rate] - The default rate for the mileage.
 * @returns [currency] - The currency associated with the rate.
 * @returns [unit] - The unit of measurement for the distance.
 */
function getDefaultMileageRate(policy: OnyxInputOrEntry<Policy>): MileageRate | undefined {
    if (isEmptyObject(policy) || !policy?.customUnits) {
        return undefined;
    }

    const distanceUnit = getDistanceRateCustomUnit(policy);
    if (!distanceUnit?.rates || !distanceUnit.attributes) {
        return;
    }
    const mileageRates = Object.values(getMileageRates(policy)).sort((a, b) => {
        const aIndex = a.index ?? CONST.DEFAULT_NUMBER_ID;
        const bIndex = b.index ?? CONST.DEFAULT_NUMBER_ID;
        return aIndex - bIndex;
    });

    const distanceRate = mileageRates.at(0) ?? ({} as MileageRate);

    return {
        customUnitRateID: distanceRate.customUnitRateID,
        rate: distanceRate.rate,
        currency: distanceRate.currency,
        unit: distanceUnit.attributes.unit,
        name: distanceRate.name,
        index: distanceRate.index,
    };
}

/**
 * Converts a given distance in meters to the specified unit (kilometers or miles).
 *
 * @param distanceInMeters - The distance in meters to be converted.
 * @param unit - The desired unit of conversion, either 'km' for kilometers or 'mi' for miles.
 *
 * @returns The converted distance in the specified unit.
 */
function convertDistanceUnit(distanceInMeters: number, unit: Unit): number {
    switch (unit) {
        case CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS:
            return distanceInMeters * METERS_TO_KM;
        case CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES:
            return distanceInMeters * METERS_TO_MILES;
        default:
            throw new Error('Unsupported unit. Supported units are "mi" or "km".');
    }
}

/**
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @returns The distance in requested units, rounded to 2 decimals
 */
function getRoundedDistanceInUnits(distanceInMeters: number, unit: Unit): string {
    const convertedDistance = convertDistanceUnit(distanceInMeters, unit);
    return convertedDistance.toFixed(CONST.DISTANCE_DECIMAL_PLACES);
}

/**
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param currency The currency associated with the rate
 * @param translate Translate function
 * @param toLocaleDigit Function to convert to localized digit
 * @param useShortFormUnit If true, the unit will be returned in short form (e.g., "mi", "km").
 * @returns A string that displays the rate used for expense calculation
 */
function getRateForDisplay(
    unit: Unit | undefined,
    rate: number | undefined,
    currency: string | undefined,
    translate: LocaleContextProps['translate'],
    toLocaleDigit: LocaleContextProps['toLocaleDigit'],
    isOffline?: boolean,
    useShortFormUnit?: boolean,
): string {
    if (isOffline && !rate) {
        return translate('iou.defaultRate');
    }
    if (!rate || !currency || !unit) {
        return translate('iou.fieldPending');
    }

    const singularDistanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');
    const formattedRate = getUnitRateValue(toLocaleDigit, {rate}, useShortFormUnit);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const currencySymbol = getCurrencySymbol(currency) || `${currency} `;

    return `${currencySymbol}${formattedRate} / ${useShortFormUnit ? unit : singularDistanceUnit}`;
}

/**
 * @param hasRoute Whether the route exists for the distance expense
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param translate Translate function
 * @param useShortFormUnit If true, the unit will be returned in short form (e.g., "mi", "km").
 * @returns A string that describes the distance traveled
 */
function getDistanceForDisplay(
    hasRoute: boolean,
    distanceInMeters: number,
    unit: Unit | undefined,
    rate: number | undefined,
    translate: LocaleContextProps['translate'],
    useShortFormUnit?: boolean,
): string {
    if (!hasRoute || !unit || !distanceInMeters) {
        return translate('iou.fieldPending');
    }

    const distanceInUnits = getRoundedDistanceInUnits(distanceInMeters, unit);
    if (useShortFormUnit) {
        return `${distanceInUnits} ${unit}`;
    }

    const distanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.miles') : translate('common.kilometers');
    const singularDistanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');
    const unitString = distanceInUnits === '1' ? singularDistanceUnit : distanceUnit;

    return `${distanceInUnits} ${unitString}`;
}

function getDistanceForDisplayLabel(distanceInMeters: number, unit: Unit): string {
    const distanceInUnits = getRoundedDistanceInUnits(distanceInMeters, unit);
    return `${distanceInUnits} ${unit}`;
}

/**
 * @param hasRoute Whether the route exists for the distance expense
 * @param distanceInMeters Distance traveled
 * @param unit Unit that should be used to display the distance
 * @param rate Expensable amount allowed per unit
 * @param currency The currency associated with the rate
 * @param translate Translate function
 * @param toLocaleDigit Function to convert to localized digit
 * @returns A string that describes the distance traveled and the rate used for expense calculation
 */
function getDistanceMerchant(
    hasRoute: boolean,
    distanceInMeters: number,
    unit: Unit | undefined,
    rate: number | undefined,
    currency: string,
    translate: LocaleContextProps['translate'],
    toLocaleDigit: LocaleContextProps['toLocaleDigit'],
): string {
    if (!hasRoute || !rate) {
        return translate('iou.fieldPending');
    }

    const distanceInUnits = getDistanceForDisplay(hasRoute, distanceInMeters, unit, rate, translate, true);
    const ratePerUnit = getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, undefined, true);

    return `${distanceInUnits} ${CONST.DISTANCE_MERCHANT_SEPARATOR} ${ratePerUnit}`;
}

function ensureRateDefined(rate: number | undefined): asserts rate is number {
    if (rate !== undefined) {
        return;
    }
    throw new Error('All default P2P rates should have a rate defined');
}

/**
 * Retrieves the rate and unit for a P2P distance expense for a given currency.
 *
 * Let's ensure this logic is consistent with the logic in the backend (Auth), since we're using the same method to calculate the rate value in distance requests created via Concierge.
 *
 * @param currency
 * @returns The rate and unit in MileageRate object.
 */
function getRateForP2P(currency: string, transaction: OnyxEntry<Transaction>): MileageRate {
    const currencyWithExistingRate = CONST.CURRENCY_TO_DEFAULT_MILEAGE_RATE[currency] ? currency : CONST.CURRENCY.USD;
    const mileageRate = CONST.CURRENCY_TO_DEFAULT_MILEAGE_RATE[currencyWithExistingRate];
    ensureRateDefined(mileageRate.rate);

    // Ensure the rate is updated when the currency changes, otherwise use the stored rate
    const rate = getCurrency(transaction) === currency ? (transaction?.comment?.customUnit?.defaultP2PRate ?? mileageRate.rate) : mileageRate.rate;
    return {
        ...mileageRate,
        currency: currencyWithExistingRate,
        rate,
    };
}

/**
 * Calculates the expense amount based on distance, unit, and rate.
 *
 * @param distance - The distance traveled in meters
 * @param unit - The unit of measurement for the distance
 * @param rate - Rate used for calculating the expense amount
 * @returns The computed expense amount (rounded) in "cents".
 */
function getDistanceRequestAmount(distance: number, unit: Unit, rate: number): number {
    const convertedDistance = convertDistanceUnit(distance, unit);
    const roundedDistance = parseFloat(convertedDistance.toFixed(2));
    return Math.round(roundedDistance * rate);
}

/**
 * Converts the distance from kilometers or miles to meters.
 *
 * @param distance - The distance to be converted.
 * @param unit - The unit of measurement for the distance.
 * @returns The distance in meters.
 */
function convertToDistanceInMeters(distance: number, unit: Unit): number {
    if (unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS) {
        return distance / METERS_TO_KM;
    }
    return distance / METERS_TO_MILES;
}

/**
 * Returns custom unit rate ID for the distance transaction
 */
function getCustomUnitRateID({
    reportID,
    isPolicyExpenseChat,
    policy,
    lastSelectedDistanceRates,
}: {
    reportID: string | undefined;
    isPolicyExpenseChat: boolean;
    policy: OnyxEntry<Policy> | undefined;
    lastSelectedDistanceRates?: OnyxEntry<LastSelectedDistanceRates>;
}): string {
    let customUnitRateID: string = CONST.CUSTOM_UNITS.FAKE_P2P_ID;

    if (!reportID) {
        return customUnitRateID;
    }

    if (reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
        return customUnitRateID;
    }

    if (isEmptyObject(policy)) {
        return customUnitRateID;
    }

    if (isPolicyExpenseChat) {
        const distanceUnit = Object.values(policy.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
        const lastSelectedDistanceRateID = lastSelectedDistanceRates?.[policy.id];
        const lastSelectedDistanceRate = lastSelectedDistanceRateID ? distanceUnit?.rates[lastSelectedDistanceRateID] : undefined;
        if (lastSelectedDistanceRate?.enabled && lastSelectedDistanceRateID) {
            customUnitRateID = lastSelectedDistanceRateID;
        } else {
            const defaultMileageRate = getDefaultMileageRate(policy);
            if (!defaultMileageRate?.customUnitRateID) {
                return customUnitRateID;
            }
            customUnitRateID = defaultMileageRate.customUnitRateID;
        }
    }

    return customUnitRateID;
}

/**
 * Get taxable amount from a specific distance rate, taking into consideration the tax claimable amount configured for the distance rate
 */
function getTaxableAmount(policy: OnyxEntry<Policy>, customUnitRateID: string, distance: number) {
    const distanceUnit = getDistanceRateCustomUnit(policy);
    const customUnitRate = getDistanceRateCustomUnitRate(policy, customUnitRateID);
    if (!distanceUnit?.customUnitID || !customUnitRate) {
        return 0;
    }
    const unit = distanceUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const rate = customUnitRate?.rate ?? CONST.DEFAULT_NUMBER_ID;
    const amount = getDistanceRequestAmount(distance, unit, rate);
    const taxClaimablePercentage = customUnitRate.attributes?.taxClaimablePercentage ?? 1;
    return amount * taxClaimablePercentage;
}

function getDistanceUnit(transaction: OnyxEntry<Transaction>, mileageRate: OnyxEntry<MileageRate>): Unit {
    return transaction?.comment?.customUnit?.distanceUnit ?? mileageRate?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
}

/**
 * Get the selected rate for a transaction, from the policy or P2P default rate.
 * Use the distanceUnit stored on the transaction by default to prevent policy changes modifying existing transactions. Otherwise, get the unit from the rate.
 *
 * Let's ensure this logic is consistent with the logic in the backend (Auth), since we're using the same method to calculate the rate value in distance requests created via Concierge.
 */
function getRate({
    transaction,
    policy,
    policyDraft,
    useTransactionDistanceUnit = true,
}: {
    transaction: OnyxEntry<Transaction>;
    policy: OnyxEntry<Policy>;
    policyDraft?: OnyxEntry<Policy>;
    useTransactionDistanceUnit?: boolean;
}): MileageRate {
    let mileageRates = getMileageRates(policy, true, transaction?.comment?.customUnit?.customUnitRateID);
    if (isEmptyObject(mileageRates) && policyDraft) {
        mileageRates = getMileageRates(policyDraft, true, transaction?.comment?.customUnit?.customUnitRateID);
    }
    const policyCurrency = policy?.outputCurrency ?? getPersonalPolicy()?.outputCurrency ?? CONST.CURRENCY.USD;
    const defaultMileageRate = getDefaultMileageRate(policy);
    const customUnitRateID = getRateID(transaction);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const customMileageRate = (customUnitRateID && mileageRates?.[customUnitRateID]) || defaultMileageRate;
    const mileageRate = isCustomUnitRateIDForP2P(transaction) ? getRateForP2P(policyCurrency, transaction) : customMileageRate;
    const unit = getDistanceUnit(useTransactionDistanceUnit ? transaction : undefined, mileageRate);
    return {
        ...mileageRate,
        unit,
        currency: mileageRate?.currency ?? policyCurrency,
    };
}

/**
 * Get the updated distance unit from the selected rate instead of the distanceUnit stored on the transaction.
 * Useful for updating the transaction distance unit when the distance or rate changes.
 *
 * For example, if an expense is '10 mi @ $1.00 / mi' and the rate is updated to '$1.00 / km',
 * then the updated distance unit should be 'km' from the updated rate, not 'mi' from the currently stored transaction distance unit.
 */
function getUpdatedDistanceUnit({transaction, policy, policyDraft}: {transaction: OnyxEntry<Transaction>; policy: OnyxEntry<Policy>; policyDraft?: OnyxEntry<Policy>}) {
    return getRate({transaction, policy, policyDraft, useTransactionDistanceUnit: false}).unit;
}

/**
 * Get the mileage rate by its ID in the form it's configured for the policy.
 * If not found, return undefined.
 */
function getRateByCustomUnitRateID({customUnitRateID, policy}: {customUnitRateID: string; policy: OnyxEntry<Policy>}): MileageRate | undefined {
    return getMileageRates(policy, true, customUnitRateID)[customUnitRateID];
}

export default {
    getDefaultMileageRate,
    getDistanceMerchant,
    getDistanceRequestAmount,
    getRateForDisplay,
    getMileageRates,
    getDistanceForDisplay,
    getRoundedDistanceInUnits,
    getRateForP2P,
    getCustomUnitRateID,
    convertToDistanceInMeters,
    getTaxableAmount,
    getDistanceUnit,
    getUpdatedDistanceUnit,
    getRate,
    getRateByCustomUnitRateID,
    getDistanceForDisplayLabel,
    convertDistanceUnit,
};

export type {MileageRate};
