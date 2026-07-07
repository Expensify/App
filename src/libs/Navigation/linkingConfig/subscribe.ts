import continuePlaidOAuth from '@libs/continuePlaidOAuth';
import navigationRef from '@libs/Navigation/navigationRef';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {LinkingOptions} from '@react-navigation/native';

import {findFocusedRoute} from '@react-navigation/native';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';

// FIX #82013: track the session authToken so we can detect a signed-out user without importing the
// Session action module (which would create a circular dependency through the navigation layer).
let sessionAuthToken: string | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        sessionAuthToken = session?.authToken;
    },
});

/**
 * Rules for dropping a deep link that would re-navigate to a screen the user is already on.
 */
const skipRules: ReadonlyArray<{
    urlMatcher: RegExp;
    focusedScreens: readonly string[];
}> = [
    {
        urlMatcher: /\/distance-gps(\?|$)/,
        focusedScreens: [ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.route],
    },
    {
        urlMatcher: /\/scan(\?|$)/,
        focusedScreens: [ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.route],
    },
    {
        urlMatcher: /\/manual(\?|$)/,
        focusedScreens: [ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.route],
    },
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

const subscribe: LinkingOptions<RootNavigatorParamList>['subscribe'] = (listener) => {
    const subscription = Linking.addEventListener('url', ({url}: {url: string}) => {
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
        // FIX #82013: When the user is signed out, a public-room (report) deeplink is handled by
        // DeepLinkHandler → openReportFromDeepLink(), which opens the room as an anonymous user once the
        // session establishes the protected (auth) routes. Forwarding the same URL to React Navigation
        // here makes it dispatch a NAVIGATE into TabNavigator, which doesn't exist in the PublicScreens
        // tree yet → "The action 'NAVIGATE' ... was not handled by any navigator", leaving the user stuck
        // on the sign-in screen. So skip the React Navigation dispatch for report deeplinks while signed out.
        // We match the report route with a lightweight path regex instead of getReportIDFromLink() to avoid the
        // circular import ReportUtils -> linkingConfig -> subscribe -> ReportUtils that situchan flagged.
        if (!sessionAuthToken && CONST.REGEX.REPORT_ID_FROM_PATH.test(url)) {
            return;
        }
        listener(url);
    });
    return () => subscription.remove();
};

export default subscribe;
