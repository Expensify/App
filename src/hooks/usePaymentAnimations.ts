import {useCallback, useState} from 'react';
import HapticFeedback from '@libs/HapticFeedback';

function usePaymentAnimations() {
    const [isPaidAnimationRunning, setIsPaidAnimationRunning] = useState(false);
    const [isApprovedAnimationRunning, setIsApprovedAnimationRunning] = useState(false);
    const [isSubmittingAnimationRunning, setIsSubmittingAnimationRunning] = useState(false);

    const stopAnimation = useCallback(() => {
        setIsPaidAnimationRunning(false);
        setIsApprovedAnimationRunning(false);
        setIsSubmittingAnimationRunning(false);
    }, []);

    const startAnimation = useCallback(() => {
        setIsPaidAnimationRunning(true);
        HapticFeedback.longPress();
    }, []);

    const startApprovedAnimation = useCallback(() => {
        setIsApprovedAnimationRunning(true);
        HapticFeedback.longPress();
    }, []);

    const startSubmittingAnimation = useCallback(() => {
        setIsSubmittingAnimationRunning(true);
        HapticFeedback.longPress();
    }, []);

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
