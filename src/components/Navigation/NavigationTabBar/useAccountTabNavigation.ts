import useOnyx from '@hooks/useOnyx';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/** Returns the handler that opens the Account tab, asking anonymous users to sign in first. */
function useAccountTabNavigation(isAccountSelected: boolean) {
    const [session] = useOnyx(ONYXKEYS.SESSION);

    return () => {
        if (isAccountSelected) {
            return;
        }
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.SETTINGS);
        }, session);
    };
}

export default useAccountTabNavigation;
