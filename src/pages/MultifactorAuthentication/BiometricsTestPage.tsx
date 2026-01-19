import React, {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

const LOADING_DELAY_MS = 400;

function MultifactorAuthenticationBiometricsTestPage() {
    useEffect(() => {
        // Show a short loading state so the RHP transition feels smooth, then move to the magic code flow
        const timeoutId = setTimeout(() => Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE), LOADING_DELAY_MS);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <ScreenWrapper testID={MultifactorAuthenticationBiometricsTestPage.displayName}>
            <FullScreenLoadingIndicator />
        </ScreenWrapper>
    );
}

MultifactorAuthenticationBiometricsTestPage.displayName = 'MultifactorAuthenticationBiometricsTestPage';

export default MultifactorAuthenticationBiometricsTestPage;
