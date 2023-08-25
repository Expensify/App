import _ from 'underscore';

const getDefaultMileageRate = (policy) => {
    if (!policy || !policy.customUnits) {
        return null;
    }

    const distanceUnit = _.find(_.values(policy.customUnits), (unit) => unit.name === 'Distance');
    if (!distanceUnit) {
        return null;
    }

    const distanceRate = _.find(_.values(distanceUnit.rates), (rate) => rate.name === 'Default Rate');
    if (!distanceRate) {
        return null;
    }

    return {
        rate: distanceRate.rate,
        unit: distanceUnit.attributes.unit,
    };
};

function convertDistanceUnit(distanceInMeters, unit) {
    if (typeof distanceInMeters !== 'number' || (unit !== 'mi' && unit !== 'km')) {
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
 * @returns {string} A string that describes the distance travled and the rate used for expense calculation
 */
const getDistanceString = (distanceInMeters, unit, rate) => {
    const convertedDistance = convertDistanceUnit(distanceInMeters, unit);

    const distanceUnit = unit === 'mi' ? 'miles' : 'kilometers';
    const singularDistanceUnit = unit === 'mi' ? 'mile' : 'kilometer';
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
