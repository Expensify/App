/**
 * Reads the `intent` param of the onboarding deeplink (e.g. `onboarding?intent=submit`), which lets a one-click
 * link pre-select an onboarding outcome instead of asking the recipient to pick it in the UI.
 *
 * The param arrives in one of two shapes:
 * - directly, when the recipient is already signed in: `/onboarding?intent=submit`
 * - nested in the `exitTo` of an auth handoff link, where `onboarding?intent=submit` is URL-encoded:
 *   `/transition?...&exitTo=<encoded>` or `/v/<accountID>/<validateCode>?exitTo=<encoded>`
 *
 * Nesting it in `exitTo` is what carries the intent across the logged-out -> logged-in transition: the deeplink
 * outlives the sign-in itself, so the intent is still readable once the authenticated screens mount.
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

    // getRouteFromLink strips whichever linking-config prefix matched, so every shape the deeplink can arrive in
    // reduces to the same route: web URLs, the dev server's port, the desktop `app://-/` origin and the native
    // `new-expensify://` scheme. It only drops the leading slash when a prefix matched, so in-app paths keep theirs.
    const pathWithQuery = getRouteFromLink(url).replace(/^\/+/, '');
    const onboardingPathWithQuery = pathWithQuery.startsWith(ROUTES.ONBOARDING_ROOT.route) ? pathWithQuery : getSearchParamFromPath(pathWithQuery, 'exitTo');

    if (!onboardingPathWithQuery?.startsWith(ROUTES.ONBOARDING_ROOT.route)) {
        return undefined;
    }

    const intent = getSearchParamFromPath(onboardingPathWithQuery, 'intent');
    return isOnboardingIntent(intent) ? intent : undefined;
}

export default getOnboardingIntentFromUrl;
