import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';

import swapBackgroundTabForRHPTarget from './swapBackgroundTabForRHPTarget';

/**
 * Opens the private personal details RHP, first swapping the background tab to the profile page so the
 * RHP does not open over whichever report or Home screen launched it.
 */
function openPrivatePersonalDetailsPage(fieldToFocus?: string) {
    const route = ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(fieldToFocus);

    const didSwapBackgroundTab = swapBackgroundTabForRHPTarget(navigationRef.getRootState(), route);

    if (!didSwapBackgroundTab) {
        Navigation.navigate(route);
        return;
    }

    // Swapping the background tab starts its own navigation transition. Waiting to open the
    // private-details RHP until that transition settles preserves the intended autofocus instead
    // of letting the background tab change immediately blur the address field.
    Navigation.runAfterUpcomingTransition(() => Navigation.navigate(route));
}

export default openPrivatePersonalDetailsPage;
