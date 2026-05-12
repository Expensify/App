import React from 'react';
import {View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import useTheme from '@hooks/useTheme';

type RemainingLimitCircleProps = {
    /** Fraction of the limit that has been spent (0–1) */
    spentFraction: number;
};

const SIZE = 24;
const STROKE_WIDTH = 4;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function RemainingLimitCircle({spentFraction}: RemainingLimitCircleProps) {
    const theme = useTheme();

    const clamped = Math.min(Math.max(spentFraction, 0), 1);
    const remainingFraction = 1 - clamped;
    const strokeDashoffset = CIRCUMFERENCE * (1 - remainingFraction);

    return (
        <View>
            <Svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
            >
                <Circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    stroke={theme.border}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                />
                <Circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    stroke={theme.success}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={`${CIRCUMFERENCE}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90, ${SIZE / 2}, ${SIZE / 2})`}
                />
            </Svg>
        </View>
    );
}

export default RemainingLimitCircle;
