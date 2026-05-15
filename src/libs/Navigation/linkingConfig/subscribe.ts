import type {LinkingOptions} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {Linking} from 'react-native';
import continuePlaidOAuth from '@libs/continuePlaidOAuth';
import navigationRef from '@libs/Navigation/navigationRef';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const subscribe: LinkingOptions<RootNavigatorParamList>['subscribe'] = (listener) => {
    const subscription = Linking.addEventListener('url', ({url}: {url: string}) => {
        // Skip deep links to screens where the user is already focused.
        const routesToSkipIfAlreadyFocused = [ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.route, ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.route];
        const matchedRoute = routesToSkipIfAlreadyFocused.find((route) => url.includes(route));
        if (matchedRoute) {
            const state = navigationRef.current?.getRootState();
            if (state) {
                const currentRoute = findFocusedRoute(state);
                if (currentRoute?.name === matchedRoute) {
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
        listener(url);
    });
    return () => subscription.remove();
};

export default subscribe;
