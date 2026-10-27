import useAutoCreateSubmitWorkspace from '@hooks/useAutoCreateSubmitWorkspace';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {shouldMarkSubmitPlanWelcomeModalShown} from '@libs/Navigation/guards/SubmitPlanWelcomeModalGuard';
import Navigation from '@libs/Navigation/Navigation';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import {setSubmitMigrationModalShown} from '@userActions/User';

import type {TranslationPaths} from '@src/languages/types';

import React from 'react';
import {View} from 'react-native';

import CenteredModalLayout from './CenteredModalLayout';
import FeatureTraining from './FeatureTraining';
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

    useBeforeRemove(() => {
        // The guard closes the modal when the workspace whose deletion opened it is restored. The user didn't
        // dismiss it, so leave it unmarked and let it show again if that workspace is later deleted.
        if (!shouldMarkSubmitPlanWelcomeModalShown()) {
            return;
        }
        setSubmitMigrationModalShown();
    });

    const handleClose = () => Navigation.goBack();

    const handleConfirm = () => {
        autoCreateSubmitWorkspace(firstName ?? '', lastName ?? '', false);
    };

    return (
        <CenteredModalLayout
            onBackdropPress={handleClose}
            contentStyle={[styles.pt0, styles.pb0]}
            addBottomSafeAreaPadding={false}
        >
            <FeatureTraining
                onConfirm={handleConfirm}
                onClose={handleClose}
                shouldUseScrollView
            >
                <FeatureTraining.Illustration
                    image={illustrations.ReceiptWranglerSpaceCowgirl}
                    contentFitImage="contain"
                    aspectRatio={variables.submitPlanWelcomeModalIllustrationAspectRatio}
                    innerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, styles.p5, StyleUtils.getBackgroundColorStyle(colors.yellow400)]}
                    outerContainerStyle={styles.p0}
                />
                <FeatureTraining.Body style={!shouldUseNarrowLayout && [styles.mt8, styles.mh8]}>
                    <FeatureTraining.BodyText style={styles.mb5}>
                        <FeatureTraining.Title style={shouldUseNarrowLayout && styles.mb1}>{translate('submitPlanWelcomeModal.title')}</FeatureTraining.Title>
                        <FeatureTraining.Description>{translate('submitPlanWelcomeModal.description')}</FeatureTraining.Description>
                        <View style={[styles.gap2, styles.mt3]}>
                            {FEATURE_TRANSLATION_KEYS.map((translationKey) => (
                                <View
                                    key={translationKey}
                                    style={[styles.flexRow, styles.alignItemsStart]}
                                >
                                    <Text style={styles.textSupporting}>{'•  '}</Text>
                                    <Text style={[styles.textSupporting, styles.flex1]}>{translate(translationKey)}</Text>
                                </View>
                            ))}
                        </View>
                    </FeatureTraining.BodyText>
                    <FeatureTraining.HelpButton onPress={handleClose}>{translate('submitPlanWelcomeModal.dismissText')}</FeatureTraining.HelpButton>
                    <FeatureTraining.ConfirmButton>{translate('submitPlanWelcomeModal.confirmText')}</FeatureTraining.ConfirmButton>
                </FeatureTraining.Body>
            </FeatureTraining>
        </CenteredModalLayout>
    );
}

export default SubmitPlanWelcomeModal;
