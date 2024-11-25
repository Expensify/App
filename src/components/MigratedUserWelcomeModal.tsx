import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {FeatureListItem} from './FeatureList';
import FeatureTrainingModal from './FeatureTrainingModal';
import * as Illustrations from './Icon/Illustrations';
import MenuItem from './MenuItem';

const ExpensifyFeatures: FeatureListItem[] = [
    {
        icon: Illustrations.MoneyReceipts,
        translationKey: 'workspace.emptyWorkspace.features.trackAndCollect',
    },
    {
        icon: Illustrations.CreditCardsNew,
        translationKey: 'workspace.emptyWorkspace.features.companyCards',
    },
    {
        icon: Illustrations.MoneyWings,
        translationKey: 'workspace.emptyWorkspace.features.reimbursements',
    },
];

function OnboardingWelcomeVideo() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <FeatureTrainingModal
            title={translate('onboarding.welcomeVideo.title')}
            description={translate('onboarding.welcomeVideo.description')}
            confirmText={translate('onboarding.getStarted')}
            videoURL={CONST.WELCOME_VIDEO_URL}
        >
            <View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.rowGap4, styles.pv4, styles.pl1]}>
                {ExpensifyFeatures.map(({translationKey, icon}) => (
                    <View
                        key={translationKey}
                        style={styles.w100}
                    >
                        <MenuItem
                            title={translate(translationKey)}
                            icon={icon}
                            iconWidth={variables.menuIconSize}
                            iconHeight={variables.menuIconSize}
                            interactive={false}
                            displayInDefaultIconColor
                            wrapperStyle={[styles.p0, styles.cursorAuto]}
                            containerStyle={[styles.m0, styles.wAuto]}
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
