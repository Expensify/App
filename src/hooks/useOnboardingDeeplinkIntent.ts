import {useInitialURLState} from '@components/InitialURLContextProvider';

import getOnboardingIntentFromUrl from '@libs/getOnboardingIntentFromUrl';
import getCurrentUrl from '@libs/Navigation/currentUrl';

import type {OnboardingIntent} from '@src/CONST';

import {useState} from 'react';

/**
 * Resolves the onboarding outcome requested by the deeplink this session was opened with, e.g. `onboarding?intent=submit`.
 *
 * The URL is latched at mount because the app rewrites it as soon as it navigates. The initial URL covers native,
 * where the browser URL is empty, and links opened while the app is already running.
 */
function useOnboardingDeeplinkIntent(): OnboardingIntent | undefined {
    const {initialURL} = useInitialURLState();
    const [urlAtMount] = useState(getCurrentUrl);

    return getOnboardingIntentFromUrl(urlAtMount) ?? getOnboardingIntentFromUrl(initialURL);
}

export default useOnboardingDeeplinkIntent;
