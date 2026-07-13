import {DefaultClientFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import {useMultifactorAuthenticationInternal} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationInternalApiContext';

import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationModalNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import React from 'react';

type OutcomeRouteName = typeof SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS | typeof SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_FAILURE;
type MultifactorAuthenticationOutcomePageProps = PlatformStackScreenProps<MultifactorAuthenticationModalNavigatorParamList, OutcomeRouteName>;

const SERVER_FAILURE_REASONS = new Set<string>([
    ...Object.values(CONST.MULTIFACTOR_AUTHENTICATION.REASON.SERVER_ERRORS),
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE,
]);

function shouldShowServerFailureScreen(error: MFAError): boolean {
    return SERVER_FAILURE_REASONS.has(error.reason);
}

function MultifactorAuthenticationOutcomePage({route}: MultifactorAuthenticationOutcomePageProps) {
    const {state} = useMultifactorAuthenticationInternal();
    const {scenario, error} = state;

    if (!scenario) {
        return <DefaultClientFailureScreen />;
    }

    // The route reflects the outcome the machine navigated to. The success screen therefore renders
    // only on the success route, and the failure route falls back to the default client failure
    // screen even when no error was stored.
    if (route.name === SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS && !error) {
        return scenario.successScreen;
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

MultifactorAuthenticationOutcomePage.displayName = 'MultifactorAuthenticationOutcomePage';

export default MultifactorAuthenticationOutcomePage;
