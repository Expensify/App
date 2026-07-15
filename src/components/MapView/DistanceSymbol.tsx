import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import CONST from '@src/CONST';

import {MarkerView} from '@rnmapbox/maps';
import {View} from 'react-native';

import type {DistanceSymbolProps} from './MapViewTypes';

import ToggleDistanceUnitButton from './ToggleDistanceUnitButton';
import useDistanceUnit from './useDistanceUnit';
import utils from './utils';

function DistanceSymbol({distanceInMeters, unit, directionCoordinates, waypoints, isSelected = true}: DistanceSymbolProps) {
    const styles = useThemeStyles();
    const {distanceUnit, toggleDistanceUnit} = useDistanceUnit(unit);

    const distanceLabelText = DistanceRequestUtils.getDistanceForDisplayLabel(distanceInMeters ?? 0, distanceUnit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);

    const getDistanceSymbolCoordinate = () => {
        if (!directionCoordinates?.length || !waypoints?.length) {
            return;
        }
        const {northEast, southWest} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        const boundsCenter = utils.getBoundsCenter({northEast, southWest});

        return utils.findClosestCoordinateOnLineFromCenter(boundsCenter, directionCoordinates);
    };

    const distanceSymbolCoordinate = getDistanceSymbolCoordinate();

    if (!distanceInMeters || !distanceUnit || !distanceSymbolCoordinate) {
        return null;
    }

    return (
        <MarkerView
            coordinate={distanceSymbolCoordinate}
            allowOverlap
        >
            <View style={{zIndex: 1}}>
                <ToggleDistanceUnitButton
                    accessibilityRole={CONST.ROLE.BUTTON}
                    accessibilityLabel="distance-label"
                    onPress={toggleDistanceUnit}
                >
                    <View style={[isSelected ? styles.distanceLabelWrapper : styles.alternativeDistanceLabelWrapper]}>
                        <Text style={isSelected ? styles.distanceLabelText : styles.alternativeDistanceLabelText}> {distanceLabelText}</Text>
                    </View>
                </ToggleDistanceUnitButton>
            </View>
        </MarkerView>
    );
}

export default DistanceSymbol;
