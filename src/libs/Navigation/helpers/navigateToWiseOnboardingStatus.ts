import Navigation from '@libs/Navigation/Navigation';

import getWiseOnboardingStatusRoute from './getWiseOnboardingStatusRoute';

/**
 * Opens the status page of the account's submitted Wise onboarding, at global-reimbursements/<bankAccountID>/status.
 * The Wallet menu, the Wallet row and the Home task all go through here, so they always land on the same page.
 */
function navigateToWiseOnboardingStatus(bankAccountID: number) {
    // The page reads the bank account from the intro's path underneath it, and its back skips the intro to return here
    Navigation.navigate(getWiseOnboardingStatusRoute(bankAccountID));
}

export default navigateToWiseOnboardingStatus;
