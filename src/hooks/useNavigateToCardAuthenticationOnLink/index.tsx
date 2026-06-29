import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';
import useOnyx from '@hooks/useOnyx';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

/**
 * Web: pushes the 3DS card-authentication screen when the SCA link (Onyx `verify3dsSubscription`) changes.
 */
function useNavigateToCardAuthenticationOnLink() {
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const [source] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION_SOURCE);
    const isFocused = useIsFocused();
    const route = useRoute();
    const firstRenderRef = useRef(true);

    const navigateToCardAuthentication = useEffectEvent(() => {
        // Skip the mount run: a stale link can already sit in Onyx when a focused entry screen mounts
        // (e.g. reload straight onto the parent URL), and it must not auto-open a challenge on page load.
        // Only post-mount changes navigate — repeat attempts still register because the producer
        // (`prepareCardAuthentication`) clears the link first, so even an identical backend link lands as a change.
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }
        // `verify3dsSubscription` is one global key shared by several mounted hooks: only the focused screen
        // that recorded the link as its `source` may consume it, so an unrelated screen can't hijack it.
        if (!isFocused || !authenticationLink || route.name !== source) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.CARD_AUTHENTICATION.path));
    });

    useEffect(() => {
        navigateToCardAuthentication();
    }, [authenticationLink]);
}

export default useNavigateToCardAuthenticationOnLink;
