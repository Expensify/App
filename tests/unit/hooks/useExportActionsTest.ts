import useExportActions from '@hooks/useExportActions';

import {clearExportDownload} from '@libs/actions/Export';
import {queueExportSearchWithTemplate} from '@libs/actions/Search';

import type {ReactElement} from 'react';

import {act, renderHook} from '@testing-library/react-native';

const mockQueueExportSearchWithTemplate = jest.mocked(queueExportSearchWithTemplate);
const mockClearExportDownload = jest.mocked(clearExportDownload);

const REPORT_ID = 'report1';
const POLICY_ID = 'policy1';
const EXPORT_NAME = 'Test Template';

type ExportDownloadStatusModalProps = {exportID: string; onClose: () => void};

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => []),
    queueExportSearchWithTemplate: jest.fn(() => 'mock-export-id'),
}));

jest.mock('@libs/actions/Report', () => ({
    exportReportToCSV: jest.fn(),
    exportReportToPDF: jest.fn(),
    exportToIntegration: jest.fn(),
    markAsManuallyExported: jest.fn(),
}));

jest.mock('@libs/actions/Export', () => ({
    clearExportDownload: jest.fn(),
}));

jest.mock('@libs/actions/Link', () => ({
    openOldDotLink: jest.fn(),
}));

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

const mockShowDecisionModal = jest.fn();
jest.mock('@hooks/useDecisionModal', () => ({
    __esModule: true,
    default: () => ({showDecisionModal: mockShowDecisionModal}),
}));

jest.mock('@hooks/useExportAgainModal', () => ({
    __esModule: true,
    default: () => ({triggerExportOrConfirm: jest.fn()}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({integrationIcon: {}}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/usePaginatedReportActions', () => ({
    __esModule: true,
    default: () => ({reportActions: []}),
}));

jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({
    __esModule: true,
    default: () => ({transactions: {}}),
}));

const mockClearSelectedTransactions = jest.fn();
jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({login: 'test@example.com', accountID: 1}),
}));

// Return a minimal report for the money request report key; undefined for everything else (EXPORT_DOWNLOAD, NVPs, etc.)
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => {
        if (key === `report_${REPORT_ID}`) {
            return [{reportID: REPORT_ID, policyID: POLICY_ID}];
        }
        return [undefined];
    },
}));

describe('useExportActions - template export status modal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsOffline = false;
    });

    it('queues the export with progress tracking and renders the status modal', () => {
        const {result} = renderHook(() => useExportActions({reportID: REPORT_ID}));

        act(() => {
            result.current.beginExportWithTemplate('Test Template', 'csv', ['1', '2'], EXPORT_NAME, POLICY_ID);
        });

        expect(mockQueueExportSearchWithTemplate).toHaveBeenCalledWith(
            {
                templateName: 'Test Template',
                templateType: 'csv',
                jsonQuery: '{}',
                reportIDList: [REPORT_ID],
                transactionIDList: ['1', '2'],
                policyID: POLICY_ID,
                exportName: EXPORT_NAME,
            },
            true,
        );
        const modal: ReactElement<ExportDownloadStatusModalProps> | null = result.current.exportDownloadStatusModal;
        expect(modal?.props.exportID).toBe('mock-export-id');
    });

    it('does not queue the export and shows the offline modal when offline', () => {
        mockIsOffline = true;
        const {result} = renderHook(() => useExportActions({reportID: REPORT_ID}));

        act(() => {
            result.current.beginExportWithTemplate('Test Template', 'csv', ['1'], EXPORT_NAME, POLICY_ID);
        });

        expect(mockQueueExportSearchWithTemplate).not.toHaveBeenCalled();
        expect(mockShowDecisionModal).toHaveBeenCalled();
        expect(result.current.exportDownloadStatusModal).toBeNull();
    });

    it('clears the export download and hides the modal on close', () => {
        const {result} = renderHook(() => useExportActions({reportID: REPORT_ID}));

        act(() => {
            result.current.beginExportWithTemplate('Test Template', 'csv', ['1'], EXPORT_NAME, POLICY_ID);
        });
        const modal: ReactElement<ExportDownloadStatusModalProps> | null = result.current.exportDownloadStatusModal;
        expect(modal?.props.exportID).toBe('mock-export-id');

        act(() => {
            modal?.props.onClose();
        });

        expect(mockClearExportDownload).toHaveBeenCalledWith('mock-export-id', undefined);
        expect(result.current.exportDownloadStatusModal).toBeNull();
    });
});
