import Navigation from '@libs/Navigation/Navigation';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';

/**
 * Opens the flow where the admin sends Wise the info it asked for on the account's global reimbursements onboarding.
 * The Wallet row and the Home task both go through here, so they always land on the same page.
 */
function navigateToWiseMoreInfoNeeded(bankAccountID: number) {
    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID)));
}

export default navigateToWiseMoreInfoNeeded;
