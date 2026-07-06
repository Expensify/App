import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';

/**
 * Returns the translated distance unit label based on the distance value (for singular/plural).
 */
function getDistanceUnitLabel(distance: number, unit: Unit, translate: LocaleContextProps['translate']): string {
    const isSingular = distance === 1;
    if (unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES) {
        return translate(isSingular ? 'common.mile' : 'common.miles');
    }
    return translate(isSingular ? 'common.kilometer' : 'common.kilometers');
}

/**
 * Formats a distance that is already expressed in display units (mi/km) into a localized string (e.g. "12.34 miles").
 */
function getFormattedDistanceInUnits(distanceInUnits: number, unit: Unit, translate: LocaleContextProps['translate'], useShortFormUnit?: boolean, isCommuterDistance?: boolean): string {
    const roundedDistance = distanceInUnits.toFixed(CONST.DISTANCE_DECIMAL_PLACES);
    const unitLabel = useShortFormUnit ? unit : getDistanceUnitLabel(distanceInUnits, unit, translate);
    if (isCommuterDistance) {
        return `${roundedDistance} ${translate('common.commuter')} ${unitLabel}`;
    }

    return `${roundedDistance} ${unitLabel}`;
}

export {getDistanceUnitLabel, getFormattedDistanceInUnits};
