import {useCallback} from 'react';

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
const useWorkletCallback = (callback: Parameters<typeof useCallback>[0], deps: Parameters<typeof useCallback>[1] = []) => {
    'worklet';

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(callback, deps);
};

type GetCanvasFitScale = (props: {
    canvasSize: {
        width: number;
        height: number;
    };
    contentSize: {
        width: number;
        height: number;
    };
}) => {scaleX: number; scaleY: number; minScale: number; maxScale: number};

const getCanvasFitScale: GetCanvasFitScale = ({canvasSize, contentSize}) => {
    const scaleX = canvasSize.width / contentSize.width;
    const scaleY = canvasSize.height / contentSize.height;

    const minScale = Math.min(scaleX, scaleY);
    const maxScale = Math.max(scaleX, scaleY);

    return {scaleX, scaleY, minScale, maxScale};
};

export {SPRING_CONFIG, zoomScaleBounceFactors, clamp, useWorkletCallback, getCanvasFitScale};
