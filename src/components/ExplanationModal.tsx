import React, {useEffect, useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Welcome from '@userActions/Welcome';
import ROUTES from '@src/ROUTES';
import Text from './Text';
import WelcomeVideoModal from './WelcomeVideoModal';

function ExplanationModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [shouldNavigateToOnboardingPage, setShouldNavigateToOnboardingPage] = useState(false);

    useEffect(() => {
        Welcome.isOnboardingFlowCompleted({
            onNotCompleted: () => {
                setShouldNavigateToOnboardingPage(true);
            },
        });
    }, []);

    const onClose = () => {
        // Small delay purely due to design considerations.
        Navigation.goBack();
        setTimeout(() => {
            if (!shouldNavigateToOnboardingPage) {
                return;
            }
            // Uncomment once Stage 1 Onboarding Flow is ready
            // Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS)
            Navigation.navigate(ROUTES.ONBOARD);
        }, variables.welcomeVideoDelay);
    };

    return (
        <WelcomeVideoModal onClose={onClose}>
            <Text style={[styles.textHeadlineH1, styles.textXXLarge]}>{translate('onboarding.explanationModal.title')}</Text>
            <Text style={styles.textSupporting}>{translate('onboarding.explanationModal.description1')}</Text>
            <Text style={[styles.textSupporting, styles.mt4]}>{translate('onboarding.explanationModal.description2')}</Text>
        </WelcomeVideoModal>
    );
}

ExplanationModal.displayName = 'ExplanationModal';
export default ExplanationModal;
