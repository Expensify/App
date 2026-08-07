import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import CONST from '@src/CONST';

import {View} from 'react-native';

import type {DistanceSymbolProps} from './MapViewTypes';

import DistanceSymbolMarker from './DistanceSymbolMarker';
import utils from './utils';

function DistanceSymbol({distanceInMeters, distanceUnit, toggleDistanceUnit, directionCoordinates, waypoints, isSelected = true, selectDirection}: DistanceSymbolProps) {
    const styles = useThemeStyles();

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

    // Pressing a symbol of an unselected direction selects that direction instead of toggling the unit.
    const onPress = () => {
        if (!isSelected && selectDirection) {
            selectDirection();
            return;
        }
        toggleDistanceUnit();
    };

    return (
        <DistanceSymbolMarker
            distanceSymbolCoordinate={distanceSymbolCoordinate}
            onPress={onPress}
        >
            <View style={[isSelected ? styles.distanceLabelWrapper : styles.alternativeDistanceLabelWrapper]}>
                <Text style={isSelected ? styles.distanceLabelText : styles.alternativeDistanceLabelText}> {distanceLabelText}</Text>
            </View>
        </DistanceSymbolMarker>
    );
}

export default DistanceSymbol;
