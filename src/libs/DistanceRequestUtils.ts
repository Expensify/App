import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {RateAndUnit} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastSelectedDistanceRates, OnyxInputOrEntry} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import * as CurrencyUtils from './CurrencyUtils';
import * as PolicyUtils from './PolicyUtils';
import * as ReportConnection from './ReportConnection';
import * as ReportUtils from './ReportUtils';

type MileageRate = {
    customUnitRateID?: string;
    rate?: number;
    currency?: string;
    unit: Unit;
    name?: string;
    enabled?: boolean;
};

let lastSelectedDistanceRates: OnyxEntry<LastSelectedDistanceRates> = {};
Onyx.connect({
    key: ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES,
    callback: (value) => {
        lastSelectedDistanceRates = value;
    },
});

const METERS_TO_KM = 0.001; // 1 kilometer is 1000 meters
const METERS_TO_MILES = 0.000621371; // There are approximately 0.000621371 miles in a meter

function getMileageRates(policy: OnyxInputOrEntry<Policy>, includeDisabledRates = false, selectedRateID?: string): Record<string, MileageRate> {
    const mileageRates: Record<string, MileageRate> = {};

    if (!policy?.customUnits) {
        return mileageRates;
    }

    const distanceUnit = PolicyUtils.getCustomUnit(policy);
    if (!distanceUnit?.rates) {
        return mileageRates;
    }

    Object.entries(distanceUnit.rates).forEach(([rateID, rate]) => {
        if (!includeDisabledRates && rate.enabled === false && (!selectedRateID || rateID !== selectedRateID)) {
            return;
        }

        mileageRates[rateID] = {
            rate: rate.rate,
            currency: rate.currency,
            unit: distanceUnit.attributes.unit,
            name: rate.name,
            customUnitRateID: rate.customUnitRateID,
            enabled: rate.enabled,
        };
    });

    return mileageRates;
}

/**
 * Retrieves the default mileage rate based on a given policy.
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

    const distanceUnit = PolicyUtils.getCustomUnit(policy);
    if (!distanceUnit?.rates) {
        return;
    }
    const mileageRates = Object.values(getMileageRates(policy));

    const distanceRate = mileageRates.find((rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE) ?? mileageRates.at(0) ?? ({} as MileageRate);

    return {
        customUnitRateID: distanceRate.customUnitRateID,
        rate: distanceRate.rate,
        currency: distanceRate.currency,
        unit: distanceUnit.attributes.unit,
        name: distanceRate.name,
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
    return convertedDistance.toFixed(2);
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
    const formattedRate = PolicyUtils.getUnitRateValue(toLocaleDigit, {rate}, useShortFormUnit);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const currencySymbol = CurrencyUtils.getCurrencySymbol(currency) || `${currency} `;

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
    if (!hasRoute || !rate || !unit || !distanceInMeters) {
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

    return `${distanceInUnits} @ ${ratePerUnit}`;
}

/**
 * Retrieves the rate and unit for a P2P distance expense for a given currency.
 *
 * @param currency
 * @returns The rate and unit in RateAndUnit object.
 */
function getRateForP2P(currency: string): RateAndUnit {
    const currencyWithExistingRate = CONST.CURRENCY_TO_DEFAULT_MILEAGE_RATE[currency] ? currency : CONST.CURRENCY.USD;
    return {
        ...CONST.CURRENCY_TO_DEFAULT_MILEAGE_RATE[currencyWithExistingRate],
        currency: currencyWithExistingRate,
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
function getCustomUnitRateID(reportID: string, shouldUseDefault?: boolean) {
    const allReports = ReportConnection.getAllReports();
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
    const policy = PolicyUtils.getPolicy(report?.policyID ?? parentReport?.policyID);
    let customUnitRateID: string = CONST.CUSTOM_UNITS.FAKE_P2P_ID;

    if (ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isPolicyExpenseChat(parentReport)) {
        const distanceUnit = Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
        const lastSelectedDistanceRateID = lastSelectedDistanceRates?.[policy?.id] ?? '-1';
        const lastSelectedDistanceRate = distanceUnit?.rates[lastSelectedDistanceRateID] ?? {};
        if (lastSelectedDistanceRate.enabled && lastSelectedDistanceRateID && !shouldUseDefault) {
            customUnitRateID = lastSelectedDistanceRateID;
        } else {
            customUnitRateID = getDefaultMileageRate(policy)?.customUnitRateID;
        }
    }

    return customUnitRateID;
}

/**
 * Get taxable amount from a specific distance rate, taking into consideration the tax claimable amount configured for the distance rate
 */
function getTaxableAmount(policy: OnyxEntry<Policy>, customUnitRateID: string, distance: number) {
    const distanceUnit = PolicyUtils.getCustomUnit(policy);
    const customUnitRate = PolicyUtils.getCustomUnitRate(policy, customUnitRateID);
    if (!distanceUnit || !distanceUnit?.customUnitID || !customUnitRate) {
        return 0;
    }
    const unit = distanceUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const rate = customUnitRate?.rate ?? 0;
    const amount = getDistanceRequestAmount(distance, unit, rate);
    const taxClaimablePercentage = customUnitRate.attributes?.taxClaimablePercentage ?? 0;
    return amount * taxClaimablePercentage;
}

export default {
    getDefaultMileageRate,
    getDistanceMerchant,
    getDistanceRequestAmount,
    getRateForDisplay,
    getMileageRates,
    getDistanceForDisplay,
    getRateForP2P,
    getCustomUnitRateID,
    convertToDistanceInMeters,
    getTaxableAmount,
};

export type {MileageRate};
