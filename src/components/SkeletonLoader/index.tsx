import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated from 'react-native-reanimated';

import type {SkeletonLoaderProps} from './types';

import {DEFAULT_SPEED_SECONDS, getSkeletonAnimation} from './animations';
import SkeletonContext from './SkeletonContext';

function SkeletonLoader({
    children,
    width,
    height,
    style,
    backgroundColor,
    foregroundColor,
    animate = true,
    speed = DEFAULT_SPEED_SECONDS,
    animation = 'shimmer',
    testID,
}: SkeletonLoaderProps) {
    const styles = useThemeStyles();
    const isReducedMotionEnabled = Accessibility.useReducedMotion();
    const [measuredWidth, setMeasuredWidth] = useState<number>();
    const declaredWidth = StyleSheet.flatten(style)?.width ?? width;
    const canvasWidth = measuredWidth ?? (typeof declaredWidth === 'number' ? declaredWidth : 0);
    const isAnimating = animate && !isReducedMotionEnabled && speed > 0 && Number.isFinite(speed);
    const context = {width: canvasWidth, backgroundColor, foregroundColor, animation, speed, isAnimating, isForegroundLayer: false};

    const updateCanvasSize = ({nativeEvent: {layout}}: LayoutChangeEvent) => {
        setMeasuredWidth(layout.width);
    };

    return (
        <View
            testID={testID}
            pointerEvents="none"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.pRelative, styles.overflowHidden, {width, height}, style]}
            onLayout={updateCanvasSize}
        >
            <SkeletonContext.Provider value={context}>{children}</SkeletonContext.Provider>
            {isAnimating && animation === 'pulse' && (
                <Animated.View
                    testID={testID ? `${testID}-pulse` : undefined}
                    style={[StyleSheet.absoluteFill, getSkeletonAnimation('pulse', speed)]}
                >
                    <SkeletonContext.Provider value={{...context, isForegroundLayer: true}}>{children}</SkeletonContext.Provider>
                </Animated.View>
            )}
        </View>
    );
}

export default SkeletonLoader;
