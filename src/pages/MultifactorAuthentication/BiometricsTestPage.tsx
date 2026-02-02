import React, {useEffect} from 'react';
import {InteractionManager} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {serverHasRegisteredCredentials, useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function MultifactorAuthenticationBiometricsTestPage() {
    const {executeScenario} = useMultifactorAuthentication();
    const [serverHasCredentials = false] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true, selector: serverHasRegisteredCredentials});

    useEffect(() => {
        if (serverHasCredentials) {
            return;
        }

        // The reason for using it, despite it being deprecated: https://github.com/Expensify/App/pull/79473/files#r2745847379
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST));

        // This should only fire once - on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!serverHasCredentials || Navigation.isActiveRoute(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics'))) {
            return;
        }

        Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics', CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST));
    }, [serverHasCredentials]);

    return (
        <ScreenWrapper testID={MultifactorAuthenticationBiometricsTestPage.displayName}>
            <FullScreenLoadingIndicator />
        </ScreenWrapper>
    );
}

MultifactorAuthenticationBiometricsTestPage.displayName = 'MultifactorAuthenticationBiometricsTestPage';

export default MultifactorAuthenticationBiometricsTestPage;
