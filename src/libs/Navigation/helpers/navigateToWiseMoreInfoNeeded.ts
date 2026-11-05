import Navigation from '@libs/Navigation/Navigation';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';

/**
 * Opens the flow where the admin sends Wise the info it asked for on the account's global reimbursements onboarding.
 * The Wallet row and the Home task both go through here, so they always land on the same page.
 */
function navigateToWiseMoreInfoNeeded(bankAccountID: number) {
    // The page reads the bank account from the intro's path underneath it, and its back skips the intro to return here
    const introPath = createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID));
    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path, introPath));
}

export default navigateToWiseMoreInfoNeeded;
