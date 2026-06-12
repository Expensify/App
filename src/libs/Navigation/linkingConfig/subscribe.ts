import {hasAuthToken} from '@libs/actions/Session';
import continuePlaidOAuth from '@libs/continuePlaidOAuth';
import {isTabNavigatorMounted, whenTabNavigatorReady} from '@libs/Navigation/helpers/tabNavigatorReadiness';
import navigationRef from '@libs/Navigation/navigationRef';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

import type {LinkingOptions} from '@react-navigation/native';

import {findFocusedRoute} from '@react-navigation/native';
import {Linking} from 'react-native';

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
        // For an unauthenticated session, a report deep link (`/r/<reportID>`) targets the Report screen,
        // which lives in AuthScreens and is not mounted while PublicScreens is showing. Dispatching it here
        // throws "NAVIGATE ... was not handled by any navigator". openReportFromDeepLink() already opens the
        // public room as an anonymous user and handles navigation, so defer to it instead. See #92672.
        if (!hasAuthToken() && url.includes(`/${ROUTES.REPORT}/`)) {
            return;
        }
        // TAB_NAVIGATOR is declared on the root navigator before its lazily-loaded child router
        // mounts. Forwarding the URL during that window dispatches a NAVIGATE that no navigator can
        // handle, so the deep link is silently dropped. Defer (don't drop) until the tab router
        // mounts. On public screens TAB_NAVIGATOR isn't declared, so we forward immediately.
        const rootState = navigationRef.current?.getRootState();
        const isTabNavigatorDeclared = !!rootState?.routeNames?.includes(NAVIGATORS.TAB_NAVIGATOR);
        if (isTabNavigatorDeclared && !isTabNavigatorMounted()) {
            whenTabNavigatorReady().then(() => listener(url));
            return;
        }
        listener(url);
    });
    return () => subscription.remove();
};

export default subscribe;
