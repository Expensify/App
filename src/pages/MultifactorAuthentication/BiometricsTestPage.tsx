import React, {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import CONST from '@src/CONST';

const LOADING_DELAY_MS = 400;

function MultifactorAuthenticationBiometricsTestPage() {
    const {proceed} = useMultifactorAuthenticationContext();

    useEffect(() => {
        // Show a short loading state so the RHP transition feels smooth, then move to the magic code flow
        const timeoutId = setTimeout(() => {
            proceed(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);
        }, LOADING_DELAY_MS);

        return () => clearTimeout(timeoutId);
    }, [proceed]);

    return (
        <ScreenWrapper testID={MultifactorAuthenticationBiometricsTestPage.displayName}>
            <FullScreenLoadingIndicator />
        </ScreenWrapper>
    );
}

MultifactorAuthenticationBiometricsTestPage.displayName = 'MultifactorAuthenticationBiometricsTestPage';

export default MultifactorAuthenticationBiometricsTestPage;
