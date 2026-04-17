import React from 'react';
import {DefaultClientFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import {useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import type {ErrorState} from '@components/MultifactorAuthentication/Context/State';
import type {MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';
import CONST from '@src/CONST';

/**
 * Server failure screen generally represents "unknown error" so also show when status is unknown (e.g. network/parse error).
 * TODO: This is a temporary solution until proper error handling is implemented (https://github.com/Expensify/App/issues/83036).
 */
function isServerError(error: ErrorState): boolean {
    const routineDeviceFailures: MultifactorAuthenticationReason[] = [CONST.MULTIFACTOR_AUTHENTICATION.REASON.HSM.CANCELED, CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.CANCELED];
    if (routineDeviceFailures.includes(error.reason)) {
        return false;
    }
    return error.httpStatusCode === undefined || error.httpStatusCode >= 500;
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

    if (isServerError(error)) {
        return scenario.defaultServerFailureScreen;
    }

    return scenario.defaultClientFailureScreen;
}

MultifactorAuthenticationOutcomePage.displayName = 'MultifactorAuthenticationOutcomePage';

export default MultifactorAuthenticationOutcomePage;
