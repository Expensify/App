import getWiseOnboardingStatusVariant from '@libs/getWiseOnboardingStatusVariant';

import CONST from '@src/CONST';

describe('getWiseOnboardingStatusVariant', () => {
    it.each([
        [CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED, 'moreInfoNeeded'],
        [CONST.WISE.ONBOARDING_STATUS.IN_REVIEW, 'inReview'],
        [CONST.WISE.ONBOARDING_STATUS.APPROVED, 'approved'],
        [CONST.WISE.ONBOARDING_STATUS.NOT_APPROVED, 'inReview'],
        [undefined, 'inReview'],
    ] as const)('maps %s to the %s content', (status, expectedVariant) => {
        // Given the status Wise holds for the bank account, where a rejection is explained by Concierge and a missing status is still pending
        // When the status page picks its content
        const variant = getWiseOnboardingStatusVariant(status);

        // Then the admin sees the content for what they can do next
        expect(variant).toBe(expectedVariant);
    });
});
