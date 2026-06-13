import type {LinkingOptions} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import continuePlaidOAuth from '@libs/continuePlaidOAuth';
import navigationRef from '@libs/Navigation/navigationRef';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import {getReportIDFromLink} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

// FIX #82013: track the session authToken so we can detect a signed-out user without importing the
// Session action module (which would create a circular dependency through the navigation layer).
let sessionAuthToken: string | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        sessionAuthToken = session?.authToken;
    },
});

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
        // FIX #82013: When the user is signed out, a public-room (report) deeplink is handled by
        // DeepLinkHandler → openReportFromDeepLink(), which opens the room as an anonymous user once the
        // session establishes the protected (auth) routes. Forwarding the same URL to React Navigation
        // here makes it dispatch a NAVIGATE into TabNavigator, which doesn't exist in the PublicScreens
        // tree yet → "The action 'NAVIGATE' ... was not handled by any navigator", leaving the user stuck
        // on the sign-in screen. So skip the React Navigation dispatch for report deeplinks while signed out.
        if (!sessionAuthToken && getReportIDFromLink(url)) {
            return;
        }
        listener(url);
    });
    return () => subscription.remove();
};

export default subscribe;
