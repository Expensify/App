import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Welcome from '@libs/actions/Welcome';
import variables from '@styles/variables';
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
    const theme = useTheme();

    return (
        <FeatureTrainingModal
            title={translate('migratedUserWelcomeModal.title')}
            description={translate('migratedUserWelcomeModal.subtitle')}
            confirmText={translate('migratedUserWelcomeModal.confirmText')}
            animation={LottieAnimations.WorkspacePlanet}
            onClose={() => {
                Welcome.dismissProductTrainingElement('nudgeMigrationWelcomeModal');
            }}
            shouldRenderAnimation
            animationStyle={[styles.emptyWorkspaceIllustrationStyle]}
            animationContainerStyle={[
                StyleUtils.getBackgroundColorStyle(LottieAnimations.WorkspacePlanet.backgroundColor ?? theme.appBG),
                StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusLarge),
                styles.pv4,
            ]}
        >
            <View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.rowGap4, styles.pt4, styles.pl1]}>
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
                            numberOfLinesTitle={0}
                        />
                    </View>
                ))}
            </View>
        </FeatureTrainingModal>
    );
}

OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';
export default OnboardingWelcomeVideo;
