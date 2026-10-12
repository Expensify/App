import type {DerivedValue, SharedValue} from 'react-native-reanimated';

import {Circle, Group, Line} from '@shopify/react-native-skia';
import React from 'react';
import {useDerivedValue} from 'react-native-reanimated';

type ActivePointIndicatorProps = {
    /** Canvas position of the active data point */
    position: DerivedValue<{x: number; y: number}>;

    isActive: SharedValue<boolean>;

    /** Top boundary of the plot area, where the guideline starts */
    top: number;

    /** Bottom boundary of the plot area, where the guideline ends */
    bottom: number;

    dotRadius: number;
    dotColor: string;
    guidelineColor: string;
    guidelineOpacity: number;
    isHollow: DerivedValue<boolean>;

    /** Painted over the dot's center to hollow it out, so it must match the background behind the chart */
    hollowColor: string;
};

const GUIDELINE_WIDTH = 2;

const HOLLOW_RING_WIDTH = 2;

function ActivePointIndicator({position, isActive, top, bottom, dotRadius, dotColor, guidelineColor, guidelineOpacity, isHollow, hollowColor}: ActivePointIndicatorProps) {
    const opacity = useDerivedValue(() => (isActive.get() ? 1 : 0));
    const guidelineStart = useDerivedValue(() => ({x: position.get().x, y: top}));
    const guidelineEnd = useDerivedValue(() => ({x: position.get().x, y: bottom}));
    const cx = useDerivedValue(() => position.get().x);
    const cy = useDerivedValue(() => position.get().y);
    const hollowCenterOpacity = useDerivedValue(() => (isHollow.get() ? 1 : 0));

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
            <Circle
                cx={cx}
                cy={cy}
                r={dotRadius}
                color={dotColor}
            />
            <Circle
                cx={cx}
                cy={cy}
                r={dotRadius - HOLLOW_RING_WIDTH}
                color={hollowColor}
                opacity={hollowCenterOpacity}
            />
        </Group>
    );
}

export default ActivePointIndicator;
