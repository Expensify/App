import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';
import useOnyx from '@hooks/useOnyx';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {clearPaymentCard3dsVerification} from '@userActions/PaymentMethods';
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
 *
 * If the focused screen is NOT the link's owner (the user left the flow that started the request
 * before the link arrived), the link is orphaned — it can never be consumed. The focused hook clears
 * it so a later identical link from a fresh attempt still registers as a change and can reopen the
 * challenge. Only the focused screen clears, so an unfocused background instance can't wipe a link the
 * focused owner is about to consume.
 */
function useNavigateToCardAuthenticationOnLink() {
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const [source] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION_SOURCE);
    const isFocused = useIsFocused();
    const route = useRoute();
    const firstRenderRef = useRef(true);

    const navigateToCardAuthentication = useEffectEvent(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }
        // Only the focused screen acts on a link change. Unfocused mounted instances bail so they can
        // neither navigate nor clear a link the focused screen may still need to consume.
        if (!isFocused || !authenticationLink) {
            return;
        }
        if (route.name !== source) {
            // Focused, but this link belongs to a different screen: the user left the flow that started it
            // before the link arrived. Drop the orphaned link so a later identical link from a fresh attempt
            // still registers as a change and can reopen the challenge (mirrors the close-time clear).
            clearPaymentCard3dsVerification();
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.CARD_AUTHENTICATION.path));
    });

    useEffect(() => {
        navigateToCardAuthentication();
    }, [authenticationLink]);
}

export default useNavigateToCardAuthenticationOnLink;
