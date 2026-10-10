import ActivityIndicator from '@components/ActivityIndicator';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React, {createContext, useContext, useEffect, useLayoutEffect, useState} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

/**
 * On web, Skia draws a chart 2 to 4 frames after it mounts.
 * Counted in frames because a stalled main thread delays the draw by frames, which a timer would not wait for.
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

    /** Must report through `useReportChartLoading`, or the spinner never goes away. */
    children: ReactNode;
};

function ChartReveal({loadingHeight, children}: ChartRevealProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [{isLoading, isDrawnBySkia}, setLoadState] = useState<ChartLoadState>({isLoading: true, isDrawnBySkia: true});
    const [isRevealed, setIsRevealed] = useState(false);
    const opacity = useSharedValue(0);
    const fadeStyle = useAnimatedStyle(() => ({opacity: opacity.get()}));

    // Adjusted during render, not in the effect below, so the spinner changes in the same commit as what the chart reports
    if (isLoading && isRevealed) {
        setIsRevealed(false);
    }
    if (!isLoading && !isDrawnBySkia && !isRevealed) {
        setIsRevealed(true);
    }

    useEffect(() => {
        if (isLoading) {
            opacity.set(0);
            return;
        }

        const fadeIn = () => opacity.set(withTiming(1, {duration: CONST.ANIMATED_TRANSITION}));
        if (!isDrawnBySkia) {
            fadeIn();
            return;
        }

        let framesLeft = HOLD_FRAMES;
        let frameID = 0;
        const countFrame = () => {
            framesLeft -= 1;
            if (framesLeft > 0) {
                frameID = requestAnimationFrame(countFrame);
                return;
            }
            setIsRevealed(true);
            fadeIn();
        };
        frameID = requestAnimationFrame(countFrame);

        return () => cancelAnimationFrame(frameID);
    }, [isLoading, isDrawnBySkia, opacity]);

    return (
        <ChartLoadingContext.Provider value={setLoadState}>
            <View>
                <Animated.View style={fadeStyle}>{children}</Animated.View>
                {!isRevealed && (
                    <View style={[styles.chartActivityIndicator, StyleUtils.getHeight(loadingHeight), !isLoading && [styles.pAbsolute, styles.t0, styles.l0, styles.r0]]}>
                        <ActivityIndicator size="large" />
                    </View>
                )}
            </View>
        </ChartLoadingContext.Provider>
    );
}

export default ChartReveal;
export {HOLD_FRAMES, useIsInsideChartReveal, useReportChartLoading};
