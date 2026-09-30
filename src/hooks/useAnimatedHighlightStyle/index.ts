import useScreenVisibilityStore from '@hooks/useScreenVisibilityStore';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import React, {useRef} from 'react';
import {Easing, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

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

/** The play this instance last armed, and how far it has got. */
type ArmedPlay = {
    key: string | undefined;

    /** `armed` owes an entry and a pulse; `awaitingVisibility` is revealed and owes only the pulse; `played` owes nothing. */
    stage: 'armed' | 'awaitingVisibility' | 'played';
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

    React.useEffect(() => {
        // Runs on the JS thread. Only the entry below needs to hop threads.
        const revealRow = () => {
            nonRepeatableProgress.set(withTiming(1, {duration: itemEnterDuration, easing: Easing.inOut(Easing.ease)}));
        };
        currentKeyRef.current = highlightKey;
        const armedPlay = armedPlayRef.current;
        const isPlayForThisRow = !!armedPlay && armedPlay.key === highlightKey;
        if (armedPlay && armedPlay.stage !== 'played' && !isPlayForThisRow) {
            // The row shows another item now, so this play is dropped.
            if (armedPlay.stage === 'armed') {
                // A row mounted highlighted starts invisible, so it still needs revealing when its play is dropped.
                revealRow();
            }
            armedPlayRef.current = {key: armedPlay.key, stage: 'played'};
        }
        // Owed when asked for and not yet played for this item. It stays owed once armed, since some callers ask for a single render.
        if (shouldHighlight && (shouldHighlight !== prevShouldHighlightRef.current || !isPlayForThisRow)) {
            // A row already revealed keeps waiting, rather than owing a second reveal.
            const isRevealedAndWaiting = isPlayForThisRow && armedPlay.stage === 'awaitingVisibility';
            armedPlayRef.current = {key: highlightKey, stage: isRevealedAndWaiting ? 'awaitingVisibility' : 'armed'};
        }
        prevShouldHighlightRef.current = shouldHighlight;
        const owedPlay = armedPlayRef.current;
        if (!owedPlay || owedPlay.stage === 'played' || !didScreenTransitionEnd) {
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
        // On the JS thread, where the current key can be read, so a row recycled mid-entry doesn't pulse for the item it replaced.
        const pulseUnlessRecycled = () => {
            if (armedPlayRef.current?.key !== currentKeyRef.current) {
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
                            scheduleOnRN(pulseUnlessRecycled);
                        }),
                    ),
                );
            });
        };
        if (visibility.getIsVisible()) {
            // A revealed row owes only its pulse.
            const play = owedPlay.stage === 'awaitingVisibility' ? playPulse : playEntryThenPulse;
            armedPlayRef.current = {key: owedPlay.key, stage: 'played'};
            play();
            return;
        }
        if (owedPlay.stage === 'armed') {
            // Reveal now: a row mounted highlighted starts invisible, and the screen may never be uncovered. Only the pulse waits.
            armedPlayRef.current = {key: owedPlay.key, stage: 'awaitingVisibility'};
            revealRow();
        }
        const unsubscribe = visibility.subscribe(() => {
            if (!visibility.getIsVisible()) {
                return;
            }
            unsubscribe();
            armedPlayRef.current = {key: owedPlay.key, stage: 'played'};
            playPulse();
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
