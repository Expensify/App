import React from 'react';
import {DefaultClientFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import {useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import type {ErrorState} from '@components/MultifactorAuthentication/Context/State';
import CONST from '@src/CONST';

/** Server failure screen generally represents "unknown error" so also show when status is unknown (e.g. network/parse error). */
function isServerError(error: ErrorState): boolean {
    return !!error.httpStatusCode && error.httpStatusCode >= 500;
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

    const isPriorityReason =
        error.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS || error.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNSUPPORTED_DEVICE;

    if (reasonScreen && isPriorityReason) {
        return reasonScreen;
    }

    const defaultScreen = isServerError(error) ? scenario.defaultServerFailureScreen : scenario.defaultClientFailureScreen;

    return defaultScreen ?? reasonScreen;
}

MultifactorAuthenticationOutcomePage.displayName = 'MultifactorAuthenticationOutcomePage';

export default MultifactorAuthenticationOutcomePage;
