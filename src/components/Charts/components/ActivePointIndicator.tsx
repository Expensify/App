import type {DerivedValue, SharedValue} from 'react-native-reanimated';
import type {MaybeNumber} from 'victory-native';

import {Circle, Group, Line} from '@shopify/react-native-skia';
import React from 'react';
import {useDerivedValue} from 'react-native-reanimated';

type ActivePointIndicatorProps = {
    /** Canvas x of the active data point */
    x: DerivedValue<number>;

    /** Index of the active data point */
    activeIndex: SharedValue<number>;

    /** One dot per series */
    dots: SeriesDotPositions[];

    isActive: SharedValue<boolean>;

    /** Top boundary of the plot area, where the guideline starts */
    top: number;

    /** Bottom boundary of the plot area, where the guideline ends */
    bottom: number;

    dotRadius: number;
    guidelineColor: string;
    guidelineOpacity: number;
    isHollow: DerivedValue<boolean>;

    /** Painted over the dot's center to hollow it out, so it must match the background behind the chart */
    hollowColor: string;
};

type SeriesDotPositions = {
    color: string;

    /** Canvas y of the series at every data point, missing where the series has no value */
    yPositions: MaybeNumber[];
};

type SeriesDotProps = SeriesDotPositions & Pick<ActivePointIndicatorProps, 'x' | 'activeIndex' | 'dotRadius' | 'hollowColor'> & Partial<Pick<ActivePointIndicatorProps, 'isHollow'>>;

const GUIDELINE_WIDTH = 2;

const HOLLOW_RING_WIDTH = 2;

function SeriesDot({x, activeIndex, yPositions, color, dotRadius, isHollow, hollowColor}: SeriesDotProps) {
    const cy = useDerivedValue(() => yPositions.at(activeIndex.get()) ?? 0);
    const opacity = useDerivedValue(() => (typeof yPositions.at(activeIndex.get()) === 'number' ? 1 : 0));
    const hollowCenterOpacity = useDerivedValue(() => (isHollow?.get() ? 1 : 0));

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

function ActivePointIndicator({x, activeIndex, dots, isActive, top, bottom, dotRadius, guidelineColor, guidelineOpacity, isHollow, hollowColor}: ActivePointIndicatorProps) {
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
            {/* Drawn last, the first series' dot sits on top of the others, like its line */}
            {dots
                .map(({color, yPositions}, index) => (
                    <SeriesDot
                        // eslint-disable-next-line react/no-array-index-key -- a dot's index is the series it belongs to
                        key={index}
                        x={x}
                        activeIndex={activeIndex}
                        yPositions={yPositions}
                        color={color}
                        dotRadius={dotRadius}
                        isHollow={index === 0 ? isHollow : undefined}
                        hollowColor={hollowColor}
                    />
                ))
                .reverse()}
        </Group>
    );
}

export default ActivePointIndicator;
