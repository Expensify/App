import React, {useLayoutEffect} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissProductTraining} from '@libs/actions/Welcome';
import convertToLTR from '@libs/convertToLTR';
import {parseFSAttributes} from '@libs/Fullstory';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {FeatureListItem} from './FeatureList';
import FeatureTrainingModal from './FeatureTrainingModal';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';
import LottieAnimations from './LottieAnimations';
import RenderHTML from './RenderHTML';

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
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    /**
     * Extracts values from the non-scraped attribute WEB_PROP_ATTR at build time
     * to ensure necessary properties are available for further processing.
     * Reevaluates "fs-class" to dynamically apply styles or behavior based on
     * updated attribute values.
     */
    useLayoutEffect(parseFSAttributes, []);

    return (
        <FeatureTrainingModal
            // We would like to show the Lottie animation instead of a video
            videoURL=""
            title={translate('migratedUserWelcomeModal.title')}
            description={translate('migratedUserWelcomeModal.subtitle')}
            confirmText={translate('migratedUserWelcomeModal.confirmText')}
            animation={LottieAnimations.WorkspacePlanet}
            onClose={() => {
                dismissProductTraining(CONST.MIGRATED_USER_WELCOME_MODAL);
            }}
            animationStyle={[styles.emptyWorkspaceIllustrationStyle]}
            illustrationInnerContainerStyle={[StyleUtils.getBackgroundColorStyle(LottieAnimations.WorkspacePlanet.backgroundColor), styles.cardSectionIllustration]}
            illustrationOuterContainerStyle={styles.p0}
            contentInnerContainerStyles={[styles.mb5, styles.gap2]}
            contentOuterContainerStyles={!shouldUseNarrowLayout && [styles.mt8, styles.mh8]}
            modalInnerContainerStyle={{...styles.pt0, ...(shouldUseNarrowLayout ? {} : styles.pb8)}}
        >
            <View
                style={[styles.gap3, styles.pt1, styles.pl1]}
                fsClass={CONST.FULL_STORY.UNMASK}
                testID={CONST.FULL_STORY.UNMASK}
            >
                {ExpensifyFeatures.map(({translationKey, icon}) => (
                    <View
                        key={translationKey}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.wAuto]}
                    >
                        <Icon
                            src={icon}
                            height={variables.menuIconSize}
                            width={variables.menuIconSize}
                        />
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.wAuto, styles.flex1, styles.ml6]}>
                            <RenderHTML html={`<comment>${convertToLTR(translate(translationKey))}</comment>`} />
                        </View>
                    </View>
                ))}
            </View>
        </FeatureTrainingModal>
    );
}

OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';
export default OnboardingWelcomeVideo;
