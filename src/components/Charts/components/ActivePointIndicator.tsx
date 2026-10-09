import type {DerivedValue, SharedValue} from 'react-native-reanimated';

import {Circle, Group, Line} from '@shopify/react-native-skia';
import React from 'react';
import {useDerivedValue} from 'react-native-reanimated';

type ActivePointIndicatorProps = {
    /** Canvas x of the active data point */
    x: DerivedValue<number>;

    /** Canvas y of the active data point on each series, in the order of `dotColors`, undefined where a series has no point */
    dotYs: DerivedValue<Array<number | undefined>>;

    /** One dot per series, the first drawn on top */
    dotColors: string[];

    isActive: SharedValue<boolean>;

    /** Top boundary of the plot area, where the guideline starts */
    top: number;

    /** Bottom boundary of the plot area, where the guideline ends */
    bottom: number;

    dotRadius: number;
    guidelineColor: string;
    guidelineOpacity: number;
    /** Hollows out the first dot, whose series is still in progress at this point */
    isHollow: DerivedValue<boolean>;

    /** Painted over the dot's center to hollow it out, so it must match the background behind the chart */
    hollowColor: string;
};

type ActiveDotProps = Pick<ActivePointIndicatorProps, 'x' | 'dotYs' | 'dotRadius' | 'isHollow' | 'hollowColor'> & {
    index: number;
    color: string;
};

const GUIDELINE_WIDTH = 2;

const HOLLOW_RING_WIDTH = 2;

function ActiveDot({x, dotYs, index, color, dotRadius, isHollow, hollowColor}: ActiveDotProps) {
    const cy = useDerivedValue(() => dotYs.get().at(index) ?? 0);
    const opacity = useDerivedValue(() => (dotYs.get().at(index) === undefined ? 0 : 1));
    const hollowCenterOpacity = useDerivedValue(() => (index === 0 && isHollow.get() ? 1 : 0));

    return (
        <Group opacity={opacity}>
            <Circle
                cx={x}
                cy={cy}
                r={dotRadius}
                color={color}
            />
            <Circle
                cx={x}
                cy={cy}
                r={dotRadius - HOLLOW_RING_WIDTH}
                color={hollowColor}
                opacity={hollowCenterOpacity}
            />
        </Group>
    );
}

function ActivePointIndicator({x, dotYs, dotColors, isActive, top, bottom, dotRadius, guidelineColor, guidelineOpacity, isHollow, hollowColor}: ActivePointIndicatorProps) {
    const opacity = useDerivedValue(() => (isActive.get() ? 1 : 0));
    const guidelineStart = useDerivedValue(() => ({x: x.get(), y: top}));
    const guidelineEnd = useDerivedValue(() => ({x: x.get(), y: bottom}));

    return (
        <Group opacity={opacity}>
            <Line
                p1={guidelineStart}
                p2={guidelineEnd}
                color={guidelineColor}
                opacity={guidelineOpacity}
                strokeWidth={GUIDELINE_WIDTH}
                strokeCap="round"
            />
            {dotColors
                .map((color, index) => (
                    <ActiveDot
                        // eslint-disable-next-line react/no-array-index-key -- a dot's index is the series it belongs to
                        key={index}
                        x={x}
                        dotYs={dotYs}
                        index={index}
                        color={color}
                        dotRadius={dotRadius}
                        isHollow={isHollow}
                        hollowColor={hollowColor}
                    />
                ))
                .toReversed()}
        </Group>
    );
}

export default ActivePointIndicator;
