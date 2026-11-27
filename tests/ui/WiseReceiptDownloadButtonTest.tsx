import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import WiseReceiptDownloadButton from '@components/WisePaymentSummary/components/WiseReceiptDownloadButton';

import useNetwork from '@hooks/useNetwork';

import fileDownload from '@libs/fileDownload';
import {showGeneralErrorAlert} from '@libs/fileDownload/FileUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/fileDownload', () => jest.fn(() => Promise.resolve()));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@libs/fileDownload/FileUtils', () => ({showGeneralErrorAlert: jest.fn()}));

const REPORT_ID = '1';

function buildPayAction(isWiseReceiptAvailable: boolean): ReportAction {
    return createMock<ReportAction>({
        reportActionID: '10',
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        created: '2026-11-05 10:00:00.000',
        message: {
            type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
            paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            fee: 129,
            rate: 0.7743,
            debitedAmount: 13044,
            creditedAmount: 10000,
            currency: CONST.CURRENCY.USD,
            creditedCurrency: CONST.CURRENCY.GBP,
            isWiseReceiptAvailable,
        },
    });
}

async function renderButton(isWiseReceiptAvailable: boolean) {
    const payAction = buildPayAction(isWiseReceiptAvailable);
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[payAction.reportActionID]: payAction});
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WiseReceiptDownloadButton reportID={REPORT_ID} />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('WiseReceiptDownloadButton', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('stays hidden until Wise provides the receipt', async () => {
        // Given a Wise payment whose transfer has not left Wise yet, so Wise has no receipt for it
        await renderButton(false);

        // Then there is nothing to download, so the payment details show no download button
        expect(screen.queryByText('Download receipt')).toBeNull();
    });

    it('downloads the receipt PDF the server responds with once Wise provides it', async () => {
        // Given a Wise payment whose transfer has left Wise, so the backend flagged its receipt as available
        await renderButton(true);

        // When the admin taps Download receipt
        fireEvent.press(screen.getByText('Download receipt'));
        await waitForBatchedUpdatesWithAct();

        // Then the receipt of this report is posted for, and the PDF in the response is saved, since the server keeps no copy to link to
        expect(fileDownload).toHaveBeenCalledWith(
            expect.anything(),
            expect.stringContaining('GetWiseTransferReceipt'),
            `Wise_Receipt_${REPORT_ID}.pdf`,
            '',
            false,
            expect.any(FormData),
            CONST.NETWORK.METHOD.POST,
            expect.any(Function),
        );
        const [, , , , , formData] = jest.mocked(fileDownload).mock.calls.at(0) ?? [];
        expect(formData?.get('reportID')).toBe(REPORT_ID);
    });

    it('shows an error when the server has no receipt to download', async () => {
        // Given a receipt flagged as available, but the server responds with an error because Wise has no receipt for the transfer
        jest.mocked(fileDownload).mockImplementationOnce((translate, url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed) => {
            onDownloadFailed?.();
            return Promise.resolve();
        });
        await renderButton(true);

        // When the admin taps Download receipt
        fireEvent.press(screen.getByText('Download receipt'));
        await waitForBatchedUpdatesWithAct();

        // Then the admin is told the download failed, instead of the web download opening the command URL in a new tab
        expect(showGeneralErrorAlert).toHaveBeenCalled();
    });

    it('hides while offline, because the server has to fetch the receipt from Wise', async () => {
        // Given an available receipt while the device is offline
        jest.mocked(useNetwork).mockReturnValueOnce({isOffline: true});
        await renderButton(true);

        // Then there is no download button to press
        expect(screen.queryByText('Download receipt')).toBeNull();
    });
});
