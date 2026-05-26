import React from 'react';
import {DefaultClientFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import {useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import CONST from '@src/CONST';

const SERVER_FAILURE_REASONS = new Set<string>([
    ...Object.values(CONST.MULTIFACTOR_AUTHENTICATION.REASON.SERVER_ERRORS),
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE,
]);

function shouldShowServerFailureScreen(error: MFAError): boolean {
    return SERVER_FAILURE_REASONS.has(error.reason);
}

function MultifactorAuthenticationOutcomePage() {
    const {scenario, error} = useMultifactorAuthenticationState();

    if (!scenario) {
        return <DefaultClientFailureScreen />;
    }

    if (!error) {
        return scenario.successScreen;
    }

    const reasonScreen = scenario.failureScreens?.[error.reason];
    if (reasonScreen) {
        return reasonScreen;
    }

    if (shouldShowServerFailureScreen(error)) {
        return scenario.defaultServerFailureScreen;
    }

    return scenario.defaultClientFailureScreen;
}

MultifactorAuthenticationOutcomePage.displayName = 'MultifactorAuthenticationOutcomePage';

export default MultifactorAuthenticationOutcomePage;
