import type {SvgProps} from 'react-native-svg';

import React, {useId} from 'react';
import {Circle, Svg} from 'react-native-svg';

import MapMarkerShadowFilter from './MapMarkerShadowFilter';

function MapWaypoint({width = 40, height = 40}: SvgProps) {
    const filterId = useId();
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 40 40"
            fill="none"
        >
            <MapMarkerShadowFilter
                id={filterId}
                width="40"
                height="40"
            />
            <Circle
                cx="20"
                cy="16"
                r="8"
                fill="#008c59"
                filter={`url(#${filterId})`}
            />
        </Svg>
    );
}

export default MapWaypoint;
