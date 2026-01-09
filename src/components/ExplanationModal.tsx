import React from 'react';
import useLocalize from '@hooks/useLocalize';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import FeatureTrainingModal from './FeatureTrainingModal';

function ExplanationModal() {
    const {translate} = useLocalize();

    return (
        <FeatureTrainingModal
            title={translate('onboarding.explanationModal.title')}
            description={translate('onboarding.explanationModal.description')}
            secondaryDescription={translate('onboarding.explanationModal.secondaryDescription')}
            confirmText={translate('footer.getStarted')}
            videoURL={CONST.WELCOME_VIDEO_URL}
            onClose={Welcome.completeHybridAppOnboarding}
        />
    );
}

export default ExplanationModal;
