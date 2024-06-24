import CardSectionUtils from '@src/pages/settings/Subscription/CardSection/utils';

describe('getNextBillingDate', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        // Month is zero indexed, so this is July 5th 2024
        jest.setSystemTime(new Date(2024, 6, 5));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should return the next billing date when initial date is valid', () => {
        const expectedNextBillingDate = 'August 1, 2024';

        expect(CardSectionUtils.getNextBillingDate()).toEqual(expectedNextBillingDate);
    });

    it('should handle end-of-month edge cases correctly', () => {
        const nextBillingDate = CardSectionUtils.getNextBillingDate();
        const expectedNextBillingDate = 'August 1, 2024';
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });

    it('should handle date when it at the current month', () => {
        const nextBillingDate = CardSectionUtils.getNextBillingDate();
        const expectedNextBillingDate = 'August 1, 2024';
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });

    it('should return the next billing date when initial date is invalid', () => {
        const expectedNextBillingDate = 'August 1, 2024';

        expect(CardSectionUtils.getNextBillingDate()).toEqual(expectedNextBillingDate);
    });
});
