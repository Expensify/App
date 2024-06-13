import getNextBillingDate from '@src/pages/settings/Subscription/CardSection/utils';

describe('getNextBillingDate', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2024, 6, 5));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should return the next billing date when initial date is valid', () => {
        const initialDate = '2024-06-01';
        const expectedNextBillingDate = 'July 2, 2024';

        expect(getNextBillingDate(initialDate)).toEqual(expectedNextBillingDate);
    });

    it('should handle end-of-month edge cases correctly', () => {
        const initialDate = '2024-01-31';
        const nextBillingDate = getNextBillingDate(initialDate);
        const expectedNextBillingDate = 'July 1, 2024';
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });

    it('should handle date when it at the current month', () => {
        const initialDate = '2024-06-06';
        const nextBillingDate = getNextBillingDate(initialDate);
        const expectedNextBillingDate = 'June 7, 2024';
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });

    it('should return the next billing date when initial date is invalid', () => {
        const initialDate = 'invalid-date';
        const expectedNextBillingDate = 'July 6, 2024';

        expect(getNextBillingDate(initialDate)).toEqual(expectedNextBillingDate);
    });
});
