import {useCallback, useState} from 'react';
import HapticFeedback from '@libs/HapticFeedback';

function usePaymentAnimations() {
    const [isPaidAnimationRunning, setIsPaidAnimationRunning] = useState(false);
    const [isApprovedAnimationRunning, setIsApprovedAnimationRunning] = useState(false);

    const stopAnimation = useCallback(() => {
        setIsPaidAnimationRunning(false);
        setIsApprovedAnimationRunning(false);
    }, []);

    const startAnimation = useCallback(() => {
        setIsPaidAnimationRunning(true);
        HapticFeedback.longPress();
    }, []);

    const startApprovedAnimation = useCallback(() => {
        setIsApprovedAnimationRunning(true);
        HapticFeedback.longPress();
    }, []);

    return {
        isPaidAnimationRunning,
        isApprovedAnimationRunning,
        stopAnimation,
        startAnimation,
        startApprovedAnimation,
    };
}

export default usePaymentAnimations;
