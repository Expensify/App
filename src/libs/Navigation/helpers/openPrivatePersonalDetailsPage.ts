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

    swapBackgroundTabForRHPTarget(navigationRef.getRootState(), route);
    Navigation.navigate(route);
}

export default openPrivatePersonalDetailsPage;
