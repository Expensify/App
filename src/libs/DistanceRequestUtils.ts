import {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import Policy, {Unit} from '@src/types/onyx/Policy';
import * as CurrencyUtils from './CurrencyUtils';
import * as PolicyUtils from './PolicyUtils';

type DefaultMileageRate = {
    rate: number;
    currency: string;
    unit: Unit;
};

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
function getDefaultMileageRate(policy: OnyxEntry<Policy>): DefaultMileageRate | null {
    if (!policy?.customUnits) {
        return null;
    }

    const distanceUnit = Object.values(policy.customUnits).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    if (!distanceUnit?.rates) {
        return null;
    }

    const distanceRate = Object.values(distanceUnit.rates).find((rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
    if (!distanceRate) {
        return null;
    }

    return {
        rate: distanceRate.rate,
        currency: distanceRate.currency,
        unit: distanceUnit.attributes.unit,
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
    const METERS_TO_KM = 0.001; // 1 kilometer is 1000 meters
    const METERS_TO_MILES = 0.000621371; // There are approximately 0.000621371 miles in a meter

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
 * @param hasRoute Whether the route exists for the distance request
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
    unit: Unit,
    rate: number,
    currency: string,
    translate: LocaleContextProps['translate'],
    toLocaleDigit: LocaleContextProps['toLocaleDigit'],
): string {
    const distanceInUnits = hasRoute ? getRoundedDistanceInUnits(distanceInMeters, unit) : translate('common.tbd');

    const distanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.miles') : translate('common.kilometers');
    const singularDistanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');
    const unitString = distanceInUnits === '1' ? singularDistanceUnit : distanceUnit;
    const ratePerUnit = rate ? PolicyUtils.getUnitRateValue({rate}, toLocaleDigit) : translate('common.tbd');
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const currencySymbol = rate ? CurrencyUtils.getCurrencySymbol(currency) || `${currency} ` : '';

    return `${distanceInUnits} ${unitString} @ ${currencySymbol}${ratePerUnit} / ${singularDistanceUnit}`;
}

/**
 * Calculates the request amount based on distance, unit, and rate.
 *
 * @param distance - The distance traveled in meters
 * @param unit - The unit of measurement for the distance
 * @param rate - Rate used for calculating the request amount
 * @returns The computed request amount (rounded) in "cents".
 */
function getDistanceRequestAmount(distance: number, unit: Unit, rate: number): number {
    const convertedDistance = convertDistanceUnit(distance, unit);
    const roundedDistance = parseFloat(convertedDistance.toFixed(2));
    return Math.round(roundedDistance * rate);
}

export default {getDefaultMileageRate, getDistanceMerchant, getDistanceRequestAmount};
