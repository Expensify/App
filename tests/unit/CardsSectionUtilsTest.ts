import {addDays, addMonths, format} from 'date-fns';
import getNextBillingDate from '@src/pages/settings/Subscription/CardSection/utils';

describe('getNextBillingDate', () => {
    it('should return the next billing date one month after the initial date', () => {
        const endDate = '2023-01-15';
        const nextBillingDate = getNextBillingDate(endDate);
        expect(nextBillingDate).toBe('February 16, 2023');
    });

    it('should handle end-of-month edge cases correctly', () => {
        const initialDate = '2023-01-31';
        const nextBillingDate = getNextBillingDate(initialDate);
        const expectedNextBillingDate = format(addDays(addMonths(new Date('2023-01-31'), 1), 1), 'MMMM d, yyyy');
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });

    it('should handle invalid dates correctly', () => {
        const initialDate = 'invalid date';
        const nextBillingDate = getNextBillingDate(initialDate);
        const expectedNextBillingDate = format(addDays(addMonths(new Date(), 1), 1), 'MMMM d, yyyy');
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });
});
