import ActivityIndicator from '@components/ActivityIndicator';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React, {createContext, useContext, useEffect, useLayoutEffect, useState} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN, scheduleOnUI} from 'react-native-worklets';

/**
 * Skia draws a chart a few frames after it mounts: 2 to 4 on web.
 * Counted in frames because a stalled main thread delays the draw by frames, which a timer would not wait for.
 * Counted on the UI thread, where native Skia draws, because frames counted on a busy JS thread run seconds past the draw.
 */
const HOLD_FRAMES = 5;

type ChartLoadState = {
    isLoading: boolean;
    isDrawnBySkia: boolean;
};

const ChartLoadingContext = createContext<((loadState: ChartLoadState) => void) | null>(null);

function useReportChartLoading(isLoading: boolean, isDrawnBySkia = true) {
    const setLoadState = useContext(ChartLoadingContext);

    // Before paint, so no frame shows the chart and the in-flow spinner stacked, or neither of them
    useLayoutEffect(() => {
        setLoadState?.({isLoading, isDrawnBySkia});
    }, [setLoadState, isLoading, isDrawnBySkia]);
}

function useIsInsideChartReveal() {
    return useContext(ChartLoadingContext) !== null;
}

type ChartRevealProps = {
    /** Must match the loaded chart's height, or the card jumps at the reveal. */
    loadingHeight: number;

    /** Until the card is measured there is no canvas for Skia to draw, so the chart is not ready to reveal. */
    isCardMeasured: boolean;

    /** Must report through `useReportChartLoading`, or the spinner never goes away. */
    children: ReactNode;
};

function ChartReveal({loadingHeight, isCardMeasured, children}: ChartRevealProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [loadState, setLoadState] = useState<ChartLoadState | null>(null);
    const [hasReportedLoading, setHasReportedLoading] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const opacity = useSharedValue(0);
    const fadeStyle = useAnimatedStyle(() => ({opacity: opacity.get()}));

    // Hidden on the UI thread as the fade starts, because unmounting it waits for a JS thread that can be busy for seconds
    const spinnerStyle = useAnimatedStyle(() => ({opacity: opacity.get() > 0 ? 0 : 1}));

    // Written on the UI thread, which counts the hold, so that the cleanup there can cancel the hold's next frame
    const holdFrameID = useSharedValue(0);

    const isReady = !!loadState && !loadState.isLoading && isCardMeasured;

    // A chart that mounts with everything in memory waits only for its card's first layout to report the width,
    // so it shows no spinner and fades in at once. Only a chart that has shown the spinner holds it until Skia has drawn.
    const isSpinnerShown = !loadState || hasReportedLoading;
    const shouldHold = hasReportedLoading && !!loadState?.isDrawnBySkia;

    // Adjusted during render, not in the effect below, so the spinner changes in the same commit as what the chart reports
    if (loadState?.isLoading && !hasReportedLoading) {
        setHasReportedLoading(true);
    }
    if (!isReady && isRevealed) {
        setIsRevealed(false);
    }
    if (isReady && !shouldHold && !isRevealed) {
        setIsRevealed(true);
    }

    useEffect(() => {
        if (!isReady) {
            opacity.set(0);
            return;
        }

        // Read here so that the worklet below captures a number rather than all of CONST
        const duration = CONST.ANIMATED_TRANSITION;
        if (!shouldHold) {
            opacity.set(withTiming(1, {duration}));
            return;
        }

        scheduleOnUI(() => {
            'worklet';

            let framesLeft = HOLD_FRAMES;
            const countFrame = () => {
                framesLeft -= 1;
                if (framesLeft > 0) {
                    holdFrameID.set(requestAnimationFrame(countFrame));
                    return;
                }
                opacity.set(withTiming(1, {duration}));
                scheduleOnRN(setIsRevealed, true);
            };
            holdFrameID.set(requestAnimationFrame(countFrame));
        });

        return () => {
            scheduleOnUI(() => {
                'worklet';

                cancelAnimationFrame(holdFrameID.get());
            });
        };
    }, [isReady, shouldHold, opacity, holdFrameID]);

    return (
        <ChartLoadingContext.Provider value={setLoadState}>
            <View>
                <Animated.View style={fadeStyle}>{children}</Animated.View>
                {!isRevealed && (
                    <Animated.View style={[styles.chartActivityIndicator, StyleUtils.getHeight(loadingHeight), isReady && [styles.pAbsolute, styles.t0, styles.l0, styles.r0, spinnerStyle]]}>
                        {isSpinnerShown && <ActivityIndicator size="large" />}
                    </Animated.View>
                )}
            </View>
        </ChartLoadingContext.Provider>
    );
}

export default ChartReveal;
export {HOLD_FRAMES, useIsInsideChartReveal, useReportChartLoading};
