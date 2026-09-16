import LottieView from 'lottie-react-native';
import React from 'react';

import type HapticLottieProps from './types';

/**
 * Web does not support Haptic feedback, so the haptic props are dropped and the animation plays on its own.
 */
function HapticLottie({haptics, hapticsDurationMs, hapticsEnabled, ...props}: HapticLottieProps) {
    return <LottieView {...props} />;
}

export default HapticLottie;
