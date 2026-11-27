import {render} from '@testing-library/react-native';

import WiseQuoteRequiredPayModal from '@components/WiseQuoteRequiredPayModal';

import usePayWithWiseQuote from '@hooks/usePayWithWiseQuote';

import type {PayMoneyRequestFunctionParams} from '@libs/actions/IOU/PayMoneyRequest';
import {followPaymentWithoutWiseQuote} from '@libs/actions/PaymentsWithoutWiseQuote';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/usePayWithWiseQuote', () => jest.fn());

const REPORT_ID = '1';
const mockConfirmWiseQuoteAndPay = jest.fn();
jest.mocked(usePayWithWiseQuote).mockReturnValue({payWithWiseQuote: jest.fn(), confirmWiseQuoteAndPay: mockConfirmWiseQuoteAndPay});

describe('WiseQuoteRequiredPayModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockConfirmWiseQuoteAndPay.mockClear();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('shows the quote for the payment the backend asked one for, once', async () => {
        // Given a payment sent from a Wise account without a quote
        const payment = createMock<PayMoneyRequestFunctionParams>({iouReport: createMock<Report>({reportID: REPORT_ID})});
        followPaymentWithoutWiseQuote(REPORT_ID, payment);
        render(<WiseQuoteRequiredPayModal />);

        // When the backend asks for a quote
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_QUOTE_REQUIRED, {reportID: REPORT_ID});
        await waitForBatchedUpdatesWithAct();

        // Then the quote opens for that same payment, and the signal is cleared so it doesn't open again
        expect(mockConfirmWiseQuoteAndPay).toHaveBeenCalledTimes(1);
        expect(mockConfirmWiseQuoteAndPay).toHaveBeenCalledWith(payment);
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_QUOTE_REQUIRED)).toBeUndefined();
    });

    it('does nothing when the payment is not kept', async () => {
        // Given no payment kept for the report
        render(<WiseQuoteRequiredPayModal />);

        // When the signal arrives
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_QUOTE_REQUIRED, {reportID: REPORT_ID});
        await waitForBatchedUpdatesWithAct();

        // Then no quote opens
        expect(mockConfirmWiseQuoteAndPay).not.toHaveBeenCalled();
    });
});
