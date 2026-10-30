import HapticFeedback from '@libs/HapticFeedback';

import {useState} from 'react';

function usePaymentAnimations() {
    const [isPaidAnimationRunning, setIsPaidAnimationRunning] = useState(false);
    const [isApprovedAnimationRunning, setIsApprovedAnimationRunning] = useState(false);
    const [isSubmittingAnimationRunning, setIsSubmittingAnimationRunning] = useState(false);

    const stopAnimation = () => {
        setIsPaidAnimationRunning(false);
        setIsApprovedAnimationRunning(false);
        setIsSubmittingAnimationRunning(false);
    };

    const startAnimation = () => {
        setIsPaidAnimationRunning(true);
        HapticFeedback.longPress();
    };

    const startApprovedAnimation = () => {
        setIsApprovedAnimationRunning(true);
        HapticFeedback.longPress();
    };

    const startSubmittingAnimation = () => {
        setIsSubmittingAnimationRunning(true);
        HapticFeedback.longPress();
    };

    return {
        isPaidAnimationRunning,
        isApprovedAnimationRunning,
        isSubmittingAnimationRunning,
        stopAnimation,
        startAnimation,
        startApprovedAnimation,
        startSubmittingAnimation,
    };
}

export default usePaymentAnimations;
