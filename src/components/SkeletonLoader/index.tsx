/**
 * Renders children as a static base and a pulsing foreground, so they must be pure geometry
 * without effects, subscriptions, or interactive content.
 */
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated from 'react-native-reanimated';

import type {SkeletonLoaderProps} from './types';

import {DEFAULT_SPEED_SECONDS, getSkeletonAnimation} from './animations';
import SkeletonContext from './SkeletonContext';

function SkeletonLoader({children, width, height, style, backgroundColor, foregroundColor, animate = true, speed = DEFAULT_SPEED_SECONDS, testID}: SkeletonLoaderProps) {
    const styles = useThemeStyles();
    const isReducedMotionEnabled = Accessibility.useReducedMotion();
    const isAnimating = animate && !isReducedMotionEnabled && speed > 0 && Number.isFinite(speed);
    const context = {backgroundColor, foregroundColor, isForegroundLayer: false};

    return (
        <View
            testID={testID}
            accessible={false}
            aria-hidden
            style={[styles.pRelative, styles.overflowHidden, {width, height}, style, styles.pointerEventsNone]}
        >
            <SkeletonContext.Provider value={context}>{children}</SkeletonContext.Provider>
            {isAnimating && (
                <Animated.View
                    testID={testID ? `${testID}-pulse` : undefined}
                    style={[StyleSheet.absoluteFill, getSkeletonAnimation(speed)]}
                >
                    <SkeletonContext.Provider value={{...context, isForegroundLayer: true}}>{children}</SkeletonContext.Provider>
                </Animated.View>
            )}
        </View>
    );
}

export default SkeletonLoader;
export {default as SkeletonViewRect} from './SkeletonViewRect';
