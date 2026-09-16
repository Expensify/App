import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type {SectionProps} from '@components/Section';

import Accessibility from '@libs/Accessibility';

import type {StyleProp, ViewStyle} from 'react-native';
import type {Pattern} from 'react-native-pulsar';

import {useMemoizedLazyIllustrations} from './useLazyAsset';

type AnimationOptions = {
    /** Style applied to the Lottie animation, when it is the one being rendered */
    animationIllustrationStyle?: StyleProp<ViewStyle>;

    /** Haptic pattern to play in sync with the animation, on every loop of it */
    haptics?: Pattern;

    /** Length of one pass of the animation in milliseconds, required alongside `haptics` */
    hapticsDurationMs?: number;
};

/**
 * Returns a static SVG when reduced motion is enabled, or a Lottie animation otherwise. `haptics` is only
 * handed back alongside the animation, so reduced motion silences it too.
 */
function useSectionIllustrationWithMotion(
    animationSource: DotLottieAnimation,
    illustrationKey: IllustrationName,
    staticIllustrationStyle?: StyleProp<ViewStyle>,
    {animationIllustrationStyle, haptics, hapticsDurationMs}: AnimationOptions = {},
): Pick<SectionProps, 'illustration' | 'illustrationStyle' | 'illustrationHaptics' | 'illustrationHapticsDurationMs'> {
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations([illustrationKey]);

    if (isReduceMotionEnabled) {
        return {
            illustration: illustrations[illustrationKey],
            illustrationStyle: staticIllustrationStyle,
        };
    }

    return {
        illustration: animationSource,
        illustrationStyle: animationIllustrationStyle,
        illustrationHaptics: haptics,
        illustrationHapticsDurationMs: hapticsDurationMs,
    };
}

export default useSectionIllustrationWithMotion;
