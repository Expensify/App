import {renderHook} from '@testing-library/react-native';

import usePayWithWiseQuote from '@hooks/usePayWithWiseQuote';
import useWiseQuoteConfirmModal from '@hooks/useWiseQuoteConfirmModal';

import {payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import type {PayMoneyRequestFunctionParams} from '@libs/actions/IOU/PayMoneyRequest';
import {shouldConfirmWiseQuoteBeforePaying} from '@libs/BankAccountUtils';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import createMock from '../../utils/createMock';

jest.mock('@libs/actions/IOU/PayMoneyRequest', () => ({
    payMoneyRequest: jest.fn(),
}));
jest.mock('@libs/actions/Wise', () => ({
    getWiseQuote: jest.fn(),
}));
jest.mock('@libs/BankAccountUtils', () => ({
    shouldConfirmWiseQuoteBeforePaying: jest.fn(),
}));
jest.mock('@hooks/useWiseQuoteConfirmModal', () => jest.fn());

const mockPayMoneyRequest = jest.mocked(payMoneyRequest);
const mockShouldConfirmWiseQuoteBeforePaying = jest.mocked(shouldConfirmWiseQuoteBeforePaying);
type ShowWiseQuoteConfirmModal = ReturnType<typeof useWiseQuoteConfirmModal>['showWiseQuoteConfirmModal'];
const mockShowWiseQuoteConfirmModal = jest.fn<ReturnType<ShowWiseQuoteConfirmModal>, Parameters<ShowWiseQuoteConfirmModal>>();
jest.mocked(useWiseQuoteConfirmModal).mockReturnValue({showWiseQuoteConfirmModal: mockShowWiseQuoteConfirmModal, showWiseQuoteCarouselModal: jest.fn()});

const WISE_QUOTE_ID = 'quote1';

function buildParams(onPaymentSent: () => void) {
    return {
        ...createMock<PayMoneyRequestFunctionParams>({
            paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            iouReport: createMock<Report>({reportID: '1'}),
        }),
        onPaymentSent,
    };
}

describe('usePayWithWiseQuote', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('runs onPaymentSent right after paying when no quote needs confirming', () => {
        // Given a report paid in the bank account currency, so no Wise quote is shown
        mockShouldConfirmWiseQuoteBeforePaying.mockReturnValue(false);
        const callOrder: string[] = [];
        mockPayMoneyRequest.mockImplementation(() => {
            callOrder.push('pay');
            return undefined;
        });
        const {result} = renderHook(() => usePayWithWiseQuote());

        // When the admin pays
        result.current.payWithWiseQuote(buildParams(() => callOrder.push('paymentSent')));

        // Then the payment is queued first, so a Search refresh in onPaymentSent sees the paid report
        expect(callOrder).toEqual(['pay', 'paymentSent']);
        expect(mockShowWiseQuoteConfirmModal).not.toHaveBeenCalled();
    });

    it('waits for the quote to be confirmed before paying and running onPaymentSent', () => {
        // Given a report with an expense in another currency than the bank account
        mockShouldConfirmWiseQuoteBeforePaying.mockReturnValue(true);
        const onPaymentSent = jest.fn();
        const {result} = renderHook(() => usePayWithWiseQuote());

        // When the admin pays, which only opens the quote modal
        result.current.payWithWiseQuote(buildParams(onPaymentSent));

        // Then nothing is paid or refreshed while the quote is on screen, which also covers the admin cancelling it
        expect(mockShowWiseQuoteConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockPayMoneyRequest).not.toHaveBeenCalled();
        expect(onPaymentSent).not.toHaveBeenCalled();

        // When the admin confirms the quote
        mockShowWiseQuoteConfirmModal.mock.calls.at(0)?.at(0)?.onConfirm(WISE_QUOTE_ID);

        // Then the report is paid with that quote and onPaymentSent runs after it
        expect(mockPayMoneyRequest).toHaveBeenCalledWith(expect.objectContaining({wiseQuoteID: WISE_QUOTE_ID}));
        expect(mockPayMoneyRequest).not.toHaveBeenCalledWith(expect.objectContaining({onPaymentSent}));
        expect(onPaymentSent).toHaveBeenCalledTimes(1);
        expect(mockPayMoneyRequest.mock.invocationCallOrder.at(0)).toBeLessThan(onPaymentSent.mock.invocationCallOrder.at(0) ?? 0);
    });
});
