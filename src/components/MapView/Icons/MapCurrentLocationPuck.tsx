import React, {useId} from 'react';
import {Circle, G, Path, Svg} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
import MapMarkerShadowFilter from './MapMarkerShadowFilter';

function MapCurrentLocationPuck({width = 48, height = 48}: SvgProps) {
    const filterId = useId();
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 48 48"
            fill="none"
        >
            <MapMarkerShadowFilter
                id={filterId}
                width="48"
                height="48"
            />
            <G filter={`url(#${filterId})`}>
                <Circle
                    cx="24"
                    cy="24"
                    r="12"
                    fill="#0185ff"
                />
                <Path
                    fill="#fcfbf9"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 12c6.627 0 12 5.373 12 12s-5.373 12-12 12-12-5.373-12-12S17.373 12 24 12m0 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18"
                />
            </G>
        </Svg>
    );
}

export default MapCurrentLocationPuck;
