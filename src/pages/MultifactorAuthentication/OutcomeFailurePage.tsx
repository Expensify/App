import {DefaultClientFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import {useMultifactorAuthenticationInternal} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationInternalApiContext';

import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import React from 'react';

const SERVER_FAILURE_REASONS = new Set<string>([
    ...Object.values(CONST.MULTIFACTOR_AUTHENTICATION.REASON.SERVER_ERRORS),
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE,
]);

function shouldShowServerFailureScreen(error: MFAError): boolean {
    return SERVER_FAILURE_REASONS.has(error.reason);
}

function MultifactorAuthenticationOutcomeFailurePage() {
    const {state} = useMultifactorAuthenticationInternal();
    const {scenario, error} = state;

    if (!scenario) {
        return <DefaultClientFailureScreen />;
    }

    if (!error) {
        return scenario.defaultClientFailureScreen;
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

MultifactorAuthenticationOutcomeFailurePage.displayName = 'MultifactorAuthenticationOutcomeFailurePage';

export default MultifactorAuthenticationOutcomeFailurePage;
