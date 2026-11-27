/** View-based skeleton canvas with independently measurable shimmer and pulse candidates. */
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
    const [measuredSize, setMeasuredSize] = useState<{width: number; height: number}>();
    const canvasWidth = measuredSize?.width ?? (typeof width === 'number' ? width : 0);
    const canvasHeight = measuredSize?.height ?? (typeof height === 'number' ? height : 0);
    const isAnimating = animate && !isReducedMotionEnabled && speed > 0 && Number.isFinite(speed) && canvasWidth > 0 && canvasHeight > 0;
    const context = {width: canvasWidth, height: canvasHeight, backgroundColor, foregroundColor, animation, speed, isAnimating, isForegroundLayer: false};

    const updateCanvasSize = ({nativeEvent: {layout}}: LayoutChangeEvent) => {
        setMeasuredSize((previous) => (previous?.width === layout.width && previous.height === layout.height ? previous : {width: layout.width, height: layout.height}));
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
            {/* Mount strips together after measurement, and restart them together when the canvas changes size. */}
            <SkeletonContext.Provider
                key={`${canvasWidth}:${canvasHeight}:${animation}:${isAnimating}:${speed}`}
                value={context}
            >
                {children}
            </SkeletonContext.Provider>
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
export type {SkeletonLoaderProps} from './types';
