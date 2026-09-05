import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import {NavigationContext} from '@react-navigation/core';
import React, {useContext, useRef} from 'react';
import {Easing, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

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

/** How far a play has got: armed when the highlight turns on, then holding a revealed row until its pulse can be seen. */
type PlayPhase = 'idle' | 'armed' | 'awaitingFocus';

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
    const prevShouldHighlightRef = useRef(false);
    const playPhaseRef = useRef<PlayPhase>('idle');
    const repeatableProgress = useSharedValue(0);
    const initialNonRepeatableProgressValue = skipInitialFade || !shouldHighlight ? 1 : 0;
    const nonRepeatableProgress = useSharedValue(initialNonRepeatableProgressValue);
    const {didScreenTransitionEnd, shouldUseNarrowLayoutOnWideRHP} = useScreenWrapperTransitionStatus();
    const navigation = useContext(NavigationContext);
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
        // Called from the JS thread, so it sets its value there and leaves the one thread hop to the worklet boundary below.
        const revealRow = () => {
            nonRepeatableProgress.set(withTiming(1, {duration: itemEnterDuration, easing: Easing.inOut(Easing.ease)}));
        };
        if (shouldHighlight !== prevShouldHighlightRef.current) {
            if (!shouldHighlight && playPhaseRef.current === 'armed') {
                // A row that mounted highlighted starts at zero opacity and only the entry reveals it, so dropping the play still owes the reveal.
                revealRow();
            }
            // The highlight turning off retracts the reason to play, so an outstanding play is dropped whatever stage it reached.
            playPhaseRef.current = shouldHighlight ? 'armed' : 'idle';
        }
        prevShouldHighlightRef.current = shouldHighlight;
        if (playPhaseRef.current === 'idle' || !didScreenTransitionEnd) {
            return;
        }
        const playPulse = () => {
            repeatableProgress.set(
                withSequence(
                    withDelay(highlightStartDelay, withTiming(1, {duration: highlightStartDuration, easing: Easing.inOut(Easing.ease)})),
                    withDelay(highlightEndDelay, withTiming(0, {duration: highlightEndDuration, easing: Easing.inOut(Easing.ease)})),
                ),
            );
        };
        // Runs on the JS thread, where a highlight retracted mid-entry is still visible, so a recycled row cannot pulse.
        const pulseIfStillHighlighted = () => {
            if (!prevShouldHighlightRef.current) {
                return;
            }
            playPulse();
        };
        const playEntryThenPulse = () => {
            scheduleOnRN(() => {
                nonRepeatableProgress.set(
                    withDelay(
                        itemEnterDelay,
                        withTiming(1, {duration: itemEnterDuration, easing: Easing.inOut(Easing.ease)}, (finished) => {
                            if (!finished) {
                                return;
                            }
                            // This callback runs on the UI thread, so the pulse hops back to JS once.
                            scheduleOnRN(pulseIfStillHighlighted);
                        }),
                    ),
                );
            });
        };
        const pulseOnNextFocus = () => {
            if (!navigation) {
                return;
            }
            // Imperative rather than useIsScreenFocused: a table renders one of these per row, so re-rendering them all on every focus flip costs more.
            const unsubscribe = navigation.addListener('focus', () => {
                unsubscribe();
                if (playPhaseRef.current !== 'awaitingFocus') {
                    return;
                }
                playPhaseRef.current = 'idle';
                playPulse();
            });
            return unsubscribe;
        };
        if (navigation && shouldUseNarrowLayoutOnWideRHP && !navigation.isFocused()) {
            if (playPhaseRef.current === 'awaitingFocus') {
                // The row is already revealed, so a re-run re-attaches the outstanding pulse rather than replaying the entry.
                return pulseOnNextFocus();
            }
            // Reveal now: a row mounting highlighted starts at zero opacity/height, and focus may never arrive. Only the pulse waits.
            playPhaseRef.current = 'awaitingFocus';
            revealRow();
            return pulseOnNextFocus();
        }
        // A revealed row only owes its pulse, so replaying the entry would restart what the user has already seen.
        const play = playPhaseRef.current === 'awaitingFocus' ? playPulse : playEntryThenPulse;
        playPhaseRef.current = 'idle';
        play();
    }, [
        shouldHighlight,
        didScreenTransitionEnd,
        navigation,
        shouldUseNarrowLayoutOnWideRHP,
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
