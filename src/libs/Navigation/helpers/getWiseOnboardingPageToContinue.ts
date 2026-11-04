import {isWiseOnboardingMoreInfoNeeded, isWiseOnboardingPendingSubmit} from '@libs/BankAccountUtils';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {BankAccount} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * The page the Wise intro continues the account's onboarding on: the onboarding, which reopens on the first page left unanswered, or the page
 * that sends the admin to Wise's own form when Wise needs more info. Undefined when the admin has nothing to continue.
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

export default getWiseOnboardingPageToContinue;
