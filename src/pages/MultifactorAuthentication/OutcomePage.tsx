import React from 'react';
import {DefaultClientFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import {useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import type {ErrorState} from '@components/MultifactorAuthentication/Context/State';

/** Server failure screen generally represents "unknown error" so also show when status is unknown (e.g. network/parse error). */
function isServerError(error: ErrorState): boolean {
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
