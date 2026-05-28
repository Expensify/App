import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent} from 'react';
import useOnyx from '@hooks/useOnyx';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function useNavigateToCardAuthenticationOnLink() {
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const isFocused = useIsFocused();

    const navigateToCardAuthentication = useEffectEvent(() => {
        if (!isFocused) {
            return;
        }
        if (!authenticationLink) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.CARD_AUTHENTICATION.path));
    });

    useEffect(() => {
        navigateToCardAuthentication();
    }, [authenticationLink]);
}

export default useNavigateToCardAuthenticationOnLink;
