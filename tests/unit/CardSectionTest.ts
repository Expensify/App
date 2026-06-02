import {buildPaymentHistoryQuery} from '@src/pages/settings/Subscription/CardSection/CardSection';

describe('buildPaymentHistoryQuery', () => {
    it('uses the current user accountID for the payment history from filter', () => {
        const query = buildPaymentHistoryQuery(12345);

        expect(query).toContain('from:12345');
        expect(query).not.toContain('from:me');
    });

    it('omits the from filter when the current user accountID is unavailable', () => {
        const query = buildPaymentHistoryQuery();

        expect(query).not.toContain('from:');
    });
});
