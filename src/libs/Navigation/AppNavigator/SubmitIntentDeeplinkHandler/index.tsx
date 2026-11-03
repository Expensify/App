import useOnboardingDeeplinkIntent from '@hooks/useOnboardingDeeplinkIntent';

import CONST from '@src/CONST';

import React from 'react';

import ApplySubmitOnboardingIntent from './ApplySubmitOnboardingIntent';

/**
 * Recognizes the `intent=submit` onboarding deeplink and hands off to the component that acts on it.
 */
function SubmitIntentDeeplinkHandler() {
    const onboardingDeeplinkIntent = useOnboardingDeeplinkIntent();

    if (onboardingDeeplinkIntent !== CONST.ONBOARDING_INTENTS.SUBMIT) {
        return null;
    }

    return <ApplySubmitOnboardingIntent />;
}

export default SubmitIntentDeeplinkHandler;
