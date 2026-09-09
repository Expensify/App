import React from 'react';
import {Defs, FeDropShadow, Filter} from 'react-native-svg';

type MapMarkerShadowFilterProps = {
    id: string;
    width: string;
    height: string;
};

function MapMarkerShadowFilter({id, width, height}: MapMarkerShadowFilterProps) {
    return (
        <Defs>
            <Filter
                id={id}
                x="0"
                y="0"
                width={width}
                height={height}
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
    );
}

export default MapMarkerShadowFilter;
