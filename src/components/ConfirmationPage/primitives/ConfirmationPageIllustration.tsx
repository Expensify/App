import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import isIllustrationLottieAnimation from '@libs/isIllustrationLottieAnimation';

import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

import {View} from 'react-native';

type ConfirmationPageIllustrationProps = {
    illustration?: DotLottieAnimation | IconAsset;
    illustrationStyle?: StyleProp<ViewStyle>;
};

function ConfirmationPageIllustration({illustration = LottieAnimations.Fireworks, illustrationStyle}: ConfirmationPageIllustrationProps) {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Fireworks']);
    const isLottie = isIllustrationLottieAnimation(illustration);

    if (isReduceMotionEnabled && illustration === LottieAnimations.Fireworks) {
        return (
            <View style={[styles.confirmationAnimation, illustrationStyle]}>
                <ImageSVG
                    src={illustrations.Fireworks}
                    contentFit="contain"
                />
            </View>
        );
    }
    if (isLottie) {
        return (
            <Lottie
                source={illustration}
                autoPlay
                loop
                style={[styles.confirmationAnimation, illustrationStyle]}
                webStyle={{
                    width: (StyleSheet.flatten(illustrationStyle)?.width as number) ?? styles.confirmationAnimation.width,
                    height: (StyleSheet.flatten(illustrationStyle)?.height as number) ?? styles.confirmationAnimation.height,
                }}
            />
        );
    }
    return (
        <View style={[styles.confirmationAnimation, illustrationStyle]}>
            <ImageSVG
                src={illustration}
                contentFit="contain"
            />
        </View>
    );
}

export default ConfirmationPageIllustration;
