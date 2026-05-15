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

const FILL_STYLE = 'fill' as const;

function AreaGradient({points, y0, color}: AreaGradientProps) {
    const {path} = useAreaPath(points, y0, {curveType: 'linear'});

    const yValues = points.reduce<number[]>((acc, p) => {
        if (typeof p.y === 'number') {
            acc.push(p.y);
        }
        return acc;
    }, []);
    const topY = yValues.length > 0 ? Math.min(...yValues) : y0;

    return (
        <Path
            path={path}
            style={FILL_STYLE}
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
