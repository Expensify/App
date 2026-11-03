/**
 * Maps the business's Wise onboarding status to the content the status page shows for it.
 */
import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type WiseOnboardingStatusVariant = 'moreInfoNeeded' | 'inReview' | 'approved';

/**
 * A missing status means Wise has not answered yet, and a rejection reaches the admin as a Concierge message,
 * so both show the in review content, whose Chat with Concierge button leads to that message.
 */
function getWiseOnboardingStatusVariant(status: ValueOf<typeof CONST.WISE.ONBOARDING_STATUS> | undefined): WiseOnboardingStatusVariant {
    switch (status) {
        case CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED:
            return 'moreInfoNeeded';
        case CONST.WISE.ONBOARDING_STATUS.APPROVED:
            return 'approved';
        default:
            return 'inReview';
    }
}

export type {WiseOnboardingStatusVariant};
export default getWiseOnboardingStatusVariant;
