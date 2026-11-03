/**
 * Maps the business's Wise onboarding status to the content the status page shows for it.
 */
import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type WiseOnboardingStatusVariant = 'moreInfoNeeded' | 'inReview' | 'approved' | 'rejected';

/**
 * A missing status means Wise has not answered yet, so it shows the in review content.
 */
function getWiseOnboardingStatusVariant(status: ValueOf<typeof CONST.WISE.ONBOARDING_STATUS> | undefined): WiseOnboardingStatusVariant {
    switch (status) {
        case CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED:
            return 'moreInfoNeeded';
        case CONST.WISE.ONBOARDING_STATUS.APPROVED:
            return 'approved';
        case CONST.WISE.ONBOARDING_STATUS.NOT_APPROVED:
            return 'rejected';
        default:
            return 'inReview';
    }
}

export type {WiseOnboardingStatusVariant};
export default getWiseOnboardingStatusVariant;
