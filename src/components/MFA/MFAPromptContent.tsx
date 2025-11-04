import React, {memo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {DotLottieAnimation} from '@components/LottieAnimations/types';
import type {TranslationPaths} from '@src/languages/types';

type MFAPromptContentProps = {
    animation: DotLottieAnimation;
    title: TranslationPaths;
    subtitle: TranslationPaths;
};

function MFAPromptContent({animation, title, subtitle}: MFAPromptContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.flex1}>
            <BlockingView
                animation={animation}
                animationStyles={styles.emptyLHNAnimation}
                animationWebStyle={styles.emptyLHNAnimation}
                title={translate(title)}
                subtitle={translate(subtitle)}
                subtitleStyle={styles.textSupporting}
                containerStyle={styles.p0}
                testID="MFAPromptContent"
            />
        </View>
    );
}

MFAPromptContent.displayName = 'MFAPromptContent';

export default memo(MFAPromptContent);

