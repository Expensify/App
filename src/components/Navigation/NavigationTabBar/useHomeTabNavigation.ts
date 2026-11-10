import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

/** Returns the handler that opens the Home tab, doing nothing when it is already selected. */
function useHomeTabNavigation(isHomeSelected: boolean) {
    return () => {
        if (isHomeSelected) {
            return;
        }
        Navigation.navigate(ROUTES.HOME);
    };
}

export default useHomeTabNavigation;
