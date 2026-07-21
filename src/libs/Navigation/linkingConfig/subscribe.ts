import {hasAuthToken} from '@libs/actions/Session';
import continuePlaidOAuth from '@libs/continuePlaidOAuth';
import isPublicScreenRoute from '@libs/isPublicScreenRoute';
import normalizePath from '@libs/Navigation/helpers/normalizePath';
import navigationRef from '@libs/Navigation/navigationRef';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import {clearPendingConciergeDeepLink, setPendingConciergeDeepLink, setPendingHomeDeepLinkIfNoPendingConcierge} from '@libs/PendingConciergeDeepLink';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {LinkingOptions} from '@react-navigation/native';

import {findFocusedRoute} from '@react-navigation/native';
import {Linking} from 'react-native';

import prefixes from './prefixes';

/**
 * Rules for dropping a deep link that would re-navigate to a screen the user is already on.
 */
const skipRules: ReadonlyArray<{urlMatcher: RegExp; focusedScreens: readonly string[]}> = [
    {urlMatcher: /\/distance-gps(\?|$)/, focusedScreens: [ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.route]},
    {urlMatcher: /\/scan(\?|$)/, focusedScreens: [ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.route]},
    {urlMatcher: /\/manual(\?|$)/, focusedScreens: [ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.route]},
    {
        urlMatcher: /\/distance-new(\/|\?|$)/,
        focusedScreens: [
            ROUTES.DISTANCE_REQUEST_CREATE_TAB_MAP.route,
            ROUTES.DISTANCE_REQUEST_CREATE_TAB_MANUAL.route,
            ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.route,
            ROUTES.DISTANCE_REQUEST_CREATE_TAB_ODOMETER.route,
        ],
    },
];

function isInternalAppURL(url: string) {
    if (url.startsWith('/') || prefixes.some((prefix) => url.startsWith(prefix))) {
        return true;
    }

    try {
        return typeof window !== 'undefined' && new URL(url).origin === window.location.origin;
    } catch {
        return false;
    }
}

function getNormalizedPathFromURL(url: string) {
    let path = url;

    try {
        const parsedURL = new URL(url);
        path = parsedURL.protocol === 'http:' || parsedURL.protocol === 'https:' || parsedURL.pathname ? parsedURL.pathname : parsedURL.host;
    } catch {
        // If URL parsing fails, treat the value as a route path.
    }

    return (normalizePath(path).replace(/\/$/, '') || '/').toLowerCase();
}

const subscribe: LinkingOptions<RootNavigatorParamList>['subscribe'] = (listener) => {
    const subscription = Linking.addEventListener('url', ({url}: {url: string}) => {
        const isAuthenticated = hasAuthToken();
        const normalizedPath = getNormalizedPathFromURL(url);
        const route = normalizedPath === '/' ? '' : normalizedPath.slice(1);
        if (!isAuthenticated && isInternalAppURL(url)) {
            if (normalizedPath === normalizePath(ROUTES.CONCIERGE)) {
                setPendingConciergeDeepLink();
            } else if (normalizedPath === '/' || normalizedPath === normalizePath(ROUTES.HOME)) {
                // URL events can be emitted by navigation restoration, so keep a persisted Concierge intent if one exists.
                setPendingHomeDeepLinkIfNoPendingConcierge();
            } else if (!isPublicScreenRoute(route)) {
                clearPendingConciergeDeepLink();
            }
        }

        // Skip deep links to screens where the user is already focused.
        const skipRule = skipRules.find(({urlMatcher}) => urlMatcher.test(url));
        if (skipRule) {
            const state = navigationRef.current?.getRootState();
            const focusedName = state ? findFocusedRoute(state)?.name : undefined;
            if (focusedName && skipRule.focusedScreens.includes(focusedName)) {
                return;
            }
        }

        // The native Plaid SDK on iOS handles the OAuth callback itself. Forwarding this URL to
        // React Navigation would resolve to NotFound (or reset navigation away from the Plaid step)
        // and break the flow — keep the current screen mounted so the SDK can finish.
        if (url.includes(CONST.PLAID.OAUTH_REDIRECT_PATH_IOS)) {
            // Forward the OAuth redirect URI into the Plaid SDK so it can finalize OAuth.
            // Without this, the native SDK never sees the callback URL and retries OAuth in a loop
            // after app-to-app bank auth returns. See issue #87757.
            continuePlaidOAuth(url);
            return;
        }
        // For an unauthenticated session, a report deep link (`/r/<reportID>`) targets the Report screen,
        // which lives in AuthScreens and is not mounted while PublicScreens is showing. Dispatching it here
        // throws "NAVIGATE ... was not handled by any navigator". openReportFromDeepLink() already opens the
        // public room as an anonymous user and handles navigation, so defer to it instead. See #92672.
        if (!isAuthenticated && url.includes(`/${ROUTES.REPORT}/`)) {
            return;
        }
        listener(url);
    });
    return () => subscription.remove();
};

export default subscribe;
