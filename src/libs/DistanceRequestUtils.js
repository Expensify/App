import _ from 'underscore';
import CONST from '@src/CONST';
import * as CurrencyUtils from './CurrencyUtils';
import * as PolicyUtils from './PolicyUtils';

/**
 * Retrieves the default mileage rate based on a given policy.
 *
 * @param {Object} policy - The policy from which to extract the default mileage rate.
 * @param {Object} [policy.customUnits] - Custom units defined in the policy.
 * @param {Object[]} [policy.customUnits.rates] - Rates used in the policy.
 * @param {Object} [policy.customUnits.attributes] - attributes on a custom unit
 * @param {'mi' | 'km'} [policy.customUnits.attributes.unit] - unit of measurement for the distance
 *
 * @returns {Object|null} An object containing the rate and unit for the default mileage or null if not found.
 * @returns {Number} .rate - The default rate for the mileage.
 * @returns {String} .currency - The currency associated with the rate.
 * @returns {String} .unit - The unit of measurement for the distance.
 */
const getDefaultMileageRate = (policy) => {
    if (!policy || !policy.customUnits) {
        return null;
    }

    const distanceUnit = _.find(_.values(policy.customUnits), (unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    if (!distanceUnit) {
        return null;
    }

    const distanceRate = _.find(_.values(distanceUnit.rates), (rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
    if (!distanceRate) {
        return null;
    }

    return {
        rate: distanceRate.rate,
        currency: distanceRate.currency,
        unit: distanceUnit.attributes.unit,
    };
};

/**
 * Converts a given distance in meters to the specified unit (kilometers or miles).
 *
 * @param {Number} distanceInMeters - The distance in meters to be converted.
 * @param {'mi' | 'km'} unit - The desired unit of conversion, either 'km' for kilometers or 'mi' for miles.
 *
 * @returns {Number} The converted distance in the specified unit.
 */
function convertDistanceUnit(distanceInMeters, unit) {
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
 *
 * @param {Number} distanceInMeters Distance traveled
 * @param {'mi' | 'km'} unit Unit that should be used to display the distance
 * @returns {String} The distance in requested units, rounded to 2 decimals
 */
const getRoundedDistanceInUnits = (distanceInMeters, unit) => {
    const convertedDistance = convertDistanceUnit(distanceInMeters, unit);
    return convertedDistance.toFixed(2);
};

/**
 *
 * @param {boolean} hasRoute Whether the route exists for the distance request
 * @param {Number} distanceInMeters Distance traveled
 * @param {'mi' | 'km'} unit Unit that should be used to display the distance
 * @param {Number} rate Expensable amount allowed per unit
 * @param {String} currency The currency associated with the rate
 * @param {Function} translate Translate function
 * @param {Function} toLocaleDigit Function to convert to localized digit
 * @returns {String} A string that describes the distance traveled and the rate used for expense calculation
 */
const getDistanceMerchant = (hasRoute, distanceInMeters, unit, rate, currency, translate, toLocaleDigit) => {
    const distanceInUnits = hasRoute ? getRoundedDistanceInUnits(distanceInMeters, unit) : translate('common.tbd');

    const distanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.miles') : translate('common.kilometers');
    const singularDistanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');
    const unitString = distanceInUnits === 1 ? singularDistanceUnit : distanceUnit;
    const ratePerUnit = rate ? PolicyUtils.getUnitRateValue({rate}, toLocaleDigit) : translate('common.tbd');
    const currencySymbol = rate ? CurrencyUtils.getCurrencySymbol(currency) || `${currency} ` : '';

    return `${distanceInUnits} ${unitString} @ ${currencySymbol}${ratePerUnit} / ${singularDistanceUnit}`;
};

/**
 * Calculates the request amount based on distance, unit, and rate.
 *
 * @param {Number} distance - The distance traveled in meters
 * @param {'mi' | 'km'} unit - The unit of measurement for the distance
 * @param {Number} rate - Rate used for calculating the request amount
 * @returns {Number} The computed request amount (rounded) in "cents".
 */
const getDistanceRequestAmount = (distance, unit, rate) => {
    const convertedDistance = convertDistanceUnit(distance, unit);
    const roundedDistance = convertedDistance.toFixed(2);
    return Math.round(roundedDistance * rate);
};

export default {getDefaultMileageRate, getDistanceMerchant, getDistanceRequestAmount};
