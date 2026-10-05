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
};

const GUIDELINE_WIDTH = 2;

function ActivePointIndicator({position, isActive, top, bottom, dotRadius, dotColor, guidelineColor}: ActivePointIndicatorProps) {
    const opacity = useDerivedValue(() => (isActive.get() ? 1 : 0));
    const guidelineStart = useDerivedValue(() => ({x: position.get().x, y: top}));
    const guidelineEnd = useDerivedValue(() => ({x: position.get().x, y: bottom}));
    const cx = useDerivedValue(() => position.get().x);
    const cy = useDerivedValue(() => position.get().y);

    return (
        <Group opacity={opacity}>
            <Line
                p1={guidelineStart}
                p2={guidelineEnd}
                color={guidelineColor}
                strokeWidth={GUIDELINE_WIDTH}
                strokeCap="round"
            />
            <Circle
                cx={cx}
                cy={cy}
                r={dotRadius}
                color={dotColor}
            />
        </Group>
    );
}

export default ActivePointIndicator;
