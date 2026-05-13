import React from 'react';
import {View} from 'react-native';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

type MultifactorAuthenticationPromptContentProps = {
    illustration: DotLottieAnimation | IconAsset;
    title: TranslationPaths;
    subtitle?: TranslationPaths;
};

function isLottieAnimation(source: DotLottieAnimation | IconAsset): source is DotLottieAnimation {
    return typeof source === 'object' && 'file' in source;
}

function MultifactorAuthenticationPromptContent({title, subtitle, illustration}: MultifactorAuthenticationPromptContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View
            style={[styles.flex1, styles.alignItemsCenter, styles.ph5]}
            testID="MultifactorAuthenticationPromptContent"
        >
            <View style={[styles.flex1, styles.justifyContentEnd]}>
                {isLottieAnimation(illustration) ? (
                    <Lottie
                        source={illustration}
                        loop
                        autoPlay
                        style={styles.mfaBlockingViewAnimation}
                        webStyle={styles.mfaBlockingViewAnimation}
                    />
                ) : (
                    <ImageSVG
                        src={illustration}
                        width={204}
                        height={204}
                    />
                )}
            </View>
            <View style={[styles.flex1, styles.alignItemsCenter, styles.pt5]}>
                <Text style={[styles.notFoundTextHeader, styles.mb2]}>{translate(title)}</Text>
                {!!subtitle && <Text style={[styles.textAlignCenter, styles.textSupporting]}>{translate(subtitle)}</Text>}
            </View>
        </View>
    );
}

MultifactorAuthenticationPromptContent.displayName = 'MultifactorAuthenticationPromptContent';

export default MultifactorAuthenticationPromptContent;
