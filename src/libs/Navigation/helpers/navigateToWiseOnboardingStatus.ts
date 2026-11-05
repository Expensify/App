import Navigation from '@libs/Navigation/Navigation';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';

/**
 * Opens the status page of the account's submitted Wise onboarding, at global-reimbursements/<bankAccountID>/status.
 * The Wallet menu, the Wallet row and the Home task all go through here, so they always land on the same page.
 */
function navigateToWiseOnboardingStatus(bankAccountID: number) {
    // The page reads the bank account from the intro's path underneath it, and its back skips the intro to return here
    const introPath = createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID));
    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path, introPath));
}

export default navigateToWiseOnboardingStatus;
