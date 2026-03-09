import React, {useState} from 'react';
import {Easing, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';

type Props = {
    /** Border radius of the wrapper */
    borderRadius?: number;

    /** Height of the item that is to be faded */
    height?: number;

    /** Delay before the highlighted item enters */
    itemEnterDelay?: number;

    /** Duration in which the item enters */
    itemEnterDuration?: number;

    /** Delay before the item starts to get highlighted */
    highlightStartDelay?: number;

    /** Duration in which the item gets fully highlighted */
    highlightStartDuration?: number;

    /** Delay before the item starts to get un-highlighted */
    highlightEndDelay?: number;

    /** Duration in which the item gets fully un-highlighted */
    highlightEndDuration?: number;

    /** Whether the item should be highlighted */
    shouldHighlight: boolean;

    /** Whether it should return height and border radius styles */
    shouldApplyOtherStyles?: boolean;

    /** The base backgroundColor used for the highlight animation, defaults to theme.appBG
     * @default theme.appBG
     */
    backgroundColor?: string;
    /** The base highlightColor used for the highlight animation, defaults to theme.border
     * @default theme.border
     */
    highlightColor?: string;

    /** Whether to skip the initial fade-in animation and show the component immediately
     * @default false
     */
    skipInitialFade?: boolean;
};

/**
 * Returns a highlight style that interpolates the color, height and opacity giving a fading effect.
 */
export default function useAnimatedHighlightStyle({
    borderRadius,
    shouldHighlight,
    itemEnterDelay = CONST.ANIMATED_HIGHLIGHT_ENTRY_DELAY,
    itemEnterDuration = CONST.ANIMATED_HIGHLIGHT_ENTRY_DURATION,
    highlightStartDelay = CONST.ANIMATED_HIGHLIGHT_START_DELAY,
    highlightStartDuration = CONST.ANIMATED_HIGHLIGHT_START_DURATION,
    highlightEndDelay = CONST.ANIMATED_HIGHLIGHT_END_DELAY,
    highlightEndDuration = CONST.ANIMATED_HIGHLIGHT_END_DURATION,
    height,
    highlightColor,
    backgroundColor,
    shouldApplyOtherStyles = true,
    skipInitialFade = false,
}: Props) {
    const [startHighlight, setStartHighlight] = useState(false);
    const repeatableProgress = useSharedValue(0);
    const initialNonRepeatableProgressValue = skipInitialFade || !shouldHighlight ? 1 : 0;
    const nonRepeatableProgress = useSharedValue(initialNonRepeatableProgressValue);
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const theme = useTheme();

    const highlightBackgroundStyle = useAnimatedStyle(() => {
        'worklet';

        const repeatableValue = repeatableProgress.get();
        const nonRepeatableValue = nonRepeatableProgress.get();

        return {
            backgroundColor: interpolateColor(repeatableValue, [0, 1], [backgroundColor ?? theme.appBG, highlightColor ?? theme.border]),
            opacity: interpolate(nonRepeatableValue, [0, 1], [0, 1]),
            ...(shouldApplyOtherStyles && {height: height ? interpolate(nonRepeatableValue, [0, 1], [0, height]) : 'auto', borderRadius}),
        };
    }, [borderRadius, height, backgroundColor, highlightColor, theme.appBG, theme.border]);

    React.useEffect(() => {
        if (!shouldHighlight || startHighlight) {
            return;
        }
        setStartHighlight(true);
        // We only need to add shouldHighlight as a dependency and adding startHighlight as deps will cause a loop because
        // if shouldHighlight stays at true the above early return will not be executed and this useEffect will be run
        // as long as shouldHighlight is true as we set startHighlight to false in the below useEffect.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldHighlight]);

    React.useEffect(() => {
        if (!startHighlight || !didScreenTransitionEnd) {
            return;
        }
        setStartHighlight(false);
        scheduleOnRN(() => {
            nonRepeatableProgress.set(
                withDelay(
                    itemEnterDelay,
                    withTiming(1, {duration: itemEnterDuration, easing: Easing.inOut(Easing.ease)}, (finished) => {
                        if (!finished) {
                            return;
                        }

                        repeatableProgress.set(
                            withSequence(
                                withDelay(highlightStartDelay, withTiming(1, {duration: highlightStartDuration, easing: Easing.inOut(Easing.ease)})),
                                withDelay(highlightEndDelay, withTiming(0, {duration: highlightEndDuration, easing: Easing.inOut(Easing.ease)})),
                            ),
                        );
                    }),
                ),
            );
        });
    }, [
        didScreenTransitionEnd,
        startHighlight,
        itemEnterDelay,
        itemEnterDuration,
        highlightStartDelay,
        highlightStartDuration,
        highlightEndDelay,
        highlightEndDuration,
        repeatableProgress,
        nonRepeatableProgress,
    ]);

    return highlightBackgroundStyle;
}
