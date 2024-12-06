import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Welcome from '@libs/actions/Welcome';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {FeatureListItem} from './FeatureList';
import FeatureTrainingModal from './FeatureTrainingModal';
import * as Illustrations from './Icon/Illustrations';
import LottieAnimations from './LottieAnimations';
import MenuItem from './MenuItem';

const ExpensifyFeatures: FeatureListItem[] = [
    {
        icon: Illustrations.ChatBubbles,
        translationKey: 'migratedUserWelcomeModal.features.chat',
    },
    {
        icon: Illustrations.Flash,
        translationKey: 'migratedUserWelcomeModal.features.scanReceipt',
    },
    {
        icon: Illustrations.ExpensifyMobileApp,
        translationKey: 'migratedUserWelcomeModal.features.crossPlatform',
    },
];

function OnboardingWelcomeVideo() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <FeatureTrainingModal
            // We would like to show the Lottie animation instead of a video
            videoURL=""
            title={translate('migratedUserWelcomeModal.title')}
            description={translate('migratedUserWelcomeModal.subtitle')}
            confirmText={translate('migratedUserWelcomeModal.confirmText')}
            animation={LottieAnimations.WorkspacePlanet}
            onClose={() => {
                Welcome.dismissProductTraining(CONST.MIGRTED_USER_WELCOME_MODAL);
            }}
            animationStyle={[styles.emptyWorkspaceIllustrationStyle]}
            animationInnerContainerStyle={[StyleUtils.getBackgroundColorStyle(LottieAnimations.WorkspacePlanet.backgroundColor), styles.cardSectionIllustration]}
            animationOuterContainerStyle={styles.p0}
            contentContainerStyles={[styles.mb5, styles.gap2]}
            modalInnerContainerStyle={styles.pt0}
        >
            <View style={[styles.gap3, styles.pt1, styles.pl1]}>
                {ExpensifyFeatures.map(({translationKey, icon}) => (
                    <View
                        key={translationKey}
                        style={styles.w100}
                    >
                        <MenuItem
                            title={translate(translationKey)}
                            shouldRenderAsHTML
                            icon={icon}
                            iconWidth={variables.menuIconSize}
                            iconHeight={variables.menuIconSize}
                            interactive={false}
                            displayInDefaultIconColor
                            wrapperStyle={[styles.p0, styles.cursorAuto]}
                            containerStyle={[styles.m0, styles.wAuto]}
                            titleContainerStyle={styles.ml6}
                        />
                    </View>
                ))}
            </View>
        </FeatureTrainingModal>
    );
}

OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';
export default OnboardingWelcomeVideo;
