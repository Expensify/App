import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/HomeAddressForm';

import swapBackgroundTabForRHPTarget from './swapBackgroundTabForRHPTarget';

/**
 * Opens the address-only home address RHP, first swapping the background tab to the preferences page so the
 * RHP does not open over whichever report or Home screen launched it. Commuter exclusion prompts use it
 * because they only need the home address, while the full private personal details form also requires a
 * legal name, date of birth, phone number and a magic code.
 */
function navigateToHomeAddress(fieldToFocus?: string) {
    const route = ROUTES.SETTINGS_HOME_ADDRESS.getRoute(fieldToFocus);
    const didSwapBackgroundTab = swapBackgroundTabForRHPTarget(navigationRef.getRootState(), route);

    // A tab change can steal focus and validate the empty field, so finish it before opening a form that requests focus.
    if (fieldToFocus && didSwapBackgroundTab) {
        Navigation.runAfterUpcomingTransition(() => Navigation.navigate(route));
        return;
    }
    Navigation.navigate(route);
}

function openHomeAddressPage() {
    navigateToHomeAddress();
}

function openHomeAddressPageWithFocus() {
    navigateToHomeAddress(INPUT_IDS.ADDRESS_LINE_1);
}

export {openHomeAddressPageWithFocus};
export default openHomeAddressPage;
