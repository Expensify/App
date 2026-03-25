import type {StyleProp, ViewStyle} from 'react-native';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type {SectionProps} from '@components/Section';
import Accessibility from '@libs/Accessibility';
import {useMemoizedLazyIllustrations} from './useLazyAsset';

/** Returns a static SVG when reduced motion is enabled, or a Lottie animation otherwise. */
function useSectionIllustrationWithMotion(
    animationSource: DotLottieAnimation,
    illustrationKey: IllustrationName,
    staticIllustrationStyle?: StyleProp<ViewStyle>,
    animationIllustrationStyle?: StyleProp<ViewStyle>,
): Pick<SectionProps, 'illustration' | 'illustrationStyle'> {
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations([illustrationKey] as const);

    if (isReduceMotionEnabled) {
        return {
            illustration: illustrations[illustrationKey],
            illustrationStyle: staticIllustrationStyle,
        };
    }

    return {
        illustration: animationSource,
        illustrationStyle: animationIllustrationStyle,
    };
}

export default useSectionIllustrationWithMotion;
