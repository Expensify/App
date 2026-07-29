import {PressableWithoutFeedback} from '@components/Pressable';

import CONST from '@src/CONST';

import React from 'react';
import {Marker} from 'react-map-gl/mapbox';

import type {DistanceSymbolMarkerProps} from './MapViewTypes';

function DistanceSymbolMarker({distanceSymbolCoordinate, children, toggleDistanceUnit}: DistanceSymbolMarkerProps) {
    return (
        <Marker
            longitude={distanceSymbolCoordinate.at(0) ?? 0}
            latitude={distanceSymbolCoordinate.at(1) ?? 0}
        >
            <PressableWithoutFeedback
                sentryLabel="MapView-ToggleDistanceUnit"
                accessibilityLabel="distance-label"
                role={CONST.ROLE.BUTTON}
                onPress={toggleDistanceUnit}
            >
                {children}
            </PressableWithoutFeedback>
        </Marker>
    );
}

export default DistanceSymbolMarker;
