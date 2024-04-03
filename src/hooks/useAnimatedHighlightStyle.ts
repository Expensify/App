import React from 'react';
import {InteractionManager} from 'react-native';
import {Easing, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';
import CONST from '@src/CONST';
import useTheme from './useTheme';

type Props = {
    /** Height of the item that is to be faded */
    height: number;
    /** Whether the item should be highlighted */
    shouldHighlight: boolean;
    /** Duration of the highlight animation */
    highlightDuration?: number;
    /** Delay before the highlight animation starts */
    delay?: number;
};

/**
 * Returns a highlight style that interpolates the colour, height and opacity giving a fading effect.
 */
export default function useAnimatedHighlightStyle({shouldHighlight, highlightDuration = CONST.ANIMATED_HIGHLIGHT_DURATION, delay = CONST.ANIMATED_HIGHLIGHT_DELAY, height}: Props) {
    const repeatableProgress = useSharedValue(0);
    const nonRepeatableProgress = useSharedValue(0);
    const theme = useTheme();

    const highlightBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(repeatableProgress.value, [0, 1], ['rgba(0, 0, 0, 0)', theme.border]),
        height: interpolate(nonRepeatableProgress.value, [0, 1], [0, height]),
        opacity: interpolate(nonRepeatableProgress.value, [0, 1], [0, 1]),
    }));

    React.useEffect(() => {
        if (!shouldHighlight) {
            return;
        }
        InteractionManager.runAfterInteractions(() => {
            nonRepeatableProgress.value = withTiming(1, {duration: highlightDuration, easing: Easing.inOut(Easing.ease)});
            repeatableProgress.value = withSequence(
                withDelay(delay, withTiming(0)),
                withTiming(1, {duration: highlightDuration, easing: Easing.inOut(Easing.ease)}),
                withDelay(delay, withTiming(1)),
                withTiming(0, {duration: highlightDuration, easing: Easing.inOut(Easing.ease)}),
            );
        });
    }, [shouldHighlight, highlightDuration, delay, repeatableProgress, nonRepeatableProgress]);

    return shouldHighlight ? highlightBackgroundStyle : null;
}
