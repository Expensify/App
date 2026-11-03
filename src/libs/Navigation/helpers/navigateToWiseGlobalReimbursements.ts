import {isWiseOnboardingPendingSubmit, isWiseOnboardingMoreInfoNeeded} from '@libs/BankAccountUtils';
import Navigation from '@libs/Navigation/Navigation';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {BankAccount} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {LinkToOptions} from './linkTo/types';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';

/**
 * The page that picks up the account's Wise onboarding on top of the intro: the onboarding, which reopens on the first page left unanswered, or the page
 * that sends the admin to Wise's own form when Wise needs more info
 */
function getWiseOnboardingPageToContinue(bankAccount: OnyxEntry<BankAccount>): string | undefined {
    if (isWiseOnboardingPendingSubmit(bankAccount)) {
        return DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute();
    }
    if (isWiseOnboardingMoreInfoNeeded(bankAccount)) {
        return DYNAMIC_ROUTES.WISE_MORE_INFO_NEEDED.path;
    }
    return undefined;
}

/**
 * Opens the Wise intro and, for an onboarding the admin can continue, the page that picks it up on top of it.
 * One navigation to the stacked route would put only the top page on the stack, and that page takes its bank account and back path from the intro.
 */
function navigateToWiseGlobalReimbursements(introRoute: Route, pageToContinue: string | undefined, options?: LinkToOptions) {
    if (!pageToContinue) {
        Navigation.navigate(introRoute, options);
        return;
    }
    Navigation.navigate(introRoute, {...options, afterTransition: () => Navigation.navigate(createDynamicRoute(pageToContinue, introRoute))});
}

export default navigateToWiseGlobalReimbursements;
export {getWiseOnboardingPageToContinue};
