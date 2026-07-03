import {fireEvent, render, screen} from '@testing-library/react-native';

import ExportDownloadStatusModal from '@components/ExportDownloadStatusModal';

import fileDownload from '@libs/fileDownload';

import {clearExportDownload, sendExportFileFromConcierge} from '@userActions/Export';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/fileDownload');
jest.mock('@components/RenderHTML', () => {
    function MockRenderHTML({html}: {html: string}) {
        return html;
    }
    return MockRenderHTML;
});
jest.mock('@userActions/Export', () => ({
    sendExportFileFromConcierge: jest.fn(),
    clearExportDownload: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));
const mockOpenConciergeAnywhere = jest.fn();
jest.mock('@hooks/useOpenConciergeAnywhere', () => ({
    __esModule: true,
    default: () => ({
        openConciergeAnywhere: mockOpenConciergeAnywhere,
        isInSidePanel: false,
    }),
}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
    }),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 123, login: 'test@example.com'}),
}));

const mockFileDownload = fileDownload as jest.MockedFunction<typeof fileDownload>;
const mockSendFromConcierge = sendExportFileFromConcierge as jest.MockedFunction<typeof sendExportFileFromConcierge>;
const mockClearExportDownload = clearExportDownload as jest.MockedFunction<typeof clearExportDownload>;

const EXPORT_ID = 'test-export-123';
const CSV_FILE_NAME = 'export_2026-06-09_02-41-38_6a277d629c569.csv';
const PDF_FILE_NAME = 'test-report-file';

function renderModal(props: Partial<React.ComponentProps<typeof ExportDownloadStatusModal>> = {}) {
    return render(
        <ExportDownloadStatusModal
            exportID={EXPORT_ID}
            isVisible
            onClose={jest.fn()}
            {...props}
        />,
    );
}

