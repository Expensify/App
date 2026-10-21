import {act, renderHook} from '@testing-library/react-native';

import FileDownloadModal from '@components/Modal/FileDownloadModal';
import {ModalProvider} from '@components/Modal/Global/ModalContext';

import useOnyx from '@hooks/useOnyx';
import useReportPDFDownloadModal from '@hooks/useReportPDFDownloadModal';
import useStallLogger from '@hooks/useStallLogger';

import {downloadReportPDF} from '@libs/actions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// Counts real mounts, so a test can tell an in-place props update apart from a remount.
const mockOnFileDownloadModalMount = jest.fn();
jest.mock('@components/Modal/FileDownloadModal', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    return jest.fn(() => {
        useEffect(() => {
            mockOnFileDownloadModalMount();
        }, []);
        return null;
    });
});
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useStallLogger', () => jest.fn());
jest.mock('@libs/actions/Report', () => ({downloadReportPDF: jest.fn()}));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'employee@mail.com'})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const REPORT_ID = '1';
const PDF_FILENAME_KEY = `${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${REPORT_ID}`;

let mockOnyxValues: Record<string, unknown> = {};

describe('useReportPDFDownloadModal', () => {
    const mockedFileDownloadModal = jest.mocked(FileDownloadModal);
    const getLatestModalProps = () => mockedFileDownloadModal.mock.calls.at(-1)?.[0];

    const renderReportPDFDownloadModal = () =>
        renderHook(() => useReportPDFDownloadModal(), {
            wrapper: ({children}: {children: React.ReactNode}) => <ModalProvider>{children}</ModalProvider>,
        });

    // Mirrors a backend-pushed Onyx update: change the value, then re-render so the hook reads it.
    const setOnyxValue = async (key: string, value: unknown, rerender: (props: unknown) => void) => {
        mockOnyxValues = {...mockOnyxValues, [key]: value};
        rerender({});
        await act(async () => {
            await waitForBatchedUpdates();
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnyxValues = {
            [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: {reportID: REPORT_ID, reportName: 'Expense Report'},
            [ONYXKEYS.SESSION]: {encryptedAuthToken: 'token'},
        };
        (jest.mocked(useOnyx) as jest.Mock).mockImplementation((key: string) => [mockOnyxValues[key]]);
    });

    it('updates the open modal in place as the PDF generates', async () => {
        // Given the modal opened for a report whose PDF is still generating
        const {result, rerender} = renderReportPDFDownloadModal();
        await act(async () => {
            result.current.showReportPDFDownloadModal({reportID: REPORT_ID});
            await waitForBatchedUpdates();
        });

        // Then it shows the generating state with the spinner copy
        expect(getLatestModalProps()).toEqual(
            expect.objectContaining({isVisible: true, status: CONST.FILE_DOWNLOAD_STATUS.GENERATING, message: 'reportDetailsPage.waitForPDF', shouldTreatModalAsCovering: true}),
        );

        // When the backend pushes the generated filename
        await setOnyxValue(PDF_FILENAME_KEY, 'report.pdf', rerender);

        // Then the same modal instance switches to the ready state instead of being remounted
        expect(getLatestModalProps()).toEqual(expect.objectContaining({isVisible: true, status: CONST.FILE_DOWNLOAD_STATUS.READY, message: 'reportDetailsPage.successPDF'}));
        expect(mockOnFileDownloadModalMount).toHaveBeenCalledTimes(1);

        // When the modal downloads the file
        act(() => {
            getLatestModalProps()?.onDownload();
        });

        // Then it downloads the report's PDF
        expect(downloadReportPDF).toHaveBeenCalledWith('report.pdf', 'Expense Report', expect.any(Function), 'employee@mail.com', 'token');
    });

    it('shows the failed state when the PDF generation fails', async () => {
        // Given the modal opened for a report
        const {result, rerender} = renderReportPDFDownloadModal();
        await act(async () => {
            result.current.showReportPDFDownloadModal({reportID: REPORT_ID});
            await waitForBatchedUpdates();
        });

        // When the backend reports the generation failed
        await setOnyxValue(PDF_FILENAME_KEY, CONST.REPORT_DETAILS_MENU_ITEM.ERROR, rerender);

        // Then the modal shows the error state, which stops the spinner
        expect(getLatestModalProps()).toEqual(expect.objectContaining({status: CONST.FILE_DOWNLOAD_STATUS.FAILED, message: 'reportDetailsPage.errorPDF'}));
    });

    it('cancels once when dismissed while the PDF is still generating', async () => {
        // Given the modal opened by Submit via PDF, which retracts the submit when cancelled
        const onCancel = jest.fn();
        const {result} = renderReportPDFDownloadModal();
        await act(async () => {
            result.current.showReportPDFDownloadModal({reportID: REPORT_ID, onCancel});
            await waitForBatchedUpdates();
        });

        // When the user dismisses it before the filename arrives, and the close fires again from another control
        act(() => {
            getLatestModalProps()?.onClose();
            getLatestModalProps()?.onClose();
        });

        // Then the submit is retracted exactly once
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not cancel when dismissed after the PDF is ready', async () => {
        // Given the modal opened by Submit via PDF and the filename has arrived, so the submit has already resolved
        const onCancel = jest.fn();
        const {result, rerender} = renderReportPDFDownloadModal();
        await act(async () => {
            result.current.showReportPDFDownloadModal({reportID: REPORT_ID, onCancel});
            await waitForBatchedUpdates();
        });
        await setOnyxValue(PDF_FILENAME_KEY, 'report.pdf', rerender);

        // When the user dismisses the modal
        act(() => {
            getLatestModalProps()?.onClose();
        });

        // Then the submit is kept
        expect(onCancel).not.toHaveBeenCalled();
    });

    it('resolves the show promise only after the modal has finished hiding', async () => {
        // Given an open modal
        const {result} = renderReportPDFDownloadModal();
        let hasResolved = false;
        await act(async () => {
            result.current.showReportPDFDownloadModal({reportID: REPORT_ID}).then(() => {
                hasResolved = true;
            });
            await waitForBatchedUpdates();
        });

        // When the user dismisses it
        await act(async () => {
            getLatestModalProps()?.onClose();
            await waitForBatchedUpdates();
        });

        // Then it starts hiding but the caller is not told it is gone yet
        expect(getLatestModalProps()?.isVisible).toBe(false);
        expect(hasResolved).toBe(false);

        // When the hide animation ends
        await act(async () => {
            getLatestModalProps()?.onModalHide?.();
            await waitForBatchedUpdates();
        });

        // Then the show promise resolves
        expect(hasResolved).toBe(true);
    });

    it('does not reopen a dismissed modal when the filename arrives late', async () => {
        // Given the user dismissed the modal while the PDF was still generating
        const {result, rerender} = renderReportPDFDownloadModal();
        await act(async () => {
            result.current.showReportPDFDownloadModal({reportID: REPORT_ID});
            await waitForBatchedUpdates();
        });
        await act(async () => {
            getLatestModalProps()?.onClose();
            await waitForBatchedUpdates();
        });

        // When the filename arrives while the modal is hiding, and again after it has gone
        await setOnyxValue(PDF_FILENAME_KEY, 'report.pdf', rerender);
        expect(getLatestModalProps()).toEqual(expect.objectContaining({isVisible: false, status: CONST.FILE_DOWNLOAD_STATUS.GENERATING}));
        await act(async () => {
            getLatestModalProps()?.onModalHide?.();
            await waitForBatchedUpdates();
        });
        const renderCountAfterHide = mockedFileDownloadModal.mock.calls.length;
        await setOnyxValue(PDF_FILENAME_KEY, 'report-2.pdf', rerender);

        // Then the modal is not shown again
        expect(mockedFileDownloadModal.mock.calls.length).toBe(renderCountAfterHide);
        expect(mockOnFileDownloadModalMount).toHaveBeenCalledTimes(1);
    });

    it('logs a stall only while the open modal is waiting on the filename', async () => {
        // Given the modal opened for a report whose PDF is still generating
        const {result, rerender} = renderReportPDFDownloadModal();
        expect(jest.mocked(useStallLogger).mock.calls.at(-1)?.[0]).toBe(false);
        await act(async () => {
            result.current.showReportPDFDownloadModal({reportID: REPORT_ID});
            await waitForBatchedUpdates();
        });

        // Then the stall timer is keyed by the report it waits on
        expect(jest.mocked(useStallLogger).mock.calls.at(-1)?.[0]).toBe(REPORT_ID);

        // When the filename arrives
        await setOnyxValue(PDF_FILENAME_KEY, 'report.pdf', rerender);

        // Then the stall timer stops
        expect(jest.mocked(useStallLogger).mock.calls.at(-1)?.[0]).toBe(false);
    });
});
