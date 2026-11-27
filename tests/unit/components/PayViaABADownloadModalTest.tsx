import {act, fireEvent, render, screen} from '@testing-library/react-native';

import PayViaABADownloadModal from '@components/PayViaABADownloadModal';

import HttpsError from '@libs/Errors/HttpsError';
import saveTextFile from '@libs/saveTextFile';

import type {ABAFile, PayViaABAResult} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock('@components/Modal', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@libs/saveTextFile', () => jest.fn(() => Promise.resolve()));

const abaFile: ABAFile = {fileName: 'ABA_Report_123.aba', content: 'ABA file'};
const payViaABAResult: PayViaABAResult = {abaFile, skippedReportIDs: {}};

function renderModal(abaFileRequest: Promise<PayViaABAResult>) {
    render(
        <PayViaABADownloadModal
            abaFileRequest={abaFileRequest}
            getDownloadFailedMessage={(error) => `Failed: ${error?.message ?? 'unknown'}`}
            closeModal={jest.fn()}
            resolveModal={jest.fn()}
        />,
    );
}

describe('PayViaABADownloadModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves the ABA file once it is ready, and again when the user asks for it', async () => {
        // Given an ABA file that is still being generated
        const {promise, resolve} = Promise.withResolvers<PayViaABAResult>();
        renderModal(promise);

        // Then the user is asked to wait and can't close the modal
        expect(screen.getByText('iou.waitForABAFile')).toBeOnTheScreen();
        expect(screen.queryByText('common.cancel')).not.toBeOnTheScreen();

        // When the file arrives
        await act(async () => resolve(payViaABAResult));

        // Then it's saved straight away and the user is told to upload it to their bank
        expect(screen.getByText('iou.successABAFile')).toBeOnTheScreen();
        expect(saveTextFile).toHaveBeenCalledTimes(1);
        expect(saveTextFile).toHaveBeenCalledWith(abaFile);

        // When the user presses Download, e.g. because the automatic download didn't work
        fireEvent.press(screen.getByText('common.download'));

        // Then it's saved again from the file already in hand, since asking for it again would pay the reports again
        expect(saveTextFile).toHaveBeenCalledTimes(2);
    });

    it('tells the user when some submitters have no AUD bank account, so their reports were left out of the file', async () => {
        // Given an ABA file that is still being generated
        const {promise, resolve} = Promise.withResolvers<PayViaABAResult>();
        renderModal(promise);

        // When it arrives without a report whose submitter has no AUD bank account
        await act(async () => resolve({abaFile, skippedReportIDs: {[CONST.ABA_SKIPPED_REPORT_REASON.MISSING_DEPOSIT_ACCOUNT]: ['456']}}));

        // Then the file is still saved for the reports it pays, and the user is asked to get the other submitters to add a bank account
        expect(saveTextFile).toHaveBeenCalledWith(abaFile);
        expect(screen.getByText('iou.successABAFile\n\niou.submittersMissingABADepositAccount')).toBeOnTheScreen();
    });

    it('tells the user when some reports had nothing to pay, alongside any submitters without an AUD bank account', async () => {
        // Given an ABA file that is still being generated
        const {promise, resolve} = Promise.withResolvers<PayViaABAResult>();
        renderModal(promise);

        // When it arrives without one report whose submitter has no AUD bank account and another with nothing to pay
        await act(async () =>
            resolve({
                abaFile,
                skippedReportIDs: {[CONST.ABA_SKIPPED_REPORT_REASON.MISSING_DEPOSIT_ACCOUNT]: ['456'], [CONST.ABA_SKIPPED_REPORT_REASON.NOTHING_TO_PAY]: ['789']},
            }),
        );

        // Then the user is told about both, so they know why each report was left out of the file
        expect(screen.getByText('iou.successABAFile\n\niou.submittersMissingABADepositAccount\n\niou.reportsWithNothingToPayViaABA')).toBeOnTheScreen();
    });

    it("still tells the user about reports left out of the file for a reason the app doesn't know", async () => {
        // Given an ABA file that is still being generated
        const {promise, resolve} = Promise.withResolvers<PayViaABAResult>();
        renderModal(promise);

        // When it arrives without a report the backend skipped for a reason added after this version of the app
        await act(async () => resolve({abaFile, skippedReportIDs: {someNewReason: ['456']}}));

        // Then the user is still told some reports weren't included, since those reports stay unpaid
        expect(screen.getByText('iou.successABAFile\n\niou.reportsLeftOutOfABAFile')).toBeOnTheScreen();
    });

    it("tells the user why the ABA file couldn't be generated", async () => {
        // Given an ABA file the backend refuses to generate
        const {promise, reject} = Promise.withResolvers<PayViaABAResult>();
        renderModal(promise);

        // When the request fails
        await act(async () => reject(new HttpsError({message: 'Missing deposit account'})));

        // Then the user is told why, and there's nothing to save
        expect(screen.getByText('Failed: Missing deposit account')).toBeOnTheScreen();
        expect(saveTextFile).not.toHaveBeenCalled();
    });
});
