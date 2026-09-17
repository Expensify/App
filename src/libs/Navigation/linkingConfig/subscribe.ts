import continuePlaidOAuth from '@libs/continuePlaidOAuth';
import {hasAuthToken} from '@libs/CurrentUserStore';
import navigationRef from '@libs/Navigation/navigationRef';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {LinkingOptions} from '@react-navigation/native';

import {findFocusedRoute} from '@react-navigation/native';
import {Linking} from 'react-native';

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

function getPathnameFromURL(url: string): string {
    return url.split(/[?#]/).at(0) ?? '';
}

const subscribe: LinkingOptions<RootNavigatorParamList>['subscribe'] = (listener) => {
    const subscription = Linking.addEventListener('url', ({url}: {url: string}) => {
        const skipRule = skipRules.find(({urlMatcher}) => urlMatcher.test(url));
        if (skipRule) {
            const state = navigationRef.current?.getRootState();
            const focusedName = state ? findFocusedRoute(state)?.name : undefined;
            if (focusedName && skipRule.focusedScreens.includes(focusedName)) {
                return;
            }
        }

        // The native Plaid SDK on iOS finishes OAuth itself, so the redirect must never reach React
        // Navigation — it would resolve to NotFound and unmount the Plaid step. Hand the URI to the SDK,
        // otherwise it never sees the callback URL and retries OAuth in a loop. See issue #87757.
        if (url.includes(CONST.PLAID.OAUTH_REDIRECT_PATH_IOS)) {
            continuePlaidOAuth(url);
            return;
        }
        // For an unauthenticated session, a report deep link (`/r/<reportID>`) targets the Report screen,
        // which lives in AuthScreens and is not mounted while PublicScreens is showing. Dispatching it here
        // throws "NAVIGATE ... was not handled by any navigator". openReportFromDeepLink() already opens the
        // public room as an anonymous user and handles navigation, so defer to it instead. See #92672.
        if (!hasAuthToken() && getPathnameFromURL(url).includes(`/${ROUTES.REPORT}/`)) {
            return;
        }
        listener(url);
    });
    return () => subscription.remove();
};

export default subscribe;
