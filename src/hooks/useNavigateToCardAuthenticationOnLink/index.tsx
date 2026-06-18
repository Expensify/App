import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';
import useOnyx from '@hooks/useOnyx';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

/**
 * Navigates to the 3DS card-authentication screen when the backend issues a fresh SCA URL
 * (Onyx key `verify3dsSubscription`). Skips the mount-time invocation so a stale Onyx value
 * left over from a previous SCA attempt — or a truthy value present at mount during a racy
 * navigation — never triggers an auto-navigate; only subsequent changes to `authenticationLink`
 * (the genuine "user just submitted the card form, backend returned a fresh URL" flow) fire navigation.
 */
function useNavigateToCardAuthenticationOnLink(shouldNavigate = true) {
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const isFocused = useIsFocused();
    const firstRenderRef = useRef(true);

    const navigateToCardAuthentication = useEffectEvent(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }
        if (!isFocused || !shouldNavigate || !authenticationLink) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.CARD_AUTHENTICATION.path));
    });

    useEffect(() => {
        navigateToCardAuthentication();
    }, [authenticationLink]);
}

export default useNavigateToCardAuthenticationOnLink;
