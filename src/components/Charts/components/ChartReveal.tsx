import ActivityIndicator from '@components/ActivityIndicator';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

/**
 * On web, Skia draws a chart 2 to 4 frames after it mounts.
 * Counted in frames because a stalled main thread delays the draw by frames, which a timer would not wait for.
 */
const HOLD_FRAMES = 5;

type ChartRevealProps = {
    isLoading: boolean;
    loadingHeight: number;
    children: ReactNode;
};

function ChartReveal({isLoading, loadingHeight, children}: ChartRevealProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isRevealed, setIsRevealed] = useState(false);
    const opacity = useSharedValue(0);
    const fadeStyle = useAnimatedStyle(() => ({opacity: opacity.get()}));

    if (isLoading && isRevealed) {
        setIsRevealed(false);
    }

    useEffect(() => {
        if (isLoading) {
            opacity.set(0);
            return;
        }

        let framesLeft = HOLD_FRAMES;
        let frameID = 0;
        const countFrame = () => {
            framesLeft -= 1;
            if (framesLeft > 0) {
                frameID = requestAnimationFrame(countFrame);
                return;
            }
            setIsRevealed(true);
            opacity.set(withTiming(1, {duration: CONST.ANIMATED_TRANSITION}));
        };
        frameID = requestAnimationFrame(countFrame);

        return () => cancelAnimationFrame(frameID);
    }, [isLoading, opacity]);

    return (
        <View>
            {!isLoading && <Animated.View style={fadeStyle}>{children}</Animated.View>}
            {/* The spinner keeps its place among the children, so it stays the same instance and its rotation carries on when the chart mounts */}
            {!isRevealed && (
                <View style={[styles.chartActivityIndicator, StyleUtils.getHeight(loadingHeight), !isLoading && [styles.pAbsolute, styles.t0, styles.l0, styles.r0]]}>
                    <ActivityIndicator size="large" />
                </View>
            )}
        </View>
    );
}

export default ChartReveal;
