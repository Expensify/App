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

export {clamp, SPRING_CONFIG, zoomScaleBounceFactors};
