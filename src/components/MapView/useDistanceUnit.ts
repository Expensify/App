import {useCallback, useEffect, useRef, useState} from 'react';
import CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';

/**
 * Manages distance unit state that syncs from a prop but can be overridden by user toggle.
 * Once the user manually toggles the unit, prop updates are ignored.
 */
function useDistanceUnit(unit: Unit | undefined) {
    const [distanceUnit, setDistanceUnit] = useState(unit);
    const userToggledUnit = useRef(false);

    useEffect(() => {
        if (!unit || userToggledUnit.current) {
            return;
        }
        setDistanceUnit(unit);
    }, [unit]);

    const toggleDistanceUnit = useCallback(() => {
        userToggledUnit.current = true;
        setDistanceUnit((currentUnit) =>
            currentUnit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS ? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES : CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
        );
    }, []);

    return {distanceUnit, toggleDistanceUnit};
}

export default useDistanceUnit;
