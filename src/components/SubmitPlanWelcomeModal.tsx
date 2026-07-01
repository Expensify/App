import React from 'react';
import {View} from 'react-native';
import useAutoCreateSubmitWorkspace from '@hooks/useAutoCreateSubmitWorkspace';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissProductTraining} from '@libs/actions/Welcome';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['ReceiptUpload']);
    const {firstName, lastName} = useCurrentUserPersonalDetails();
    const autoCreateSubmitWorkspace = useAutoCreateSubmitWorkspace();

    // Whenever this modal is removed from the navigation stack (confirmed, dismissed, or closed),
    // record the dismissal so it never triggers again.
    useBeforeRemove(() => {
        Log.info('[SubmitPlanWelcomeModal] dismissing submit plan welcome modal');
        dismissProductTraining(CONST.SUBMIT_PLAN_WELCOME_MODAL);
    });

    const handleClose = () => Navigation.goBack();

    const handleConfirm = () => {
        // autoCreateSubmitWorkspace dismisses the modal and navigates to Categories with #admins in the RHP,
        // which removes this screen and triggers the useBeforeRemove dismissal above.
        autoCreateSubmitWorkspace(firstName ?? '', lastName ?? '');
    };

    return (
        <CenteredModalLayout
            onBackdropPress={handleClose}
            contentStyle={[styles.pt0, styles.pb0]}
        >
            <FeatureTrainingContent
                image={illustrations.ReceiptUpload}
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
