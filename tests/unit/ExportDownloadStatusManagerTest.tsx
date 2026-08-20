import {fireEvent, render, screen} from '@testing-library/react-native';

import ExportDownloadStatusManager from '@components/ExportDownloadStatusManager';

import {clearExportDownload, markExportDownloadSurfaced, sendExportFileFromConcierge} from '@userActions/Export';
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
    markExportDownloadSurfaced: jest.fn(),
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
const mockMarkExportDownloadSurfaced = jest.mocked(markExportDownloadSurfaced);
const mockSendFromConcierge = jest.mocked(sendExportFileFromConcierge);

const EXPORT_ID = 'test-export-123';
const EXPORT_KEY = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${EXPORT_ID}` as const;
const CSV_FILE_NAME = 'export_2026-06-09_02-41-38_6a277d629c569.csv';

describe('ExportDownloadStatusManager', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
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

    it('renders the Concierge confirmation when shouldSendFromConcierge is set and it has not been surfaced', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'preparing', shouldSendFromConcierge: true});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('exportDownload.conciergeTitle')).toBeTruthy();
    });

    it('renders nothing for a Concierge record that has already been surfaced', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'preparing', shouldSendFromConcierge: true, hasBeenSurfaced: true});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText('exportDownload.conciergeTitle')).toBeNull();
        expect(screen.queryByText('exportDownload.preparingTitle')).toBeNull();
    });

    it('dismissing a preparing export is a no-op: does not clear the record or mark it surfaced', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'preparing'});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('exportDownload.sendFromConcierge'));
        expect(mockSendFromConcierge).toHaveBeenCalled();
        expect(mockClearExportDownload).not.toHaveBeenCalled();
        expect(mockMarkExportDownloadSurfaced).not.toHaveBeenCalled();
    });

    it('dismissing a Concierge record marks it surfaced and never clears the underlying export', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'preparing', shouldSendFromConcierge: true});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('exportDownload.dismiss'));

        expect(mockMarkExportDownloadSurfaced).toHaveBeenCalledWith(EXPORT_ID);
        expect(mockClearExportDownload).not.toHaveBeenCalled();
    });

    it('dismissing a ready export clears the underlying export', async () => {
        await Onyx.set(EXPORT_KEY, {state: 'ready', fileName: CSV_FILE_NAME});

        render(<ExportDownloadStatusManager />);
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('exportDownload.downloadFile'));

        expect(mockClearExportDownload).toHaveBeenCalledWith(EXPORT_ID, expect.objectContaining({state: 'ready'}));
        expect(mockMarkExportDownloadSurfaced).not.toHaveBeenCalled();
    });
});
