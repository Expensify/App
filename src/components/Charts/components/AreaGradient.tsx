import {LinearGradient, Path, vec} from '@shopify/react-native-skia';
import React from 'react';
import type {PointsArray} from 'victory-native';
import {useAreaPath} from 'victory-native';

type AreaGradientProps = {
    /** Data points that define the area to fill */
    points: PointsArray;

    /** Baseline y-coordinate where the gradient fades to its faint end (typically the chart's bottom) */
    baselineY: number;

    /** Hex color string used as the base for the gradient fill */
    color: string;
};

function AreaGradient({points, baselineY, color}: AreaGradientProps) {
    const {path} = useAreaPath(points, baselineY, {curveType: 'linear'});

    const topY = Math.min(baselineY, ...points.flatMap((p) => (typeof p.y === 'number' ? [p.y] : [])));

    return (
        <Path
            path={path}
            // eslint-disable-next-line react/style-prop-object -- this is a valid Skia style prop value
            style="fill"
        >
            <LinearGradient
                start={vec(0, baselineY)}
                end={vec(0, topY)}
                colors={[`${color}05`, `${color}33`]}
            />
        </Path>
    );
}

export default AreaGradient;
