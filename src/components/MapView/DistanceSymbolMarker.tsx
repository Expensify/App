import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import {MarkerView} from '@rnmapbox/maps';
import React from 'react';
import {View} from 'react-native';

import type {DistanceSymbolMarkerProps} from './MapViewTypes';

import ToggleDistanceUnitButton from './ToggleDistanceUnitButton';

function DistanceSymbolMarker({distanceSymbolCoordinate, children, onPress}: DistanceSymbolMarkerProps) {
    const styles = useThemeStyles();

    return (
        <MarkerView
            coordinate={distanceSymbolCoordinate}
            allowOverlap
        >
            <View style={[styles.zIndex1]}>
                <ToggleDistanceUnitButton
                    accessibilityRole={CONST.ROLE.BUTTON}
                    accessibilityLabel="distance-label"
                    onPress={onPress}
                >
                    {children}
                </ToggleDistanceUnitButton>
            </View>
        </MarkerView>
    );
}

export default DistanceSymbolMarker;
