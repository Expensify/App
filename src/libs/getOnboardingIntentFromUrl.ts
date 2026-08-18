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

import {getSearchParamFromPath} from './Url';

const ONBOARDING_INTENT_VALUES = new Set<string>(Object.values(CONST.ONBOARDING_INTENTS));

function isOnboardingIntent(value: string | null): value is OnboardingIntent {
    return !!value && ONBOARDING_INTENT_VALUES.has(value);
}

/**
 * Strips the scheme and, for web URLs, the host, so absolute URLs and in-app paths can be inspected the same way.
 *
 * Custom schemes have to keep the segment straight after `://`. In `new-expensify://onboarding?intent=submit` that
 * segment is the route rather than a host, so dropping it the way we drop `new.expensify.com` would discard the
 * route and lose the intent. The `app://-/` prefix puts a placeholder host there instead, which is dropped.
 */
function getPathWithQuery(url: string): string {
    const [withoutHash] = url.split('#', 2);
    const withoutOrigin = /^https?:\/\//i.test(withoutHash) ? withoutHash.replace(/^https?:\/\/[^/?#]*/i, '') : withoutHash.replace(/^[a-z][\w+.-]*:\/\//i, '');
    return withoutOrigin.replace(/^(-\/)?\/*/, '');
}

function getOnboardingIntentFromUrl(url: string | null | undefined): OnboardingIntent | undefined {
    if (!url) {
        return undefined;
    }

    const pathWithQuery = getPathWithQuery(url);
    const onboardingPathWithQuery = pathWithQuery.startsWith(ROUTES.ONBOARDING_ROOT.route) ? pathWithQuery : getSearchParamFromPath(pathWithQuery, 'exitTo');

    if (!onboardingPathWithQuery?.startsWith(ROUTES.ONBOARDING_ROOT.route)) {
        return undefined;
    }

    const intent = getSearchParamFromPath(onboardingPathWithQuery, 'intent');
    return isOnboardingIntent(intent) ? intent : undefined;
}

export default getOnboardingIntentFromUrl;
