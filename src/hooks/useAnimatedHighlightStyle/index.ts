import useScreenVisibilityStore from '@hooks/useScreenVisibilityStore';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import type {SharedValue} from 'react-native-reanimated';

import React, {useLayoutEffect, useRef} from 'react';
import {Easing, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import type {ArmedPlay} from './armedPlay';

import {getNextArmedPlay, getPlayStep} from './armedPlay';

type Props = {
    borderRadius?: number;

    /** Height of the item that is to be faded */
    height?: number;

    /** Delay before the highlighted item enters */
    itemEnterDelay?: number;

    itemEnterDuration?: number;
    highlightStartDelay?: number;

    /** Duration in which the item gets fully highlighted */
    highlightStartDuration?: number;

    /** Delay before the item starts to get un-highlighted */
    highlightEndDelay?: number;

    /** Duration in which the item gets fully un-highlighted */
    highlightEndDuration?: number;

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

    /** Key of the item this row shows, so a recycled row isn't mistaken for the same one. `undefined` for a row that always shows the same thing. */
    highlightKey: string | undefined;
};

type HighlightTimings = Required<Pick<Props, 'itemEnterDelay' | 'itemEnterDuration' | 'highlightStartDelay' | 'highlightStartDuration' | 'highlightEndDelay' | 'highlightEndDuration'>>;

function revealRow(nonRepeatableProgress: SharedValue<number>, itemEnterDuration: number) {
    nonRepeatableProgress.set(withTiming(1, {duration: itemEnterDuration, easing: Easing.inOut(Easing.ease)}));
}

function playPulse(repeatableProgress: SharedValue<number>, timings: HighlightTimings) {
    repeatableProgress.set(
        withSequence(
            withDelay(timings.highlightStartDelay, withTiming(1, {duration: timings.highlightStartDuration, easing: Easing.inOut(Easing.ease)})),
            withDelay(timings.highlightEndDelay, withTiming(0, {duration: timings.highlightEndDuration, easing: Easing.inOut(Easing.ease)})),
        ),
    );
}

/** Calls `onEntryFinished` on the JS thread once the entry completes. */
function playEntry(nonRepeatableProgress: SharedValue<number>, timings: HighlightTimings, onEntryFinished: () => void) {
    scheduleOnRN(() => {
        nonRepeatableProgress.set(
            withDelay(
                timings.itemEnterDelay,
                withTiming(1, {duration: timings.itemEnterDuration, easing: Easing.inOut(Easing.ease)}, (finished) => {
                    if (!finished) {
                        return;
                    }
                    // This callback runs on the UI thread, so the pulse hops back to JS once.
                    scheduleOnRN(onEntryFinished);
                }),
            ),
        );
    });
}

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
    highlightKey,
}: Props) {
    const prevShouldHighlightRef = useRef(false);
    const armedPlayRef = useRef<ArmedPlay | undefined>(undefined);
    // The key the row shows now, checked against the play's when the entry finishes.
    const currentKeyRef = useRef<string | undefined>(highlightKey);
    const repeatableProgress = useSharedValue(0);
    const initialNonRepeatableProgressValue = skipInitialFade || !shouldHighlight ? 1 : 0;
    const nonRepeatableProgress = useSharedValue(initialNonRepeatableProgressValue);
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const visibility = useScreenVisibilityStore();
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

    // Set in the commit rather than after it, so a pulse queued from the UI thread in between can't read the item the row showed before.
    useLayoutEffect(() => {
        currentKeyRef.current = highlightKey;
    }, [highlightKey]);

    React.useEffect(() => {
        const {play: armedPlay, shouldRevealDroppedRow} = getNextArmedPlay(armedPlayRef.current, {highlightKey, shouldHighlight, wasHighlightRequested: prevShouldHighlightRef.current});
        prevShouldHighlightRef.current = shouldHighlight;
        if (shouldRevealDroppedRow) {
            revealRow(nonRepeatableProgress, itemEnterDuration);
        }

        const {step, play} = getPlayStep(armedPlay, {didScreenTransitionEnd, isScreenVisible: visibility.getIsVisible()});
        armedPlayRef.current = play;
        if (step === 'none') {
            return;
        }
        const timings = {itemEnterDelay, itemEnterDuration, highlightStartDelay, highlightStartDuration, highlightEndDelay, highlightEndDuration};
        if (step === 'pulse') {
            playPulse(repeatableProgress, timings);
            return;
        }
        if (step === 'entryThenPulse') {
            playEntry(nonRepeatableProgress, timings, () => {
                // Checked on the JS thread, where the current key can be read, so a row recycled mid-entry doesn't pulse for the item it replaced.
                if (currentKeyRef.current !== play.key) {
                    return;
                }
                playPulse(repeatableProgress, timings);
            });
            return;
        }
        if (step === 'revealThenWait') {
            revealRow(nonRepeatableProgress, itemEnterDuration);
        }
        const unsubscribe = visibility.subscribe(() => {
            const nextPlayStep = getPlayStep(play, {didScreenTransitionEnd, isScreenVisible: visibility.getIsVisible()});
            if (nextPlayStep.step !== 'pulse') {
                return;
            }
            unsubscribe();
            armedPlayRef.current = nextPlayStep.play;
            playPulse(repeatableProgress, timings);
        });
        return unsubscribe;
    }, [
        shouldHighlight,
        highlightKey,
        didScreenTransitionEnd,
        visibility,
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
