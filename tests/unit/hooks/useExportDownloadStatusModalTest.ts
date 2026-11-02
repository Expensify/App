import {act, renderHook} from '@testing-library/react-native';
import type {ReactElement} from 'react';
import useExportDownloadStatusModal from '@hooks/useExportDownloadStatusModal';
import {clearExportDownload} from '@libs/actions/Export';
import CONST from '@src/CONST';

const mockClearExportDownload = jest.mocked(clearExportDownload);

jest.mock('@libs/actions/Export', () => ({
    clearExportDownload: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

let mockExportDownload: {state?: string; shouldSendFromConcierge?: boolean} | undefined;
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [mockExportDownload],
}));

type ExportDownloadStatusModalProps = {exportID: string; onClose: () => void};

describe('useExportDownloadStatusModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExportDownload = undefined;
    });

    it('renders no modal until an export is tracked', () => {
        const {result} = renderHook(() => useExportDownloadStatusModal());
        expect(result.current.exportDownloadStatusModal).toBeNull();
    });

    it('renders the status modal for the tracked export', () => {
        const {result} = renderHook(() => useExportDownloadStatusModal());

        act(() => {
            result.current.trackExport('export-1');
        });

        const modal: ReactElement<ExportDownloadStatusModalProps> | null = result.current.exportDownloadStatusModal;
        expect(modal?.props.exportID).toBe('export-1');
    });

    it('clears the download, runs cleanup and hides the modal on close', () => {
        const onCleanup = jest.fn();
        const {result} = renderHook(() => useExportDownloadStatusModal(onCleanup));

        act(() => {
            result.current.trackExport('export-1');
        });
        const modal: ReactElement<ExportDownloadStatusModalProps> | null = result.current.exportDownloadStatusModal;

        act(() => {
            modal?.props.onClose();
        });

        expect(mockClearExportDownload).toHaveBeenCalledWith('export-1', undefined);
        expect(onCleanup).toHaveBeenCalled();
        expect(result.current.exportDownloadStatusModal).toBeNull();
    });

    it('keeps the export NVP intact when sending via Concierge', () => {
        mockExportDownload = {state: CONST.EXPORT_DOWNLOAD.STATE.READY, shouldSendFromConcierge: true};
        const onCleanup = jest.fn();
        const {result} = renderHook(() => useExportDownloadStatusModal(onCleanup));

        act(() => {
            result.current.trackExport('export-1');
        });
        const modal: ReactElement<ExportDownloadStatusModalProps> | null = result.current.exportDownloadStatusModal;

        act(() => {
            modal?.props.onClose();
        });

        expect(mockClearExportDownload).not.toHaveBeenCalled();
        expect(onCleanup).toHaveBeenCalled();
        expect(result.current.exportDownloadStatusModal).toBeNull();
    });

    it('keeps the modal open and skips cleanup while the export is still preparing', () => {
        mockExportDownload = {state: CONST.EXPORT_DOWNLOAD.STATE.PREPARING};
        const onCleanup = jest.fn();
        const {result} = renderHook(() => useExportDownloadStatusModal(onCleanup));

        act(() => {
            result.current.trackExport('export-1');
        });
        const modal: ReactElement<ExportDownloadStatusModalProps> | null = result.current.exportDownloadStatusModal;

        act(() => {
            modal?.props.onClose();
        });

        expect(mockClearExportDownload).not.toHaveBeenCalled();
        expect(onCleanup).not.toHaveBeenCalled();
        expect(result.current.exportDownloadStatusModal).not.toBeNull();
    });
});
