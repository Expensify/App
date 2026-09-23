import React from 'react';
import {HapticLottieView} from 'react-native-pulsar-lottie';

import type HapticLottieProps from './types';

/**
 * `LottieView` with Pulsar haptics driven by the animation's own timeline.
 *
 * `realtime` mode makes the animation the master clock: a Reanimated frame callback drives its progress
 * and samples the pattern on the UI thread, so the haptics stay aligned and repeat on every loop. The
 * alternative, `pattern` mode, plays a pattern whole from the start and has no notion of looping.
 */
function HapticLottie({haptics, hapticsDurationMs, hapticsEnabled = true, ...props}: HapticLottieProps) {
    return (
        <HapticLottieView
            {...props}
            haptics={haptics}
            hapticMode="realtime"
            hapticsEnabled={hapticsEnabled}
            durationMs={hapticsDurationMs}
        />
    );
}

export default HapticLottie;
