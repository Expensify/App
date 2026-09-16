import type {Pattern} from 'react-native-pulsar';

/** Frame count and frame rate of `assets/animations/Fireworks.lottie`. */
const FIREWORKS_FRAMES = 109;
const FIREWORKS_FRAME_RATE = 24;

/**
 * Pulsar haptics aligned to the Fireworks animation. It fires three shells: two single bursts, then a
 * finale that keeps crackling until the last frame. Each onset gets a hard hit plus lighter taps for the
 * sparks falling out of it. Times are milliseconds from the start of the animation.
 */
const FIREWORKS_HAPTIC_PATTERN: Pattern = {
    discretePattern: [
        // First shell (frame 21).
        {time: 875, amplitude: 1, frequency: 0.8},
        {time: 1040, amplitude: 0.4, frequency: 0.5},
        // Second shell (frame 55).
        {time: 2290, amplitude: 1, frequency: 0.8},
        {time: 2460, amplitude: 0.4, frequency: 0.5},
        // Finale (frame 83), the densest burst of the three, trailing off through frame 108.
        {time: 3460, amplitude: 1, frequency: 0.9},
        {time: 3710, amplitude: 0.5, frequency: 0.7},
        {time: 3830, amplitude: 0.45, frequency: 0.65},
        {time: 3960, amplitude: 0.4, frequency: 0.6},
        {time: 4125, amplitude: 0.6, frequency: 0.75},
        {time: 4210, amplitude: 0.35, frequency: 0.55},
        {time: 4460, amplitude: 0.25, frequency: 0.5},
    ],
    continuousPattern: {amplitude: [], frequency: []},
};

/**
 * Length of one pass of the animation. Pulsar derives this itself only from a plain JSON Lottie, and ours
 * are dotLottie files, so it has to be passed alongside the pattern.
 */
const FIREWORKS_DURATION_MS = (FIREWORKS_FRAMES / FIREWORKS_FRAME_RATE) * 1000;

export {FIREWORKS_HAPTIC_PATTERN, FIREWORKS_DURATION_MS};
