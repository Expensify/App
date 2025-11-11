import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import DecisionModal from './DecisionModal';

type ProactiveAppReviewModalProps = {
    /** Whether modal is visible */
    isVisible: boolean;

    /** Callback for when user selects "Yeah!" */
    onPositive: () => void;

    /** Callback for when user selects "Not really." */
    onNegative: () => void;

    /** Callback for closing/skipping modal */
    onSkip: () => void;
};

function ProactiveAppReviewModal({isVisible, onPositive, onNegative, onSkip}: ProactiveAppReviewModalProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <DecisionModal
            title="Enjoying New Expensify?"
            prompt="Let us know so we can help make your expensing experience even better."
            firstOptionText="Yeah!"
            secondOptionText="Not really."
            onFirstOptionSubmit={onPositive}
            onSecondOptionSubmit={onNegative}
            isSmallScreenWidth={shouldUseNarrowLayout}
            onClose={onSkip}
            isVisible={isVisible}
        />
    );
}

ProactiveAppReviewModal.displayName = 'ProactiveAppReviewModal';

export default ProactiveAppReviewModal;

