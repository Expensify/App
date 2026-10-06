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

    /** Whether the last point is drawn as an outline instead of a filled dot */
    isLastPointHollow?: boolean;
};

const POINT_MARGIN = 2;

const HOLLOW_STROKE_WIDTH = 2;

function ScatterPoints({points, radius, color, isLastPointHollow = false}: ScatterPointsProps) {
    return (
        <>
            {points.map((pt, index) =>
                typeof pt.y === 'number' ? (
                    <Fragment key={`point-${pt.xValue}-${pt.yValue}`}>
                        <Circle
                            cx={pt.x}
                            cy={pt.y}
                            r={radius + POINT_MARGIN}
                            color="black"
                            blendMode="clear"
                        />
                        {isLastPointHollow && index === points.length - 1 ? (
                            <Circle
                                cx={pt.x}
                                cy={pt.y}
                                r={radius - HOLLOW_STROKE_WIDTH / 2}
                                color={color}
                                // eslint-disable-next-line react/style-prop-object -- this is a valid Skia style prop value
                                style="stroke"
                                strokeWidth={HOLLOW_STROKE_WIDTH}
                            />
                        ) : (
                            <Circle
                                cx={pt.x}
                                cy={pt.y}
                                r={radius}
                                color={color}
                            />
                        )}
                    </Fragment>
                ) : null,
            )}
        </>
    );
}

export default ScatterPoints;
