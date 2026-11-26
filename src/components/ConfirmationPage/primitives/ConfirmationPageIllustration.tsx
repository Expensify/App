import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import isIllustrationLottieAnimation from '@libs/isIllustrationLottieAnimation';

import type IconAsset from '@src/types/utils/IconAsset';

import type LottieView from 'lottie-react-native';
import type {ComponentRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import {useRef} from 'react';
import {StyleSheet, View} from 'react-native';

type ConfirmationPageIllustrationProps = {
    illustration?: DotLottieAnimation | IconAsset;
    illustrationStyle?: StyleProp<ViewStyle>;

    /** The frame a Lottie illustration starts playing from, to skip a slow opening */
    initialFrame?: number;
};

function ConfirmationPageIllustration({illustration = LottieAnimations.Fireworks, illustrationStyle, initialFrame}: ConfirmationPageIllustrationProps) {
    const styles = useThemeStyles();
    const animationRef = useRef<ComponentRef<typeof LottieView> | null>(null);
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Fireworks']);
    const isLottie = isIllustrationLottieAnimation(illustration);
    const flattenedIllustrationStyle = StyleSheet.flatten(illustrationStyle);
    const flattenedIllustrationWidth = flattenedIllustrationStyle?.width;
    const flattenedIllustrationHeight = flattenedIllustrationStyle?.height;
    const webIllustrationWidth =
        typeof flattenedIllustrationWidth === 'string' || typeof flattenedIllustrationWidth === 'number' ? flattenedIllustrationWidth : styles.confirmationAnimation.width;
    const webIllustrationHeight =
        typeof flattenedIllustrationHeight === 'string' || typeof flattenedIllustrationHeight === 'number' ? flattenedIllustrationHeight : styles.confirmationAnimation.height;

    if (isReduceMotionEnabled && illustration === LottieAnimations.Fireworks) {
        return (
            <View style={[styles.confirmationAnimation, illustrationStyle]}>
                <ImageSVG
                    src={illustrations.Fireworks}
                    contentFit="contain"
                    aria-hidden
                />
            </View>
        );
    }

    if (isLottie) {
        return (
            <Lottie
                ref={animationRef}
                source={illustration}
                autoPlay={initialFrame === undefined}
                onAnimationLoaded={initialFrame === undefined || isReduceMotionEnabled ? undefined : () => animationRef.current?.play(initialFrame)}
                loop
                style={[styles.confirmationAnimation, illustrationStyle]}
                webStyle={{
                    width: webIllustrationWidth,
                    height: webIllustrationHeight,
                }}
            />
        );
    }

    return (
        <View style={[styles.confirmationAnimation, illustrationStyle]}>
            <ImageSVG
                src={illustration}
                contentFit="contain"
                aria-hidden
            />
        </View>
    );
}

export default ConfirmationPageIllustration;
