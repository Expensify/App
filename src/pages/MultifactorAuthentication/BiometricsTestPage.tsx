import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Account} from '@src/types/onyx';

const LOADING_DELAY_MS = 400;

function getHasBiometricsRegistered(data: OnyxEntry<Account>) {
    return data?.multifactorAuthenticationPublicKeyIDs && data.multifactorAuthenticationPublicKeyIDs.length > 0;
}

function MultifactorAuthenticationBiometricsTestPage() {
    const {executeScenario} = useMultifactorAuthentication();
    const [hasBiometricsRegistered = false] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true, selector: getHasBiometricsRegistered});

    useEffect(() => {
        if (hasBiometricsRegistered) {
            return;
        }

        // Show a short loading state so the RHP transition feels smooth, then move to the magic code flow
        const timeoutId = setTimeout(() => {
            executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);
        }, LOADING_DELAY_MS);

        return () => clearTimeout(timeoutId);
        // This should only fire once - on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!hasBiometricsRegistered || Navigation.isActiveRoute(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics'))) {
            return;
        }

        Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics', CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST));
    }, [hasBiometricsRegistered]);

    return (
        <ScreenWrapper testID={MultifactorAuthenticationBiometricsTestPage.displayName}>
            <FullScreenLoadingIndicator />
        </ScreenWrapper>
    );
}

MultifactorAuthenticationBiometricsTestPage.displayName = 'MultifactorAuthenticationBiometricsTestPage';

export default MultifactorAuthenticationBiometricsTestPage;
