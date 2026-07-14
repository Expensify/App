import {DefaultClientFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import {useMultifactorAuthenticationInternal} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationInternalApiContext';

import React from 'react';

function MultifactorAuthenticationOutcomeSuccessPage() {
    const {state} = useMultifactorAuthenticationInternal();
    const {scenario} = state;

    if (!scenario) {
        return <DefaultClientFailureScreen />;
    }

    return scenario.successScreen;
}

MultifactorAuthenticationOutcomeSuccessPage.displayName = 'MultifactorAuthenticationOutcomeSuccessPage';

export default MultifactorAuthenticationOutcomeSuccessPage;
