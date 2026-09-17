import {act, renderHook} from '@testing-library/react-native';

import type * as SearchContextModule from '@components/Search/SearchContext';

import useExportActions from '@hooks/useExportActions';

import {queueExportSearchWithTemplate} from '@libs/actions/Search';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import createRandomTransaction from '../../utils/collections/transaction';

const mockQueueExportSearchWithTemplate = jest.mocked(queueExportSearchWithTemplate);
const mockClearSelectedTransactions = jest.fn();

const REPORT_ID = 'report1';
const POLICY_ID = 'policy1';
const EXPORT_NAME = 'Test Template';

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => ({customTemplates: [], defaultTemplates: []})),
    queueExportSearchWithTemplate: jest.fn(() => 'mock-export-id'),
}));

jest.mock('@libs/actions/Report', () => ({
    exportReportToCSV: jest.fn(),
    exportReportToPDF: jest.fn(),
    exportToIntegration: jest.fn(),
    markAsManuallyExported: jest.fn(),
}));

jest.mock('@libs/actions/Link', () => ({
    openOldDotLink: jest.fn(),
}));

jest.mock('@components/Search/SearchContext', () => ({
    ...jest.requireActual<typeof SearchContextModule>('@components/Search/SearchContext'),
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
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
    // Echo the plural count so tests can assert which form a label asks for.
    default: () => ({translate: (key: string, params?: {count?: number}) => (params?.count === undefined ? key : `${key}:${params.count}`)}),
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

let mockReportTransactions: Record<string, Transaction> = {};
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({
    __esModule: true,
    default: () => ({transactions: mockReportTransactions}),
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
        mockReportTransactions = {transaction1: {...createRandomTransaction(1), reportID: REPORT_ID}};
    });

    it('queues the export with progress tracking', () => {
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
        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
    });

    it('does not queue the export and shows the offline modal when offline', () => {
        mockIsOffline = true;
        const {result} = renderHook(() => useExportActions({reportID: REPORT_ID}));

        act(() => {
            result.current.beginExportWithTemplate('Test Template', 'csv', ['1'], EXPORT_NAME, POLICY_ID);
        });

        expect(mockQueueExportSearchWithTemplate).not.toHaveBeenCalled();
        expect(mockShowDecisionModal).toHaveBeenCalled();
    });

    it('does not queue the export and shows the empty report modal when the report has no expenses', () => {
        mockReportTransactions = {};
        const {result} = renderHook(() => useExportActions({reportID: REPORT_ID}));

        act(() => {
            result.current.beginExportWithTemplate('Test Template', 'csv', [], EXPORT_NAME, POLICY_ID);
        });

        expect(mockQueueExportSearchWithTemplate).not.toHaveBeenCalled();
        expect(mockShowDecisionModal).toHaveBeenCalledWith(expect.objectContaining({prompt: 'common.downloadFailedEmptyReportDescription:1'}));
    });
});

describe('useExportActions - download labels', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockReportTransactions = {};
    });

    it('labels the PDF download with the singular "Download report" since the page acts on one report', () => {
        const {result} = renderHook(() => useExportActions({reportID: REPORT_ID}));

        expect(result.current.exportActionEntries[CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF].text).toBe('common.downloadReport:1');
    });

    it('labels the receipts download by how many of the report expenses carry a receipt', () => {
        const withReceipt = {...createRandomTransaction(1), reportID: REPORT_ID, hasEReceipt: false, receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE}};
        const withoutReceipt = {...createRandomTransaction(2), reportID: REPORT_ID, hasEReceipt: false, receipt: undefined};
        mockReportTransactions = {tx1: withReceipt, tx2: withoutReceipt};
        const {result, rerender} = renderHook(() => useExportActions({reportID: REPORT_ID}));

        // One of the two expenses has a receipt, so the label is singular.
        expect(result.current.exportActionEntries[CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_RECEIPTS].text).toBe('common.downloadReceipt:1');

        mockReportTransactions = {tx1: withReceipt, tx2: {...withoutReceipt, receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE}}};
        rerender({});

        expect(result.current.exportActionEntries[CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_RECEIPTS].text).toBe('common.downloadReceipt:2');
    });
});
