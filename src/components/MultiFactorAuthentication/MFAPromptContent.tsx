import React, {memo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
// import type DotLottieAnimation from '@components/LottieAnimations/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Illustrations from '@src/components/Icon/Illustrations';
import type {TranslationPaths} from '@src/languages/types';

type MFAPromptContentProps = {
    // animation: DotLottieAnimation;
    title: TranslationPaths;
    subtitle: TranslationPaths;
};

function MFAPromptContent({title, subtitle}: MFAPromptContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.flex1}>
            <BlockingView
                icon={Illustrations.SmartScanMock}
                iconWidth={204}
                iconHeight={204}
                // animation={animation}    // TODO: Bring back the animation instead of mock image
                // animationStyles={styles.emptyLHNAnimation}
                // animationWebStyle={styles.emptyLHNAnimation}
                title={translate(title)}
                titleStyles={styles.mb2}
                subtitle={translate(subtitle)}
                subtitleStyle={styles.textSupporting}
                containerStyle={styles.ph5}
                testID="MFAPromptContent"
            />
        </View>
    );
}

MFAPromptContent.displayName = 'MFAPromptContent';

export default memo(MFAPromptContent);
