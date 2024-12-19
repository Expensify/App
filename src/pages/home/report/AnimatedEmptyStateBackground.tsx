import React from 'react';
import {View} from 'react-native';
import Animated, {clamp, SensorType, useAnimatedSensor, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring} from 'react-native-reanimated';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';

// Maximum horizontal and vertical shift in pixels on sensor value change
const IMAGE_OFFSET_X = 30;
const IMAGE_OFFSET_Y = 20;

// This is necessary so we don't send the entire CONST object to the worklet which could lead to performance issues
// https://docs.swmansion.com/react-native-reanimated/docs/guides/worklets/#capturing-closure
const ANIMATION_GYROSCOPE_VALUE = CONST.ANIMATION_GYROSCOPE_VALUE;

function AnimatedEmptyStateBackground() {
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useThemeIllustrations();
    // If window width is greater than the max background width, repeat the background image
    const maxBackgroundWidth = variables.sideBarWidth + CONST.EMPTY_STATE_BACKGROUND.ASPECT_RATIO * CONST.EMPTY_STATE_BACKGROUND.WIDE_SCREEN.IMAGE_HEIGHT;

    // Get data from phone rotation sensor and prep other variables for animation
    const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE);
    const xOffset = useSharedValue(0);
    const yOffset = useSharedValue(0);
    const isReducedMotionEnabled = useReducedMotion();

    // Apply data to create style object
    const animatedStyles = useAnimatedStyle(() => {
        if (!shouldUseNarrowLayout || isReducedMotionEnabled) {
            return {};
        }
        /*
         * We use x and y gyroscope velocity and add it to position offset to move background based on device movements.
         * Position the phone was in while entering the screen is the initial position for background image.
         */
        const {x, y} = animatedSensor.sensor.get();
        // The x vs y here seems wrong but is the way to make it feel right to the user
        xOffset.set((value) => clamp(value + y * ANIMATION_GYROSCOPE_VALUE, -IMAGE_OFFSET_X, IMAGE_OFFSET_X));
        yOffset.set((value) => clamp(value - x * ANIMATION_GYROSCOPE_VALUE, -IMAGE_OFFSET_Y, IMAGE_OFFSET_Y));
        return {
            transform: [{translateX: withSpring(xOffset.get())}, {translateY: withSpring(yOffset.get(), {overshootClamping: true})}, {scale: 1.15}],
        };
    }, [isReducedMotionEnabled]);

    return (
        <View style={StyleUtils.getReportWelcomeBackgroundContainerStyle()}>
            <Animated.Image
                source={illustrations.EmptyStateBackgroundImage}
                style={[StyleUtils.getReportWelcomeBackgroundImageStyle(shouldUseNarrowLayout), animatedStyles]}
                resizeMode={windowWidth > maxBackgroundWidth ? 'repeat' : 'cover'}
            />
        </View>
    );
}

AnimatedEmptyStateBackground.displayName = 'AnimatedEmptyStateBackground';
export default AnimatedEmptyStateBackground;
