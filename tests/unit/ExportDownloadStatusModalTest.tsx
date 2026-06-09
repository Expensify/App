import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ExportDownloadStatusModal from '@components/ExportDownloadStatusModal';
import fileDownload from '@libs/fileDownload';
import {clearExportDownload, sendExportFileFromConcierge} from '@userActions/Export';
import {navigateToConciergeChat} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/fileDownload');
jest.mock('@userActions/Export', () => ({
    sendExportFileFromConcierge: jest.fn(),
    clearExportDownload: jest.fn(),
}));
jest.mock('@userActions/Report', () => ({
    navigateToConciergeChat: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
    }),
}));

const mockFileDownload = fileDownload as jest.MockedFunction<typeof fileDownload>;
const mockSendFromConcierge = sendExportFileFromConcierge as jest.MockedFunction<typeof sendExportFileFromConcierge>;
const mockClearExportDownload = clearExportDownload as jest.MockedFunction<typeof clearExportDownload>;
const mockNavigateToConcierge = navigateToConciergeChat as jest.MockedFunction<typeof navigateToConciergeChat>;

const EXPORT_ID = 'test-export-123';
const FILE_NAME = 'export_2026-06-09_02-41-38_6a277d629c569.csv';

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

    it('auto-downloads on ready state transition with a secure URL built from the fileName', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'ready', fileName: FILE_NAME});

        renderModal();
        await waitForBatchedUpdatesWithAct();

        const expectedURLPart = `secure?secureType=csvexport&filename=${encodeURIComponent(FILE_NAME)}&downloadName=${encodeURIComponent(FILE_NAME)}`;
        expect(mockFileDownload).toHaveBeenCalledWith(expect.anything(), expect.stringContaining(expectedURLPart), FILE_NAME);
    });

    it('shows ready state with Download and Close buttons', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'ready', fileName: FILE_NAME});

        renderModal();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.readyTitle')).toBeTruthy();
        expect(screen.getByText('exportDownload.readyBody')).toBeTruthy();
        expect(screen.getByText('exportDownload.downloadFile')).toBeTruthy();
        expect(screen.getByText('exportDownload.close')).toBeTruthy();
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
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'ready', fileName: FILE_NAME});

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
        expect(mockNavigateToConcierge).toHaveBeenCalled();
    });

    it('Close button calls clearExportDownload', async () => {
        const onClose = jest.fn();
        await Onyx.set(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}`, {state: 'ready', fileName: FILE_NAME});

        renderModal({onClose});
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('exportDownload.close'));

        expect(mockClearExportDownload).toHaveBeenCalledWith(EXPORT_ID, expect.objectContaining({state: 'ready'}));
        expect(onClose).toHaveBeenCalled();
    });
});
