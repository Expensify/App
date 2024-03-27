import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {InteractionManager} from 'react-native';
import {interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';
import CONST from '@src/CONST';
import useTheme from './useTheme';

/**
 * Returns a highlight style that interpolates the colour, height and opacity giving a fading effect.
 */
export default function useAnimatedHighlightStyle(shouldHighlight: boolean, highlightDuration: number = CONST.ANIMATED_TRANSITION, delay = 100) {
    const repeatableProgress = useSharedValue(0);
    const nonRepeatableProgress = useSharedValue(0);
    const theme = useTheme();

    const highlightBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(repeatableProgress.value, [0, 1], ['rgba(0, 0, 0, 0)', theme.border]),
        flex: interpolate(nonRepeatableProgress.value, [0, 1], [0, 1]),
        opacity: interpolate(nonRepeatableProgress.value, [0, 1], [0, 1]),
    }));

    useFocusEffect(
        React.useCallback(() => {
            if (!shouldHighlight) {
                return;
            }
            nonRepeatableProgress.value = withTiming(1, {duration: highlightDuration});
            InteractionManager.runAfterInteractions(() => {
                repeatableProgress.value = withSequence(
                    withDelay(delay, withTiming(0)),
                    withTiming(1, {duration: highlightDuration}),
                    withDelay(delay, withTiming(1)),
                    withTiming(0, {duration: highlightDuration}),
                );
            });
        }, [shouldHighlight, highlightDuration, delay, repeatableProgress, nonRepeatableProgress]),
    );

    return highlightBackgroundStyle;
}
