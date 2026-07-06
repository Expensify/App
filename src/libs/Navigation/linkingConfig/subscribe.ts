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

const subscribe: LinkingOptions<RootNavigatorParamList>['subscribe'] = (listener) => {
    const subscription = Linking.addEventListener('url', ({url}: {url: string}) => {
        // Skip GPS distance screen deep links when the user is already on that screen.
        // This prevents a re-navigation with animation when tapping the GPS live update notification
        // while the GPS screen is already visible.
        if (url.includes(ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.route)) {
            const state = navigationRef.current?.getRootState();
            if (state) {
                const currentRoute = findFocusedRoute(state);
                if (currentRoute?.name === ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.route) {
                    return;
                }
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
