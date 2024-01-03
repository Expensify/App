import {useCallback} from 'react';

const SPRING_CONFIG = {
    mass: 1,
    stiffness: 1000,
    damping: 500,
};

const zoomScaleBounceFactors = {
    min: 0.7,
    max: 1.5,
};

function clamp(value: number, lowerBound: number, upperBound: number) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

const useWorkletCallback = (callback: Parameters<typeof useCallback>[0], deps: Parameters<typeof useCallback>[1] = []) => {
    'worklet';

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(callback, deps);
};

export {SPRING_CONFIG, zoomScaleBounceFactors, clamp, useWorkletCallback};
