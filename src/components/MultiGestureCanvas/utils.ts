import {useCallback} from 'react';
import type {WorkletFunction} from 'react-native-reanimated/lib/typescript/reanimated2/commonTypes';

/** Clamps a value between a lower and upper bound */
function clamp(value: number, lowerBound: number, upperBound: number) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

/**
 * Creates a memoized callback on the UI thread
 * Same as `useWorkletCallback` from `react-native-reanimated` but without the deprecation warning
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function useWorkletCallback<Args extends unknown[], ReturnValue = void>(
    callback: Parameters<typeof useCallback<(...args: Args) => ReturnValue>>[0],
    deps: Parameters<typeof useCallback<(...args: Args) => ReturnValue>>[1] = [],
): WorkletFunction<Args, ReturnValue> {
    'worklet';

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback<(...args: Args) => ReturnValue>(callback, deps) as WorkletFunction<Args, ReturnValue>;
}

export {clamp, useWorkletCallback};
