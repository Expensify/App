import type {LinkingOptions} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {Linking} from 'react-native';
import {hasAuthToken} from '@libs/actions/Session';
import continuePlaidOAuth from '@libs/continuePlaidOAuth';
import isPublicScreenRoute from '@libs/isPublicScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import {getRouteFromLink} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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
        // Don't forward URLs to React Navigation when AuthScreens isn't mounted yet (i.e., user is
        // on PublicScreens) unless the URL targets a public screen route (e.g., magic code validation).
        // The navigator tree can't handle authenticated routes at that point, which causes an unhandled
        // NAVIGATE action error. DeepLinkHandler handles authenticated URLs separately via
        // openReportFromDeepLink after sign-in completes.
        if (!Navigation.navContainsProtectedRoutes(navigationRef.current?.getRootState()) && !isPublicScreenRoute(getRouteFromLink(url))) {
            // If the user is already authenticated, AuthScreens is about to mount (lazy-load).
            // Queue the URL so it's forwarded once the navigator is ready instead of dropping it.
            if (hasAuthToken()) {
                Navigation.waitForProtectedRoutes().then(() => listener(url));
            }
            return;
        }
        listener(url);
    });
    return () => subscription.remove();
};

export default subscribe;
