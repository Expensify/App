import Navigation from '@libs/Navigation/Navigation';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import type {LinkToOptions} from './linkTo/types';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';

/**
 * Opens the Wise intro and, for an onboarding the admin can continue, the onboarding on top of it, which reopens on the first page left unanswered.
 * One navigation to the stacked route would put only the onboarding on the stack, and the onboarding takes its bank account and back path from the intro.
 */
function navigateToWiseGlobalReimbursements(introRoute: Route, shouldContinueOnboarding: boolean, options?: LinkToOptions) {
    if (!shouldContinueOnboarding) {
        Navigation.navigate(introRoute, options);
        return;
    }
    Navigation.navigate(introRoute, {...options, afterTransition: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute(), introRoute))});
}

export default navigateToWiseGlobalReimbursements;
