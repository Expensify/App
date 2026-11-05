import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';

/**
 * Builds the path of the status page of the account's Wise onboarding, <entryPath>/global-reimbursements/<bankAccountID>/status.
 * The stack can hold the status page without the intro underneath, so a path rebuilt from the stack would lose the bank account.
 */
function getWiseOnboardingStatusRoute(bankAccountID: number, entryPath?: string): Route {
    const introPath = createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID), entryPath);
    return createDynamicRoute(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path, introPath);
}

export default getWiseOnboardingStatusRoute;
