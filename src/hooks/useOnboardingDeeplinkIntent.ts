import {useInitialURLState} from '@components/InitialURLContextProvider';

import getOnboardingIntentFromUrl from '@libs/getOnboardingIntentFromUrl';
import getCurrentUrl from '@libs/Navigation/currentUrl';

import type {OnboardingIntent} from '@src/CONST';

import {useState} from 'react';

/**
 * Resolves the onboarding outcome requested by the deeplink this session was opened with, e.g. `onboarding?intent=submit`.
 *
 * Two sources because neither covers both platforms. On web the link is in the address bar, but only until the app
 * navigates and rewrites it, hence latching at mount. On native there is no address bar, so it arrives instead through
 * the initial-URL context. Links opened while the app is already running reach neither, so they are not supported.
 */
function useOnboardingDeeplinkIntent(): OnboardingIntent | undefined {
    const {initialURL} = useInitialURLState();
    const [urlAtMount] = useState(getCurrentUrl);

    return getOnboardingIntentFromUrl(urlAtMount) ?? getOnboardingIntentFromUrl(initialURL);
}

export default useOnboardingDeeplinkIntent;
