import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import WiseReceiptDownloadButton from '@components/WisePaymentSummary/components/WiseReceiptDownloadButton';

import useNetwork from '@hooks/useNetwork';

import fileDownload from '@libs/fileDownload';
import {showGeneralErrorAlert} from '@libs/fileDownload/FileUtils';

import {getWiseTransferReceiptFileName} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/Wise', () => ({
    getWiseTransferReceiptFileName: jest.fn(() => Promise.resolve('wise-receipt-123.pdf')),
}));
jest.mock('@libs/fileDownload', () => jest.fn(() => Promise.resolve()));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@libs/fileDownload/FileUtils', () => ({showGeneralErrorAlert: jest.fn()}));

const REPORT_ID = '1';
const ACCOUNT_ID = 1;
const LOGIN = 'admin@company.com';

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

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: LOGIN, encryptedAuthToken: 'token'});
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

    it('downloads the receipt the server saved once Wise provides it', async () => {
        // Given a Wise payment whose transfer has left Wise, so the backend flagged its receipt as available
        await renderButton(true);

        // When the admin taps Download receipt
        fireEvent.press(screen.getByText('Download receipt'));
        await waitForBatchedUpdatesWithAct();

        // Then the server is asked for the receipt of this report, and the PDF it saved is downloaded through the secure PDF link
        expect(getWiseTransferReceiptFileName).toHaveBeenCalledWith(REPORT_ID);
        expect(fileDownload).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('filename=wise-receipt-123.pdf'), `Wise_Receipt_${REPORT_ID}.pdf`, '', expect.anything());
    });

    it('shows an error instead of downloading when the server saved no receipt', async () => {
        // Given a receipt flagged as available, but the server comes back without a file for it
        jest.mocked(getWiseTransferReceiptFileName).mockResolvedValueOnce(undefined);
        await renderButton(true);

        // When the admin taps Download receipt
        fireEvent.press(screen.getByText('Download receipt'));
        await waitForBatchedUpdatesWithAct();

        // Then the admin is told the download failed, and nothing is downloaded
        expect(showGeneralErrorAlert).toHaveBeenCalled();
        expect(fileDownload).not.toHaveBeenCalled();
    });

    it('hides while offline, because the server has to fetch the receipt from Wise', async () => {
        // Given an available receipt while the device is offline
        jest.mocked(useNetwork).mockReturnValueOnce({isOffline: true});
        await renderButton(true);

        // Then there is no download button to press
        expect(screen.queryByText('Download receipt')).toBeNull();
    });
});
