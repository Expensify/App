import React, {useState} from 'react';
import {InteractionManager} from 'react-native';
import {Easing, interpolate, interpolateColor, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';

type Props = {
    /** Border radius of the wrapper */
    borderRadius: number;

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

    /** The base backgroundColor used for the highlight animation, defaults to theme.appBG
     * @default theme.appBG
     */
    backgroundColor?: string;
    /** The base highlightColor used for the highlight animation, defaults to theme.border
     * @default theme.border
     */
    highlightColor?: string;
};

/**
 * Returns a highlight style that interpolates the colour, height and opacity giving a fading effect.
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
}: Props) {
    const [startHighlight, setStartHighlight] = useState(false);
    const repeatableProgress = useSharedValue(0);
    const nonRepeatableProgress = useSharedValue(shouldHighlight ? 0 : 1);
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const theme = useTheme();

    const highlightBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(repeatableProgress.value, [0, 1], [backgroundColor ?? theme.appBG, highlightColor ?? theme.border]),
        height: height ? interpolate(nonRepeatableProgress.value, [0, 1], [0, height]) : 'auto',
        opacity: interpolate(nonRepeatableProgress.value, [0, 1], [0, 1]),
        borderRadius,
    }));

    React.useEffect(() => {
        if (!shouldHighlight || startHighlight) {
            return;
        }
        setStartHighlight(true);
        // We only need to add shouldHighlight as a dependency and adding startHighlight as deps will cause a loop because
        // if shouldHighlight stays at true the above early return will not be executed and this useEffect will be run
        // as long as shouldHighlight is true as we set startHighlight to false in the below useEffect.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldHighlight]);

    React.useEffect(() => {
        if (!startHighlight || !didScreenTransitionEnd) {
            return;
        }
        setStartHighlight(false);
        InteractionManager.runAfterInteractions(() => {
            runOnJS(() => {
                nonRepeatableProgress.value = withDelay(
                    itemEnterDelay,
                    withTiming(1, {duration: itemEnterDuration, easing: Easing.inOut(Easing.ease)}, (finished) => {
                        if (!finished) {
                            return;
                        }

                        // eslint-disable-next-line react-compiler/react-compiler
                        repeatableProgress.value = withSequence(
                            withDelay(highlightStartDelay, withTiming(1, {duration: highlightStartDuration, easing: Easing.inOut(Easing.ease)})),
                            withDelay(highlightEndDelay, withTiming(0, {duration: highlightEndDuration, easing: Easing.inOut(Easing.ease)})),
                        );
                    }),
                );
            })();
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
