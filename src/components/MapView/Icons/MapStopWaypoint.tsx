import type {SvgProps} from 'react-native-svg';

import React, {useId} from 'react';
import {G, Path, Svg} from 'react-native-svg';

import MapMarkerShadowFilter from './MapMarkerShadowFilter';

function MapStopWaypoint({width = 48, height = 53}: SvgProps) {
    const filterId = useId();
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 48 53"
            fill="none"
        >
            <MapMarkerShadowFilter
                id={filterId}
                width="48"
                height="52.695"
            />
            <G filter={`url(#${filterId})`}>
                <Path
                    fill="#085239"
                    d="M24 11c4.97 0 9 3.94 9 8.8 0 6.73-9 13.2-9 13.2s-9-6.47-9-13.2c0-4.86 4.03-8.8 9-8.8m0 3.883a2.58 2.58 0 0 0-2.571 2.588A2.58 2.58 0 0 0 24 20.059a2.58 2.58 0 0 0 2.571-2.588A2.58 2.58 0 0 0 24 14.883"
                />
                <Path
                    fill="#fcfbf9"
                    d="M24 14.883a2.58 2.58 0 0 1 2.571 2.588A2.58 2.58 0 0 1 24 20.059a2.58 2.58 0 0 1-2.571-2.588A2.58 2.58 0 0 1 24 14.883"
                />
                <Path
                    fill="#fcfbf9"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 8c6.46 0 11.83 5.058 11.996 11.492L36 19.8c0 4.57-2.959 8.604-5.287 11.148a37 37 0 0 1-4.492 4.135q-.209.16-.33.25l-.095.07-.028.02-.01.009-.004.002h-.001l-.01-.012.008.014L24 36.695l-1.751-1.26.007-.014c-.01.012-.009.013-.009.013v-.001l-.005-.002-.01-.008-.028-.02-.096-.071-.329-.25a37 37 0 0 1-4.492-4.135C14.96 28.404 12 24.37 12 19.8 12 13.22 17.436 8 24 8m0 3c-4.97 0-9 3.94-9 8.8 0 6.73 9 13.2 9 13.2s9-6.47 9-13.2c0-4.86-4.03-8.8-9-8.8"
                />
            </G>
        </Svg>
    );
}

export default MapStopWaypoint;
