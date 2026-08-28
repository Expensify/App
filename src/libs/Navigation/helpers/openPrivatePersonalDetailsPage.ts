import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';

import swapBackgroundTabForRHPTarget from './swapBackgroundTabForRHPTarget';

function openPrivatePersonalDetailsPage(fieldToFocus?: string) {
    const route = ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(fieldToFocus);

    swapBackgroundTabForRHPTarget(navigationRef.getRootState(), route);
    Navigation.navigate(route);
}

export default openPrivatePersonalDetailsPage;
