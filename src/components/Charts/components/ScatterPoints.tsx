import {Circle} from '@shopify/react-native-skia';
import React from 'react';
import type {PointsArray} from 'victory-native';

type ScatterPointsProps = {
    points: PointsArray;
    radius: number;
    color: string;
};

function ScatterPoints({points, radius, color}: ScatterPointsProps) {
    return (
        <>
            {points.map((pt) =>
                typeof pt.y === 'number' ? (
                    <Circle
                        key={`point-${pt.xValue}-${pt.yValue}`}
                        cx={pt.x}
                        cy={pt.y}
                        r={radius}
                        color={color}
                    />
                ) : null,
            )}
        </>
    );
}

ScatterPoints.displayName = 'ScatterPoints';
export default ScatterPoints;
