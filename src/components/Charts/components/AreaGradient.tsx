import {LinearGradient, Path, vec} from '@shopify/react-native-skia';
import React from 'react';
import type {PointsArray} from 'victory-native';
import {useAreaPath} from 'victory-native';

type AreaGradientProps = {
    /** Data points that define the area to fill */
    points: PointsArray;

    /** Baseline y-coordinate where the gradient fades to its faint end (typically the chart's bottom) */
    y0: number;

    /** Hex color string used as the base for the gradient fill */
    color: string;
};

function AreaGradient({points, y0, color}: AreaGradientProps) {
    const {path} = useAreaPath(points, y0, {curveType: 'linear'});

    const topY = points.reduce((min, p) => (typeof p.y === 'number' && p.y < min ? p.y : min), y0);

    return (
        <Path
            path={path}
            // eslint-disable-next-line react/style-prop-object -- this is a valid Skia style prop value
            style="fill"
        >
            <LinearGradient
                start={vec(0, y0)}
                end={vec(0, topY)}
                colors={[`${color}05`, `${color}33`]}
            />
        </Path>
    );
}

export default AreaGradient;
