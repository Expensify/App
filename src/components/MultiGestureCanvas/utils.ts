import {useCallback} from 'react';
import type {WorkletFunction} from 'react-native-reanimated/lib/typescript/reanimated2/commonTypes';

// The spring config is used to determine the physics of the spring animation
// Details and a playground for testing different configs can be found at
// https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring
const SPRING_CONFIG = {
    mass: 1,
    stiffness: 1000,
    damping: 500,
};

// The zoom scale bounce factors are used to determine the amount of bounce
// that is allowed when the user zooms more than the min or max zoom levels
const zoomScaleBounceFactors = {
    min: 0.7,
    max: 1.5,
};

/**
 * Clamps a value between a lower and upper bound
 * @param value
 * @param lowerBound
 * @param upperBound
 * @returns
 */
function clamp(value: number, lowerBound: number, upperBound: number) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

/**
 * Creates a memoized callback on the UI thread
 * Same as `useWorkletCallback` from `react-native-reanimated` but without the deprecation warning
 * @param callback
 * @param deps
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function useWorkletCallback<Args extends unknown[], ReturnValue = void>(
    callback: Parameters<typeof useCallback<(...args: Args) => ReturnValue>>[0],
    deps: Parameters<typeof useCallback<T>>[1] = [],
): WorkletFunction<Args, ReturnValue> {
    'worklet';

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback<(...args: Args) => ReturnValue>(callback, deps) as WorkletFunction<Args, ReturnValue>;
}

export {SPRING_CONFIG, zoomScaleBounceFactors, clamp, useWorkletCallback};
