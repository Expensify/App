import {getWiseQuote} from '@libs/actions/Wise';
import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

jest.mock('@libs/API', () => ({
    read: jest.fn(),
}));

describe('actions/Wise getWiseQuote', () => {
    it('drops the reason the last quote failed when it asks Wise for a new quote', () => {
        // Given a report whose last quote Wise refused because it can't pay a bank account in Kenyan shillings
        const report: Report = {
            reportID: '1',
            currency: CONST.CURRENCY.USD,
            total: -1000,
            reimbursableTotal: -1000,
            wiseQuoteError: {code: 'unavailable', paymentCurrency: 'KES'},
        };

        // When the admin pays the report again, which asks Wise for a new quote
        getWiseQuote(report, true, false);

        // Then the request clears the old reason right away, so the card shows the loader while Wise prices the payment again
        expect(API.read).toHaveBeenCalledWith(
            READ_COMMANDS.GET_WISE_QUOTE,
            {reportID: report.reportID, full: true},
            expect.objectContaining({
                optimisticData: [expect.objectContaining({key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, value: expect.objectContaining({wiseQuoteError: null})})],
            }),
        );
    });
});
