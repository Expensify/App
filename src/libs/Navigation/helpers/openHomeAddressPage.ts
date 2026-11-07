import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';

import swapBackgroundTabForRHPTarget from './swapBackgroundTabForRHPTarget';

/**
 * Opens the address-only home address RHP, first swapping the background tab to the preferences page so the
 * RHP does not open over whichever report or Home screen launched it. Commuter exclusion prompts use it
 * because they only need the home address, while the full private personal details form also requires a
 * legal name, date of birth, phone number and a magic code.
 */
function openHomeAddressPage() {
    swapBackgroundTabForRHPTarget(navigationRef.getRootState(), ROUTES.SETTINGS_HOME_ADDRESS);

    // The swap can start its own tab transition. Opening the RHP during it is safe only because the address form
    // focuses no field on open, so the tab change has no focus to take away.
    Navigation.navigate(ROUTES.SETTINGS_HOME_ADDRESS);
}

export default openHomeAddressPage;
