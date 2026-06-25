import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';
import useOnyx from '@hooks/useOnyx';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

/**
 * Navigates to the 3DS card-authentication screen when the backend issues a fresh SCA URL
 * (Onyx key `verify3dsSubscription`). Navigation fires only on a genuine change to the URL, never on
 * the value already present at mount. Skipping that mount-time run keeps two false positives inert:
 * a stale URL left over from a previous SCA attempt, and a truthy URL that just happens to be present
 * at mount during a racy navigation. Only a subsequent "backend just returned a fresh URL" change
 * triggers navigation.
 *
 * `verify3dsSubscription` is a single global Onyx key, but several screens mount this hook. To stop
 * one screen from hijacking a link another screen produced (e.g. the Subscription "Authenticate
 * payment" link opening over the add-payment-card page), the screen that kicks off a request passes
 * its own `route.name` to the producing action, which records it in `verify3dsSubscriptionSource`. A
 * mounted hook only reacts to a link when its own focused screen matches that source, so a link can
 * never be consumed by an unrelated screen the user has since navigated to.
 */
function useNavigateToCardAuthenticationOnLink() {
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const [source] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION_SOURCE);
    const isFocused = useIsFocused();
    const route = useRoute();
    const firstRenderRef = useRef(true);

    const navigateToCardAuthentication = useEffectEvent(() => {
        // The concrete reason for the mount-skip: on a reload/deep-link reconstruction the parent
        // remounts with the URL already in Onyx, so this effect's mount run would fire
        // createDynamicRoute() at the same moment React Navigation is still opening the screen. Those
        // two competing navigations left the stack in a broken state. Skipping the mount run lets the
        // reconstruction settle and only navigates on a later, genuine change of the link.
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }
        if (!isFocused || route.name !== source || !authenticationLink) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.CARD_AUTHENTICATION.path));
    });

    useEffect(() => {
        navigateToCardAuthentication();
    }, [authenticationLink]);
}

export default useNavigateToCardAuthenticationOnLink;
