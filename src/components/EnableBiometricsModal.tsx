import React from 'react';
import useSingleExecution from '@hooks/useSingleExecution';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type EnableBiometricsVerificationProps = {
    /** Soft prompt visibility */
    isVisible: boolean;
};

function EnableBiometricsModal({isVisible}: EnableBiometricsVerificationProps) {
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
    const navigateToFallbackPage = singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.ENABLE_BIOMETRICS_FALLBACK)));

    if (isVisible) {
        navigateToFallbackPage();
    }

    return (
        <>
        </>
    );
}

EnableBiometricsModal.displayName = 'EnableBiometricsModal';

export default EnableBiometricsModal;
