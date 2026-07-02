import React, {useId} from 'react';
import {G, Path, Svg} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
import CONST from '@src/CONST';
import MapMarkerShadowFilter from './MapMarkerShadowFilter';

function MapCurrentLocation({width = 48, height = 48}: SvgProps) {
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
                <Path
                    fill={CONST.MAP_CURRENT_LOCATION_FILL_COLOR}
                    d="M36 20c0 6.627-5.373 12-12 12s-12-5.373-12-12S17.373 8 24 8s12 5.373 12 12"
                />
                <Path
                    fill="#fcfbf9"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 8c6.627 0 12 5.373 12 12s-5.373 12-12 12-12-5.373-12-12S17.373 8 24 8m0 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18"
                />
            </G>
        </Svg>
    );
}

export default MapCurrentLocation;
