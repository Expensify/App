import {useInitialURLState} from '@components/InitialURLContextProvider';

import getOnboardingIntentFromUrl from '@libs/getOnboardingIntentFromUrl';
import getCurrentUrl from '@libs/Navigation/currentUrl';

import CONST from '@src/CONST';

import React, {useState} from 'react';

import ApplySubmitOnboardingIntent from './ApplySubmitOnboardingIntent';

/**
 * Recognises the `intent=submit` onboarding deeplink and hands off to the component that acts on it.
 *
 * Both deeplink sources have to be read, and the browser one has to be frozen at mount: on web the URL is rewritten
 * as soon as the app navigates away from the handoff route, while on native it is empty and the initial URL instead
 * resolves asynchronously after this component mounts.
 */
function SubmitIntentDeeplinkHandler() {
    const {initialURL} = useInitialURLState();
    const [urlAtMount] = useState(getCurrentUrl);

    const hasSubmitIntent = getOnboardingIntentFromUrl(urlAtMount) === CONST.ONBOARDING_INTENTS.SUBMIT || getOnboardingIntentFromUrl(initialURL) === CONST.ONBOARDING_INTENTS.SUBMIT;

    if (!hasSubmitIntent) {
        return null;
    }

    return <ApplySubmitOnboardingIntent />;
}

export default SubmitIntentDeeplinkHandler;
