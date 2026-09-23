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

/** Frame count and frame rate of `assets/animations/Safe.lottie`. */
const SAFE_FRAMES = 64;
const SAFE_FRAME_RATE = 24;

/**
 * Pulsar haptics aligned to the Safe animation, which loops: the dial spins (frames 9-32), the lock flashes
 * and the door swings open (frames 34-38), the safe sits open while the money floats (frames 43-51), then
 * the door swings shut (frames 57-63) and slams as the loop wraps.
 *
 * The dial reads as an even mechanical ratchet rather than a transcription of its own keyframes, which
 * accelerate by the frame and feel arbitrary. The open stretch is carried by the continuous channel instead
 * of scattered taps, which is what made the middle feel random. The slam is the strongest hit of the loop.
 * Times are milliseconds from the start of the animation.
 */
const SAFE_HAPTIC_PATTERN: Pattern = {
    discretePattern: [
        // Rebound of the slam that closed the previous loop (frames 0-5).
        {time: 42, amplitude: 0.45, frequency: 0.5},
        // Dial wind-up (frames 9 and 14), where it barely moves.
        {time: 375, amplitude: 0.2, frequency: 0.4},
        {time: 583, amplitude: 0.2, frequency: 0.4},
        // Dial ratchet, one tick every other frame at a constant weight (frames 19-29).
        {time: 792, amplitude: 0.3, frequency: 0.7},
        {time: 875, amplitude: 0.3, frequency: 0.7},
        {time: 958, amplitude: 0.3, frequency: 0.7},
        {time: 1042, amplitude: 0.3, frequency: 0.7},
        {time: 1125, amplitude: 0.3, frequency: 0.7},
        {time: 1208, amplitude: 0.3, frequency: 0.7},
        // The dial hits its stop (frame 32), then the lock flashes open (frame 34).
        {time: 1333, amplitude: 0.5, frequency: 0.35},
        {time: 1417, amplitude: 0.6, frequency: 0.55},
        // The door swings out and overshoots (frame 38).
        {time: 1583, amplitude: 0.75, frequency: 0.45},
        // The door slams shut (frame 63), the heaviest hit of the loop and the lowest frequency, so it
        // reads as a thud. Its rebound is the first event of the next pass.
        {time: 2625, amplitude: 1, frequency: 0.25},
    ],
    // A low shimmer under the open safe, then a swell as the door swings shut. Both channels have to return
    // to their resting value, because the envelope holds its last point for the rest of the loop.
    continuousPattern: {
        amplitude: [
            {time: 0, value: 0},
            {time: 1583, value: 0},
            {time: 1750, value: 0.12},
            {time: 2200, value: 0.06},
            {time: 2292, value: 0},
            // Door swinging shut (frames 57-63), cut just before the slam so the hit lands on silence.
            {time: 2375, value: 0.12},
            {time: 2580, value: 0.45},
            {time: 2625, value: 0},
            {time: 2666, value: 0},
        ],
        frequency: [
            {time: 0, value: 0.5},
            {time: 1750, value: 0.85},
            {time: 2292, value: 0.8},
            {time: 2375, value: 0.5},
            {time: 2625, value: 0.25},
            {time: 2666, value: 0.25},
        ],
    },
};

/**
 * Length of one pass of each animation. Pulsar derives this itself only from a plain JSON Lottie, and ours
 * are dotLottie files, so it has to be passed alongside the pattern.
 */
const FIREWORKS_DURATION_MS = (FIREWORKS_FRAMES / FIREWORKS_FRAME_RATE) * 1000;
const SAFE_DURATION_MS = (SAFE_FRAMES / SAFE_FRAME_RATE) * 1000;

export {FIREWORKS_HAPTIC_PATTERN, FIREWORKS_DURATION_MS, SAFE_HAPTIC_PATTERN, SAFE_DURATION_MS};
