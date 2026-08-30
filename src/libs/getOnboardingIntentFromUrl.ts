/**
 * Reads the `intent` param of the onboarding deeplink (e.g. `onboarding?intent=submit`).
 *
 * It arrives either directly, or nested in the `exitTo` of a transition or magic link. Nesting it in `exitTo` is what
 * carries the intent across the logged-out to logged-in transition, since the deeplink outlives the sign-in itself.
 */
import type {OnboardingIntent} from '@src/CONST';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {getRouteFromLink} from './ReportUtils';
import {getSearchParamFromPath} from './Url';

function isOnboardingIntent(value: string | null): value is OnboardingIntent {
    return !!value && Object.values<string>(CONST.ONBOARDING_INTENTS).includes(value);
}

// Matching on the boundary rather than the prefix keeps sibling routes like `onboarding/work-email` out.
function isOnboardingPath(path: string | null): boolean {
    return path === ROUTES.ONBOARDING_ROOT.route || !!path?.startsWith(`${ROUTES.ONBOARDING_ROOT.route}?`);
}

function getOnboardingIntentFromUrl(url: string | null | undefined): OnboardingIntent | undefined {
    if (!url) {
        return undefined;
    }

    // getRouteFromLink strips whichever linking-config prefix matched, so web URLs, the desktop `app://-/` origin and
    // the native scheme all reduce to the same route. It leaves the leading slash on in-app paths.
    const pathWithQuery = getRouteFromLink(url).replace(/^\/+/, '');
    const onboardingPathWithQuery = isOnboardingPath(pathWithQuery) ? pathWithQuery : getSearchParamFromPath(pathWithQuery, 'exitTo');

    if (!isOnboardingPath(onboardingPathWithQuery)) {
        return undefined;
    }

    const intent = getSearchParamFromPath(onboardingPathWithQuery, 'intent');
    return isOnboardingIntent(intent) ? intent : undefined;
}

export default getOnboardingIntentFromUrl;
