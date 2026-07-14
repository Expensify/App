import useAutoCreateSubmitWorkspace from '@hooks/useAutoCreateSubmitWorkspace';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import {setSubmitMigrationModalShown} from '@userActions/User';

import type {TranslationPaths} from '@src/languages/types';

import React from 'react';
import {View} from 'react-native';

import CenteredModalLayout from './CenteredModalLayout';
import FeatureTrainingContent from './FeatureTrainingContent';
import Text from './Text';

const FEATURE_TRANSLATION_KEYS: TranslationPaths[] = [
    'submitPlanWelcomeModal.features.getReimbursed',
    'submitPlanWelcomeModal.features.buildReports',
    'submitPlanWelcomeModal.features.categorize',
    'submitPlanWelcomeModal.features.inviteBoss',
];

function SubmitPlanWelcomeModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['ReceiptWranglerSpaceCowgirl']);
    const {firstName, lastName} = useCurrentUserPersonalDetails();
    const autoCreateSubmitWorkspace = useAutoCreateSubmitWorkspace();

    // Whenever this modal is removed from the navigation stack (confirmed, dismissed, or closed),
    // persist that the user has seen it so it never triggers again.
    useBeforeRemove(() => {
        setSubmitMigrationModalShown();
    });

    const handleClose = () => Navigation.goBack();

    const handleConfirm = () => {
        // The user has already completed onboarding, so we skip CompleteGuidedSetup and just create the
        // Submit workspace. autoCreateSubmitWorkspace then dismisses this modal and navigates to Categories
        // with #admins in the RHP, which triggers the useBeforeRemove persistence above.
        autoCreateSubmitWorkspace(firstName ?? '', lastName ?? '', false);
    };

    return (
        <CenteredModalLayout
            onBackdropPress={handleClose}
            contentStyle={[styles.pt0, styles.pb0]}
        >
            <FeatureTrainingContent
                image={illustrations.ReceiptWranglerSpaceCowgirl}
                contentFitImage="contain"
                illustrationAspectRatio={variables.submitPlanWelcomeModalIllustrationAspectRatio}
                illustrationInnerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, styles.p5, StyleUtils.getBackgroundColorStyle(colors.yellow400)]}
                illustrationOuterContainerStyle={styles.p0}
                title={translate('submitPlanWelcomeModal.title')}
                description={translate('submitPlanWelcomeModal.description')}
                confirmText={translate('submitPlanWelcomeModal.confirmText')}
                helpText={translate('submitPlanWelcomeModal.dismissText')}
                onConfirm={handleConfirm}
                onHelp={handleClose}
                onClose={handleClose}
                shouldCloseOnConfirm={false}
                contentInnerContainerStyles={styles.mb5}
                contentOuterContainerStyles={!shouldUseNarrowLayout && [styles.mt8, styles.mh8]}
                shouldUseScrollView
            >
                <View style={[styles.gap2, styles.mt3]}>
                    {FEATURE_TRANSLATION_KEYS.map((translationKey) => (
                        <View
                            key={translationKey}
                            style={[styles.flexRow, styles.alignItemsStart]}
                        >
                            <Text style={styles.textSupporting}>{'\u2022  '}</Text>
                            <Text style={[styles.textSupporting, styles.flex1]}>{translate(translationKey)}</Text>
                        </View>
                    ))}
                </View>
            </FeatureTrainingContent>
        </CenteredModalLayout>
    );
}

export default SubmitPlanWelcomeModal;
