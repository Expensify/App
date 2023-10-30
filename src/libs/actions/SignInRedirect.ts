import Onyx from 'react-native-onyx';
import ONYXKEYS, {OnyxKey} from '../../ONYXKEYS';
import * as MainQueue from '../Network/MainQueue';
import * as PersistedRequests from './PersistedRequests';
import NetworkConnection from '../NetworkConnection';
import HttpUtils from '../HttpUtils';
import navigationRef from '../Navigation/navigationRef';
import SCREENS from '../../SCREENS';
import Navigation from '../Navigation/Navigation';
import * as ErrorUtils from '../ErrorUtils';
import * as SessionUtils from '../SessionUtils';

let currentIsOffline: boolean | undefined;
let currentShouldForceOffline: boolean | undefined;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        currentIsOffline = network?.isOffline;
        currentShouldForceOffline = network?.shouldForceOffline;
    },
});

function clearStorageAndRedirect(errorMessage?: string) {
    // Under certain conditions, there are key-values we'd like to keep in storage even when a user is logged out.
    // We pass these into the clear() method in order to avoid having to reset them on a delayed tick and getting
    // flashes of unwanted default state.
    const keysToPreserve: OnyxKey[] = [];
    keysToPreserve.push(ONYXKEYS.NVP_PREFERRED_LOCALE);
    keysToPreserve.push(ONYXKEYS.ACTIVE_CLIENTS);
    keysToPreserve.push(ONYXKEYS.DEVICE_ID);

    // After signing out, set ourselves as offline if we were offline before logging out and we are not forcing it.
    // If we are forcing offline, ignore it while signed out, otherwise it would require a refresh because there's no way to toggle the switch to go back online while signed out.
    if (currentIsOffline && !currentShouldForceOffline) {
        keysToPreserve.push(ONYXKEYS.NETWORK);
    }

    Onyx.clear(keysToPreserve).then(() => {
        if (!errorMessage) {
            return;
        }

        // `Onyx.clear` reinitializes the Onyx instance with initial values so use `Onyx.merge` instead of `Onyx.set`
        Onyx.merge(ONYXKEYS.SESSION, {errors: ErrorUtils.getMicroSecondOnyxError(errorMessage)});
    });
}

/**
 * Reset all current params of the Home route
 */
function resetHomeRouteParams() {
    Navigation.isNavigationReady().then(() => {
        const routes = navigationRef.current?.getState().routes;
        const homeRoute = routes?.find((route) => route.name === SCREENS.HOME);

        const emptyParams: Record<string, undefined> = {};
        Object.keys(homeRoute?.params ?? {}).forEach((paramKey) => {
            emptyParams[paramKey] = undefined;
        });

        Navigation.setParams(emptyParams, homeRoute?.key ?? '');
        Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
    });
}

/**
 * Cleanup actions resulting in the user being redirected to the Sign-in page
 * - Clears the Onyx store - removing the authToken redirects the user to the Sign-in page
 * - Cancels pending network calls - any lingering requests are discarded to prevent unwanted storage writes
 * - Clears all current params of the Home route - the login page URL should not contain any parameter
 *
 * Normally this method would live in Session.js, but that would cause a circular dependency with Network.js.
 *
 * @param [errorMessage] error message to be displayed on the sign in page
 */
function redirectToSignIn(errorMessage?: string) {
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
    PersistedRequests.clear();
    NetworkConnection.clearReconnectionCallbacks();
    clearStorageAndRedirect(errorMessage);
    resetHomeRouteParams();
    SessionUtils.resetDidUserLogInDuringSession();
}

export default redirectToSignIn;
