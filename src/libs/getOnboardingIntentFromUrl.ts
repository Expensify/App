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

const ONBOARDING_INTENT_VALUES = new Set<string>(Object.values(CONST.ONBOARDING_INTENTS));

function isOnboardingIntent(value: string | null): value is OnboardingIntent {
    return !!value && ONBOARDING_INTENT_VALUES.has(value);
}

function getOnboardingIntentFromUrl(url: string | null | undefined): OnboardingIntent | undefined {
    if (!url) {
        return undefined;
    }

    // getRouteFromLink strips whichever linking-config prefix matched, so web URLs, the desktop `app://-/` origin and
    // the native scheme all reduce to the same route. It leaves the leading slash on in-app paths.
    const pathWithQuery = getRouteFromLink(url).replace(/^\/+/, '');
    const onboardingPathWithQuery = pathWithQuery.startsWith(ROUTES.ONBOARDING_ROOT.route) ? pathWithQuery : getSearchParamFromPath(pathWithQuery, 'exitTo');

    if (!onboardingPathWithQuery?.startsWith(ROUTES.ONBOARDING_ROOT.route)) {
        return undefined;
    }

    const intent = getSearchParamFromPath(onboardingPathWithQuery, 'intent');
    return isOnboardingIntent(intent) ? intent : undefined;
}

export default getOnboardingIntentFromUrl;
