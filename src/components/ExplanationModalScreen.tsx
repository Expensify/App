import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {completeHybridAppOnboarding} from '@userActions/Welcome';
import CONST from '@src/CONST';
import FeatureTrainingContent from './FeatureTrainingContent';
import ScreenWrapper from './ScreenWrapper';

function ExplanationModalScreen() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleClose = () => {
        completeHybridAppOnboarding();
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            testID="ExplanationModal"
            style={styles.flex1}
            includePaddingTop={false}
        >
            <FeatureTrainingContent
                title={translate('onboarding.explanationModal.title')}
                description={translate('onboarding.explanationModal.description')}
                secondaryDescription={translate('onboarding.explanationModal.secondaryDescription')}
                confirmText={translate('footer.getStarted')}
                videoURL={CONST.WELCOME_VIDEO_URL}
                onClose={handleClose}
            />
        </ScreenWrapper>
    );
}

export default ExplanationModalScreen;
