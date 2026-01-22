import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

type MultifactorAuthenticationPromptContentProps = {
    animation: DotLottieAnimation;
    title: TranslationPaths;
    subtitle: TranslationPaths;
};

function MultifactorAuthenticationPromptContent({title, subtitle, animation}: MultifactorAuthenticationPromptContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.flex1}>
            <BlockingView
                animation={animation}
                animationStyles={styles.mfaBlockingViewAnimation}
                animationWebStyle={styles.mfaBlockingViewAnimation}
                title={translate(title)}
                titleStyles={styles.mb2}
                subtitle={translate(subtitle)}
                subtitleStyle={styles.textSupporting}
                containerStyle={styles.ph5}
                testID="MultifactorAuthenticationPromptContent"
            />
        </View>
    );
}

MultifactorAuthenticationPromptContent.displayName = 'MultifactorAuthenticationPromptContent';

export default MultifactorAuthenticationPromptContent;
