import isNonIncentivizedEarlyRenewalPeriod from '@libs/EarlyRenewalOfferUtils';

describe('EarlyRenewalOfferUtils', () => {
    test.each([
        ['before the campaign', '2026-09-30T23:59:59Z', false],
        ['at the campaign start', '2026-10-01T00:00:00Z', true],
        ['during the non-incentivized phase', '2026-10-14T23:59:59Z', true],
        ['at the incentivized phase start', '2026-10-15T00:00:00Z', false],
    ])('returns the expected result %s', (_description, timestamp, expected) => {
        // Given a timestamp near a campaign phase boundary
        // When App determines whether the non-incentivized offer is active
        const isActive = isNonIncentivizedEarlyRenewalPeriod(Date.parse(timestamp));

        // Then the result matches the UTC campaign window
        expect(isActive).toBe(expected);
    });
});
