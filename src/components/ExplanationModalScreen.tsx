import React, {useRef} from 'react';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {completeHybridAppOnboarding} from '@userActions/Welcome';
import CONST from '@src/CONST';
import CenteredModalLayout from './CenteredModalLayout';
import FeatureTrainingContent from './FeatureTrainingContent';

function ExplanationModalScreen() {
    const {translate} = useLocalize();

    // Mark hybrid-app onboarding complete however this screen is dismissed.
    const hasCompletedOnboarding = useRef(false);
    useBeforeRemove(() => {
        if (hasCompletedOnboarding.current) {
            return;
        }
        hasCompletedOnboarding.current = true;
        completeHybridAppOnboarding();
    });

    const handleClose = () => Navigation.goBack();

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleClose, {shouldBubble: false});

    return (
        <CenteredModalLayout onBackdropPress={handleClose}>
            <FeatureTrainingContent
                title={translate('onboarding.explanationModal.title')}
                description={translate('onboarding.explanationModal.description')}
                secondaryDescription={translate('onboarding.explanationModal.secondaryDescription')}
                confirmText={translate('footer.getStarted')}
                videoURL={CONST.WELCOME_VIDEO_URL}
                onClose={handleClose}
            />
        </CenteredModalLayout>
    );
}

export default ExplanationModalScreen;
