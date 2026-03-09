import React from 'react';
import {View} from 'react-native';
import Lottie from '@components/Lottie';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

type MultifactorAuthenticationPromptContentProps = {
    animation: DotLottieAnimation;
    title: TranslationPaths;
    subtitle?: TranslationPaths;
};

function MultifactorAuthenticationPromptContent({title, subtitle, animation}: MultifactorAuthenticationPromptContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View
            style={[styles.flex1, styles.alignItemsCenter, styles.ph5]}
            testID="MultifactorAuthenticationPromptContent"
        >
            <View style={[styles.flex1, styles.justifyContentEnd]}>
                <Lottie
                    source={animation}
                    loop
                    autoPlay
                    style={styles.mfaBlockingViewAnimation}
                    webStyle={styles.mfaBlockingViewAnimation}
                />
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
