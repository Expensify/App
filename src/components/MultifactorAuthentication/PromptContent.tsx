import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
// import type DotLottieAnimation from '@components/LottieAnimations/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

type MultifactorAuthenticationPromptContentProps = {
    // animation: DotLottieAnimation;
    title: TranslationPaths;
    subtitle: TranslationPaths;
};

function MultifactorAuthenticationPromptContent({title, subtitle}: MultifactorAuthenticationPromptContentProps) {
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['SmartScanStatic'] as const);
    const {translate} = useLocalize();

    return (
        <View style={styles.flex1}>
            <BlockingView
                icon={illustrations.SmartScanStatic}
                iconWidth={204}
                iconHeight={204}
                // animation={animation}    // TODO: MFA/Release Bring back the animation instead of the mock image
                // animationStyles={styles.emptyLHNAnimation}
                // animationWebStyle={styles.emptyLHNAnimation}
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
