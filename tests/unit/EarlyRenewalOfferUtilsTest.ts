import isNonIncentivizedEarlyRenewalPeriod, {isIncentivizedEarlyRenewalPeriod} from '@libs/EarlyRenewalOfferUtils';

import CONST from '@src/CONST';

describe('EarlyRenewalOfferUtils', () => {
    test.each([
        ['before the campaign', new Date(Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.NON_INCENTIVIZED_START) - 1).toISOString(), false],
        ['at the campaign start', CONST.SUBSCRIPTION.EARLY_RENEWAL.NON_INCENTIVIZED_START, true],
        ['during the non-incentivized phase', '2026-10-14T23:59:59Z', true],
        ['at the incentivized phase start', '2026-10-15T00:00:00Z', false],
    ])('returns the expected result %s', (_description, timestamp, expected) => {
        // Given a timestamp near a campaign phase boundary
        // When App determines whether the non-incentivized offer is active
        const isActive = isNonIncentivizedEarlyRenewalPeriod(Date.parse(timestamp));

        // Then the result matches the UTC campaign window
        expect(isActive).toBe(expected);
    });

    test.each([
        ['before incentives', '2026-10-14T23:59:59Z', false],
        ['at the incentive start', '2026-10-15T00:00:00Z', true],
        ['before the campaign ends', '2026-12-31T23:59:59Z', true],
        ['at the campaign end', '2027-01-01T00:00:00Z', false],
    ])('shows the admin draft CTA only during incentives: %s', (_description, timestamp, expected) => {
        // Given a timestamp near the incentive window boundaries
        // When App checks whether to show the admin CTA
        const isActive = isIncentivizedEarlyRenewalPeriod(Date.parse(timestamp));

        // Then no admin CTA is shown before incentives or after the campaign
        expect(isActive).toBe(expected);
    });
});