describe('ExportDownloadStatusModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('renders preparing state with spinner and Send button', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'preparing'});

        renderModal();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.preparingTitle')).toBeTruthy();
        expect(screen.getByText('exportDownload.preparingBody')).toBeTruthy();
        expect(screen.getByText('exportDownload.sendFromConcierge')).toBeTruthy();
    });

    it('is non-dismissible during preparing state', async () => {
        const onClose = jest.fn();
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'preparing'});

        renderModal({onClose});
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.preparingTitle')).toBeTruthy();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('transitions to Concierge state on Send button press', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'preparing'});

        renderModal();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('exportDownload.sendFromConcierge'));

        expect(mockSendFromConcierge).toHaveBeenCalledWith(EXPORT_ID, expect.objectContaining({state: 'preparing'}));
    });

    it('shows Concierge state when shouldSendFromConcierge is true', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'preparing', shouldSendFromConcierge: true});

        renderModal();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.conciergeTitle')).toBeTruthy();
        expect(screen.getByText('exportDownload.conciergeBody')).toBeTruthy();
        expect(screen.getByText('exportDownload.goToConcierge')).toBeTruthy();
        expect(screen.getByText('exportDownload.dismiss')).toBeTruthy();
    });

    it('auto-downloads CSV on ready state transition with csvexport secureType', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'ready', fileName: CSV_FILE_NAME});

        renderModal();
        await waitForBatchedUpdatesWithAct();

        const expectedURLPart = `secure?secureType=csvexport&filename=${encodeURIComponent(CSV_FILE_NAME)}&downloadName=${encodeURIComponent(CSV_FILE_NAME)}`;
        // shouldUnlink (arg 9) is left undefined so the platform default cleans up the temp file; appendTimestamp (arg 10) is false so the OS-recorded download time isn't duplicated in the name.
        expect(mockFileDownload).toHaveBeenCalledWith(
            expect.anything(),
            expect.stringContaining(expectedURLPart),
            CSV_FILE_NAME,
            expect.anything(),
            expect.anything(),
            undefined,
            undefined,
            undefined,
            undefined,
            false,
        );
    });

    it('auto-downloads PDF on ready state transition with pdfreport secureType', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'ready', fileName: PDF_FILE_NAME});

        renderModal();
        await waitForBatchedUpdatesWithAct();

        const expectedURLPart = `secure?secureType=pdfreport&filename=${encodeURIComponent(PDF_FILE_NAME)}&downloadName=${encodeURIComponent(PDF_FILE_NAME)}`;
        // shouldUnlink (arg 9) is left undefined so the platform default cleans up the temp file; appendTimestamp (arg 10) is false so the OS-recorded download time isn't duplicated in the name.
        expect(mockFileDownload).toHaveBeenCalledWith(
            expect.anything(),
            expect.stringContaining(expectedURLPart),
            PDF_FILE_NAME,
            expect.anything(),
            expect.anything(),
            undefined,
            undefined,
            undefined,
            undefined,
            false,
        );
    });

    it('shows ready state with a Download button and no Close button', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'ready', fileName: CSV_FILE_NAME});

        renderModal();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.readyTitle')).toBeTruthy();
        expect(screen.getByText('exportDownload.readyBody')).toBeTruthy();
        expect(screen.getByText('exportDownload.downloadFile')).toBeTruthy();
        // The Close button is removed in the ready state; the modal is dismissible and Download closes it.
        expect(screen.queryByText('exportDownload.close')).toBeNull();
    });

    it('shows failed state with correct failedBody prop', async () => {
        const failedBody = 'The CSV export encountered an error.';
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'failed'});

        renderModal({failedBody});
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.failedTitle')).toBeTruthy();
        expect(screen.getByText(failedBody)).toBeTruthy();
        expect(screen.getByText('exportDownload.close')).toBeTruthy();
    });

    it('retains last state when Onyx key becomes null', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'ready', fileName: CSV_FILE_NAME});

        renderModal();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.readyTitle')).toBeTruthy();

        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, null);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.readyTitle')).toBeTruthy();
    });

    it('"Go to Concierge" navigates and closes', async () => {
        const onClose = jest.fn();
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'preparing', shouldSendFromConcierge: true});

        renderModal({onClose});
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('exportDownload.goToConcierge'));

        expect(onClose).toHaveBeenCalled();
        expect(mockOpenConciergeAnywhere).toHaveBeenCalled();
    });

    it('shows partial failure body when failedReportCount > 0 in ready state', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {
            state: 'ready',
            fileName: PDF_FILE_NAME,
            reportCount: 3,
            failedReportCount: 2,
        });

        renderModal();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.readyTitle')).toBeTruthy();
        expect(screen.queryByText('exportDownload.readyBody')).toBeNull();
    });

    it('shows standard ready body when failedReportCount is 0', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {
            state: 'ready',
            fileName: PDF_FILE_NAME,
            reportCount: 5,
            failedReportCount: 0,
        });

        renderModal();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.readyTitle')).toBeTruthy();
        expect(screen.getByText('exportDownload.readyBody')).toBeTruthy();
    });

    it('Download file button downloads and closes the modal, delegating the clear to the parent', async () => {
        const onClose = jest.fn();
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'ready', fileName: CSV_FILE_NAME});

        renderModal({onClose});
        await waitForBatchedUpdatesWithAct();

        // Ignore the automatic download that fires when the export becomes ready, so we only assert the button's effect.
        mockFileDownload.mockClear();

        fireEvent.press(screen.getByText('exportDownload.downloadFile'));

        expect(mockFileDownload).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
        // Clearing the export download is owned by the parent's onClose handler, so the modal must not clear it itself (avoids a duplicate write).
        expect(mockClearExportDownload).not.toHaveBeenCalled();
    });

    it('Close button in the failed state closes the modal and delegates the clear to the parent', async () => {
        const onClose = jest.fn();
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'failed'});

        renderModal({onClose});
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('exportDownload.close'));

        expect(onClose).toHaveBeenCalled();
        expect(mockClearExportDownload).not.toHaveBeenCalled();
    });
});
