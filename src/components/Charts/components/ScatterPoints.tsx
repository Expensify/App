import type {PointsArray} from 'victory-native';

import {Circle} from '@shopify/react-native-skia';
import React, {Fragment} from 'react';

type ScatterPointsProps = {
    /** Data points to render as dots */
    points: PointsArray;

    /** Radius of each dot in pixels */
    radius: number;

    /** Fill color of each dot */
    color: string;
};

const POINT_MARGIN = 2;

function ScatterPoints({points, radius, color}: ScatterPointsProps) {
    return (
        <>
            {points.map((pt) =>
                typeof pt.y === 'number' ? (
                    <Fragment key={`point-${pt.xValue}-${pt.yValue}`}>
                        <Circle
                            cx={pt.x}
                            cy={pt.y}
                            r={radius + POINT_MARGIN}
                            color="black"
                            blendMode="clear"
                        />
                        <Circle
                            cx={pt.x}
                            cy={pt.y}
                            r={radius}
                            color={color}
                        />
                    </Fragment>
                ) : null,
            )}
        </>
    );
}

export default ScatterPoints;
