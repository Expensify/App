import {act, fireEvent, render, screen} from '@testing-library/react-native';

import PayViaABADownloadModal from '@components/PayViaABADownloadModal';

import HttpsError from '@libs/Errors/HttpsError';
import saveTextFile from '@libs/saveTextFile';

import type {ABAFile} from '@userActions/IOU/PayMoneyRequest';

import React from 'react';

jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock('@components/Modal', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@libs/saveTextFile', () => jest.fn(() => Promise.resolve()));

const abaFile: ABAFile = {fileName: 'ABA_Report_123.aba', content: 'ABA file'};

function renderModal(abaFileRequest: Promise<ABAFile | undefined>, closeModal = jest.fn()) {
    render(
        <PayViaABADownloadModal
            abaFileRequest={abaFileRequest}
            getDownloadFailedMessage={(error) => `Failed: ${error?.message ?? 'unknown'}`}
            closeModal={closeModal}
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
        const {promise, resolve} = Promise.withResolvers<ABAFile | undefined>();
        renderModal(promise);

        // Then the user is asked to wait
        expect(screen.getByText('iou.waitForABAFile')).toBeOnTheScreen();

        // When the file arrives
        await act(async () => resolve(abaFile));

        // Then it's saved straight away and the user is told to upload it to their bank
        expect(screen.getByText('iou.successABAFile')).toBeOnTheScreen();
        expect(saveTextFile).toHaveBeenCalledTimes(1);
        expect(saveTextFile).toHaveBeenCalledWith(abaFile);

        // When the user presses Download, e.g. because the automatic download didn't work
        fireEvent.press(screen.getByText('common.download'));

        // Then it's saved again from the file already in hand, since asking for it again would pay the reports again
        expect(saveTextFile).toHaveBeenCalledTimes(2);
    });

    it("tells the user why the ABA file couldn't be generated", async () => {
        // Given an ABA file the backend refuses to generate
        const {promise, reject} = Promise.withResolvers<ABAFile | undefined>();
        renderModal(promise);

        // When the request fails
        await act(async () => reject(new HttpsError({message: 'Missing deposit account'})));

        // Then the user is told why, and there's nothing to save
        expect(screen.getByText('Failed: Missing deposit account')).toBeOnTheScreen();
        expect(saveTextFile).not.toHaveBeenCalled();
    });

    it("closes when the reports can't be paid at all", async () => {
        // Given a request that will end without a file, like when billing restrictions stop the payment
        const {promise, resolve} = Promise.withResolvers<ABAFile | undefined>();
        const closeModal = jest.fn();
        renderModal(promise, closeModal);

        // When the request ends
        await act(async () => resolve(undefined));

        // Then the modal closes, since there's no file to wait for
        expect(closeModal).toHaveBeenCalled();
    });
});
