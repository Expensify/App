import _ from 'underscore';
import CONST from '../CONST';

/**
 * Retrieves the default mileage rate based on a given policy.
 *
 * @param {Object} policy - The policy from which to extract the default mileage rate.
 * @param {Object} [policy.customUnits] - Custom units defined in the policy.
 * @param {Object[]} [policy.customUnits.rates] - Rates used int the policy.
 * @param {Object} [policy.customUnits.attributes] - attributes on a custom unit
 *
 * @returns {Object|null} An object containing the rate and unit for the default mileage or null if not found.
 * @returns {number} .rate - The default rate for the mileage.
 * @returns {string} .unit - The unit of measurement for the distance.
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
        unit: distanceUnit.attributes.unit,
    };
};

/**
 * Converts a given distance in meters to the specified unit (kilometers or miles).
 *
 * @param {number} distanceInMeters - The distance in meters to be converted.
 * @param {string} unit - The desired unit of conversion, either 'km' for kilometers or 'mi' for miles.
 *
 * @returns {number} The converted distance in the specified unit.
 *
 * @throws {Error} Throws an error if the input is invalid or if the unit is unsupported.
 */
function convertDistanceUnit(distanceInMeters, unit) {
    if (typeof distanceInMeters !== 'number' || (unit !== CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES && unit !== CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS)) {
        throw new Error('Invalid input');
    }

    const METERS_TO_KM = 0.001; // 1 kilometer is 1000 meters
    const METERS_TO_MILES = 0.000621371; // There are approximately 0.000621371 miles in a meter

    switch (unit) {
        case 'km':
            return distanceInMeters * METERS_TO_KM;
        case 'mi':
            return distanceInMeters * METERS_TO_MILES;
        default:
            throw new Error('Unsupported unit. Supported units are "mi" or "km".');
    }
}

/**
 *
 * @param {number} distanceInMeters Distance traveled
 * @param {('mi' | 'ki')} unit Unit that should be used to display the distance
 * @param {number} rate Expensable amount allowed per unit
 * @param {function} translate Translate function
 * @returns {string} A string that describes the distance travled and the rate used for expense calculation
 */
const getDistanceString = (distanceInMeters, unit, rate, translate) => {
    const convertedDistance = convertDistanceUnit(distanceInMeters, unit);

    const distanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.miles') : translate('common.kilometers');
    const singularDistanceUnit = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');
    const roundedDistance = convertedDistance.toFixed(2);
    const unitString = roundedDistance === 1 ? singularDistanceUnit : distanceUnit;
    const ratePerUnit = rate * 0.01;

    return `${roundedDistance} ${unitString} @ $${ratePerUnit} / ${singularDistanceUnit}`;
};

const getDistanceRequestAmount = (distance, unit, rate) => {
    const convertedDistance = convertDistanceUnit(distance, unit);
    return convertedDistance * rate;
};

export default {getDefaultMileageRate, getDistanceString, getDistanceRequestAmount};
