import {useInitialURLState} from '@components/InitialURLContextProvider';

import getOnboardingIntentFromUrl from '@libs/getOnboardingIntentFromUrl';
import getCurrentUrl from '@libs/Navigation/currentUrl';

import type {OnboardingIntent} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useState} from 'react';

import useOnyx from './useOnyx';

/**
 * Resolves the onboarding outcome requested by the deeplink this session was opened with, e.g. `onboarding?intent=submit`.
 *
 * All three sources are needed. The stored copy is the durable one but is written asynchronously, so it is absent
 * during the first render, which is exactly when the onboarding navigator picks its entry step. The browser URL covers
 * that first render but is rewritten as soon as the flow navigates, hence the mount-time latch. The initial URL is the
 * only source on native, where the browser URL is empty and the deeplink resolves asynchronously.
 */
function useOnboardingDeeplinkIntent(): OnboardingIntent | undefined {
    const {initialURL} = useInitialURLState();
    const [urlAtMount] = useState(getCurrentUrl);
    const [storedIntent] = useOnyx(ONYXKEYS.ONBOARDING_DEEPLINK_INTENT);

    return storedIntent ?? getOnboardingIntentFromUrl(urlAtMount) ?? getOnboardingIntentFromUrl(initialURL);
}

export default useOnboardingDeeplinkIntent;
