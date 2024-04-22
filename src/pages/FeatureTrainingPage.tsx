import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {FeatureTrainingNavigatorParamList} from '@libs/Navigation/types';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type FeatureTrainingPageProps = StackScreenProps<FeatureTrainingNavigatorParamList, typeof SCREENS.FEATURE_TRAINING_ROOT>;

function FeatureTrainingPage({
    route: {
        params: {contentType},
    },
}: FeatureTrainingPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    const renderIllustration = useCallback(() => {
        switch (contentType) {
            case CONST.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE:
                return (
                    <View style={[styles.flex1, styles.alignItemsCenter]}>
                        <Lottie
                            source={LottieAnimations.Hands}
                            style={styles.h100}
                            webStyle={isSmallScreenWidth ? styles.h100 : undefined}
                            autoPlay
                            loop
                        />
                    </View>
                );
        }
    }, [contentType, isSmallScreenWidth, styles.alignItemsCenter, styles.flex1, styles.h100]);

    const onHelp = useCallback(() => {
        Link.openExternalLink(CONST.FEATURE_TRAINING[contentType]?.LEARN_MORE_LINK);
    }, [contentType]);

    const onConfirm = useCallback(() => {}, []);

    if (!Object.values(CONST.FEATURE_TRAINING.CONTENT_TYPES).includes(contentType)) {
        return (
            <ScreenWrapper testID={FeatureTrainingPage.displayName}>
                <FullPageNotFoundView
                    shouldShow
                    linkKey="contacts.goBackContactMethods"
                />
            </ScreenWrapper>
        );
    }

    return (
        <FeatureTrainingModal
            shouldShowDismissModalOption
            confirmText={translate('common.buttonConfirm')}
            onConfirm={onConfirm}
            helpText={translate('common.learnMore')}
            onHelp={onHelp}
            renderIllustration={renderIllustration}
        />
    );
}

FeatureTrainingPage.displayName = 'FeatureTrainingPage';

export default FeatureTrainingPage;
