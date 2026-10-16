import {fireEvent, render, screen} from '@testing-library/react-native';

import ExportDownloadStatusManager from '@components/ExportDownloadStatusManager';

import {clearExportDownload, sendExportFileFromConcierge, wasExportInitiatedLocally} from '@userActions/Export';
import type * as Modal from '@userActions/Modal';

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
    wasExportInitiatedLocally: jest.fn(() => false),
}));
jest.mock('@userActions/Modal', () => ({
    ...jest.requireActual<typeof Modal>('@userActions/Modal'),
    close: jest.fn((cb?: () => void) => cb?.()),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));
jest.mock('@hooks/useOpenConciergeAnywhere', () => ({
    __esModule: true,
    default: () => ({
        openConciergeAnywhere: jest.fn(),
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
jest.mock('@libs/ActiveClientManager', () => ({
    init: jest.fn(),
    isReady: jest.fn(() => Promise.resolve()),
    isClientTheLeader: jest.fn(() => true),
}));

const mockClearExportDownload = jest.mocked(clearExportDownload);
const mockSendFromConcierge = jest.mocked(sendExportFileFromConcierge);
const mockWasExportInitiatedLocally = jest.mocked(wasExportInitiatedLocally);

const EXPORT_ID = 'test-export-123';
const EXPORT_KEY = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}` as const;
const CSV_FILE_NAME = 'export_2026-06-09_02-41-38_6a277d629c569.csv';

describe('ExportDownloadStatusManager', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockWasExportInitiatedLocally.mockReturnValue(false);
        await Onyx.clear();
    });

    it('renders the modal for a preparing export', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'preparing'});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.preparingTitle')).toBeTruthy();
    });

    it('renders the modal for a ready export', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'ready', fileName: CSV_FILE_NAME});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.readyTitle')).toBeTruthy();
    });

    it('renders nothing for a Concierge hand-off in any state (worker owns delivery and failure notice)', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'preparing', shouldSendFromConcierge: true});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText('exportDownload.conciergeTitle')).toBeNull();
        expect(screen.queryByText('exportDownload.preparingTitle')).toBeNull();
    });

    it('renders nothing for a failed export (no dedicated UI for failed non-Concierge state)', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'failed'});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText('exportDownload.failedTitle')).toBeNull();
    });

    it('dismissing a preparing export is a no-op: does not clear the record or mark it surfaced', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'preparing'});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('exportDownload.sendFromConcierge'));
        expect(mockSendFromConcierge).toHaveBeenCalled();
        expect(mockClearExportDownload).not.toHaveBeenCalled();
    });

    it('dismissing a ready export clears the underlying export', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'ready', fileName: CSV_FILE_NAME});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('exportDownload.downloadFile'));

        expect(mockClearExportDownload).toHaveBeenCalledWith(EXPORT_ID, expect.objectContaining({state: 'ready'}));
    });

    it('closing after hand-off to Concierge drops the modal without clearing the record', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'preparing'});
        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        // Hand-off to Concierge
        await Onyx.merge(EXPORT_KEY, {shouldSendFromConcierge: true});
        await waitForBatchedUpdatesWithAct();

        // Trigger onClose and assert the record is preserved.
        fireEvent.press(screen.getByText('exportDownload.dismiss'));
        expect(mockClearExportDownload).not.toHaveBeenCalled();
    });

    it('resets and resurfaces a new export after the tracked record is removed', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'preparing'});
        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        await Onyx.set(EXPORT_KEY, null);
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText('exportDownload.readyTitle')).toBeNull();

        const SECOND_KEY = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}second-export` as const;
        mockWasExportInitiatedLocally.mockImplementation((id) => id === 'second-export');
        await Onyx.set(SECOND_KEY, {state: 'preparing'});
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('exportDownload.preparingTitle')).toBeTruthy();
    });

    it('does not surface an export that appears after load when this tab did not start it', async () => {
        // Tab loads with no export in Onyx, so nothing is in the at-load snapshot.
        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        // Another tab starts an export. It lands in this tab's Onyx, but this tab did not initiate it.
        await Onyx.set(EXPORT_KEY, {state: 'preparing'});
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText('exportDownload.preparingTitle')).toBeNull();
    });

    it('surfaces an export this tab started even though it appears after load', async () => {
        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        mockWasExportInitiatedLocally.mockImplementation((id) => id === EXPORT_ID);
        await Onyx.set(EXPORT_KEY, {state: 'preparing'});
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.preparingTitle')).toBeTruthy();
    });
});
