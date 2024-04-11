import React from 'react';
import {InteractionManager} from 'react-native';
import {Easing, interpolate, interpolateColor, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';
import {DELAY_FACTOR} from './config';

type Props = {
    /** Border radius of the wrapper */
    borderRadius: number;

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
export default function useAnimatedHighlightStyle({
    borderRadius,
    shouldHighlight,
    highlightDuration = CONST.ANIMATED_HIGHLIGHT_DURATION,
    delay = CONST.ANIMATED_HIGHLIGHT_DELAY,
    height,
}: Props) {
    const actualDelay = delay * DELAY_FACTOR;
    const repeatableProgress = useSharedValue(0);
    const nonRepeatableProgress = useSharedValue(shouldHighlight ? 0 : 1);
    const theme = useTheme();

    const highlightBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(repeatableProgress.value, [0, 1], ['rgba(0, 0, 0, 0)', theme.border]),
        height: interpolate(nonRepeatableProgress.value, [0, 1], [0, height]),
        opacity: interpolate(nonRepeatableProgress.value, [0, 1], [0, 1]),
        borderRadius,
    }));

    React.useEffect(() => {
        if (!shouldHighlight) {
            return;
        }

        InteractionManager.runAfterInteractions(() => {
            runOnJS(() => {
                nonRepeatableProgress.value = withDelay(actualDelay, withTiming(1, {duration: highlightDuration, easing: Easing.inOut(Easing.ease)}));
                repeatableProgress.value = withSequence(
                    withDelay(actualDelay, withTiming(1, {duration: highlightDuration, easing: Easing.inOut(Easing.ease)})),
                    withDelay(actualDelay, withTiming(0, {duration: highlightDuration, easing: Easing.inOut(Easing.ease)})),
                );
            })();
        });
    }, [shouldHighlight, highlightDuration, actualDelay, repeatableProgress, nonRepeatableProgress]);

    return highlightBackgroundStyle;
}
