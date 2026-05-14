import React, {useId} from 'react';
import {Circle, Defs, FeDropShadow, Filter, Svg} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';

function MapWaypoint({width = 40, height = 40}: SvgProps) {
    const filterId = useId();
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 40 40"
            fill="none"
        >
            <Defs>
                <Filter
                    id={filterId}
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    filterUnits="userSpaceOnUse"
                >
                    <FeDropShadow
                        dx={0}
                        dy={4}
                        stdDeviation={6}
                        floodColor="#021204"
                        floodOpacity={0.06}
                    />
                </Filter>
            </Defs>
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
