/** Covers receipt loading and invalid lookups without mounting the attachment viewer. */
import {render} from '@testing-library/react-native';

import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import BillingReceiptModalContent from '@pages/media/AttachmentModalScreen/routes/BillingReceiptModalContent';

import {openPaymentDetailsPage} from '@userActions/Subscription';

import CONST from '@src/CONST';
import type {Purchase} from '@src/types/onyx/PurchaseList';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({dismissModal: jest.fn()}));
jest.mock('@pages/media/AttachmentModalScreen/AttachmentModalContainer', () => jest.fn(() => null));
jest.mock('@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment', () => jest.fn(() => jest.fn()));
jest.mock('@userActions/Subscription', () => ({openPaymentDetailsPage: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
    useRoute: () => ({params: {purchaseID: '1'}}),
    useNavigation: () => ({}),
}));

function setPurchase(purchase?: Partial<Purchase>) {
    const purchaseID = 1;
    jest.mocked(useOnyx).mockReturnValue(createMock<ReturnType<typeof useOnyx>>([purchase ? {[purchaseID]: purchase} : undefined, {status: 'loaded'}]));
}

describe('BillingReceiptModalContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useNetwork).mockReturnValue(createMock<ReturnType<typeof useNetwork>>({isOffline: false}));
        setPurchase();
    });

    it('waits for loading before dismissing an ID-less completed lookup', () => {
        // Given an uncached receipt whose lookup has not completed
        const view = render(<BillingReceiptModalContent />);
        expect(FullScreenLoadingIndicator).toHaveBeenCalled();
        expect(openPaymentDetailsPage).toHaveBeenCalledWith(1);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
        expect(AttachmentModalContainer).not.toHaveBeenCalled();

        // When the lookup completes without returning purchase data
        setPurchase({isLoaded: true});
        view.rerender(<BillingReceiptModalContent />);

        // Then the modal renders nothing and dismisses without retrying or changing hook order
        expect(view.toJSON()).toBeNull();
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(openPaymentDetailsPage).toHaveBeenCalledTimes(1);
        expect(AttachmentModalContainer).not.toHaveBeenCalled();
    });

    it('renders a persisted completed placeholder as empty content and dismisses', () => {
        // Given an invalid completed lookup restored before the modal mounts
        setPurchase({isLoaded: true});

        // When the receipt modal renders
        const view = render(<BillingReceiptModalContent />);

        // Then no receipt or loading UI is mounted and no lookup repeats
        expect(view.toJSON()).toBeNull();
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(FullScreenLoadingIndicator).not.toHaveBeenCalled();
        expect(AttachmentModalContainer).not.toHaveBeenCalled();
        expect(openPaymentDetailsPage).not.toHaveBeenCalled();
    });

    it.each([
        {billingType: undefined, title: 'common.receipt'},
        {billingType: CONST.BILLING.TYPE_INVOICING, title: 'common.invoice'},
    ])('preserves loaded $title preview and download props', ({billingType, title}) => {
        // Given a pending lookup that will return a valid receipt or invoice
        const view = render(<BillingReceiptModalContent />);
        setPurchase({purchaseID: 1, isLoaded: true, message: {billingType}, receipt: {receiptID: 100, source: 'https://example.com/receipt.pdf'}});

        // When the complete purchase arrives after the loading render
        view.rerender(<BillingReceiptModalContent />);

        // Then preview metadata and the download callback remain available without dismissing
        expect(AttachmentModalContainer).toHaveBeenCalled();
        expect(jest.mocked(AttachmentModalContainer).mock.calls.at(-1)?.[0].contentProps).toEqual(
            expect.objectContaining({
                source: 'https://example.com/receipt.pdf',
                originalFileName: 'receipt.pdf',
                headerTitle: title,
                shouldShowNotFoundPage: false,
                shouldAllowDownloadOutsideReportContext: true,
            }),
        );
        expect(jest.mocked(AttachmentModalContainer).mock.calls.at(-1)?.[0].contentProps?.onDownloadAttachment).toEqual(expect.any(Function));
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('retains not-found content for a loaded purchase with an ID but no receipt', () => {
        // Given an existing purchase for which no receipt source can be resolved
        setPurchase({purchaseID: 1, isLoaded: true, message: {}});

        // When opening its receipt
        render(<BillingReceiptModalContent />);

        // Then the existing not-found view is selected rather than dismissing a valid purchase
        expect(jest.mocked(AttachmentModalContainer).mock.calls.at(-1)?.[0].contentProps?.shouldShowNotFoundPage).toBe(true);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('keeps an offline uncached lookup loading until reconnect and completion', () => {
        // Given an uncached receipt opened offline
        jest.mocked(useNetwork).mockReturnValue(createMock<ReturnType<typeof useNetwork>>({isOffline: true}));
        const view = render(<BillingReceiptModalContent />);
        expect(openPaymentDetailsPage).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();

        // When connectivity returns and the requested purchase cannot be found
        jest.mocked(useNetwork).mockReturnValue(createMock<ReturnType<typeof useNetwork>>({isOffline: false}));
        view.rerender(<BillingReceiptModalContent />);
        expect(openPaymentDetailsPage).toHaveBeenCalledWith(1);
        setPurchase({isLoaded: true});
        view.rerender(<BillingReceiptModalContent />);

        // Then completion dismisses the modal without trapping the user in loading
        expect(view.toJSON()).toBeNull();
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(openPaymentDetailsPage).toHaveBeenCalledTimes(1);
    });
});
