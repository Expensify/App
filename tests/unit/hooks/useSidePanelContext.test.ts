import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useSidePanelContext from '@pages/inbox/report/ReportActionCompose/useSidePanelContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const REPORT_ID = 'report_123';

// Mutable state referenced by jest.mock factories below
let mockIsInSidePanel = false;
let mockCurrentReportIDState: {currentReportID: string | undefined; currentRHPReportID: string | undefined} = {
    currentReportID: undefined,
    currentRHPReportID: undefined,
};
let mockSearchState: {
    currentSearchQueryJSON: {type?: string} | undefined;
    selectedTransactionIDs: string[];
    selectedTransactions: Record<string, {isSelected: boolean; transaction?: Record<string, unknown>}>;
    selectedReports: Array<{reportID?: string}>;
} = {
    currentSearchQueryJSON: undefined,
    selectedTransactionIDs: [],
    selectedTransactions: {},
    selectedReports: [],
};

jest.mock('@hooks/useIsInSidePanel', () => ({
    __esModule: true,
    default: () => mockIsInSidePanel,
}));

jest.mock('@hooks/useCurrentReportID', () => ({
    useCurrentReportIDState: () => mockCurrentReportIDState,
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchStateContext: () => mockSearchState,
}));

function resetMocks() {
    mockIsInSidePanel = false;
    mockCurrentReportIDState = {currentReportID: undefined, currentRHPReportID: undefined};
    mockSearchState = {
        currentSearchQueryJSON: undefined,
        selectedTransactionIDs: [],
        selectedTransactions: {},
        selectedReports: [],
    };
}

describe('useSidePanelContext', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        resetMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    async function renderWithConciergeReport(reportID = REPORT_ID) {
        await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, REPORT_ID);
        await waitForBatchedUpdates();
        return renderHook(() => useSidePanelContext(reportID));
    }

    it('returns undefined when not in the side panel', async () => {
        mockIsInSidePanel = false;
        const {result} = await renderWithConciergeReport();
        await waitForBatchedUpdates();
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when reportID does not match conciergeReportID', async () => {
        mockIsInSidePanel = true;
        const {result} = await renderWithConciergeReport('different_report');
        await waitForBatchedUpdates();
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when no context is available', async () => {
        mockIsInSidePanel = true;
        const {result} = await renderWithConciergeReport();
        await waitForBatchedUpdates();
        expect(result.current).toBeUndefined();
    });

    describe('EXPENSE_REPORT search type', () => {
        beforeEach(() => {
            mockIsInSidePanel = true;
            mockSearchState.currentSearchQueryJSON = {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT};
        });

        it('returns only selectedReportIDs when reports are selected', async () => {
            mockSearchState.selectedReports = [{reportID: 'report_1'}, {reportID: 'report_2'}];
            const {result} = await renderWithConciergeReport();
            await waitForBatchedUpdates();
            expect(result.current).toEqual({selectedReportIDs: 'report_1,report_2'});
        });

        it('falls back to contextReportID and selectedTransactionIDs when no reports are selected', async () => {
            mockSearchState.selectedReports = [];
            mockCurrentReportIDState = {currentRHPReportID: 'rhp_report', currentReportID: undefined};
            mockSearchState.selectedTransactionIDs = ['txn_a'];
            const {result} = await renderWithConciergeReport();
            await waitForBatchedUpdates();
            expect(result.current).toEqual({reportID: 'rhp_report', selectedTransactionIDs: 'txn_a'});
        });

        it('includes child transaction selections when drilling into a report', async () => {
            mockSearchState.selectedReports = [];
            mockSearchState.selectedTransactionIDs = ['txn_1', 'txn_2'];
            const {result} = await renderWithConciergeReport();
            await waitForBatchedUpdates();
            expect(result.current).toMatchObject({selectedTransactionIDs: 'txn_1,txn_2'});
        });
    });

    describe('contextReportID resolution', () => {
        beforeEach(() => {
            mockIsInSidePanel = true;
        });

        it('prefers currentRHPReportID over currentReportID', async () => {
            mockCurrentReportIDState = {currentRHPReportID: 'rhp_report', currentReportID: 'main_report'};
            const {result} = await renderWithConciergeReport();
            await waitForBatchedUpdates();
            expect(result.current).toMatchObject({reportID: 'rhp_report'});
        });

        it('falls back to currentReportID when no RHP report is open', async () => {
            mockCurrentReportIDState = {currentRHPReportID: undefined, currentReportID: 'main_report'};
            const {result} = await renderWithConciergeReport();
            await waitForBatchedUpdates();
            expect(result.current).toMatchObject({reportID: 'main_report'});
        });
    });

    describe('transaction ID derivation', () => {
        beforeEach(() => {
            mockIsInSidePanel = true;
        });

        it('derives IDs from selectedTransactions map (Search list selections), filtering out unselected and non-transaction entries', async () => {
            mockSearchState.selectedTransactions = {
                txn1: {isSelected: true, transaction: {}},
                txn2: {isSelected: true, transaction: {}},
                txn3: {isSelected: false, transaction: {}}, // not selected
                reportKey: {isSelected: true, transaction: undefined}, // empty report row — no transaction
            };
            const {result} = await renderWithConciergeReport();
            await waitForBatchedUpdates();
            expect(result.current).toMatchObject({selectedTransactionIDs: 'txn1,txn2'});
        });

        it('falls back to selectedTransactionIDs array when map is empty (report table view selections)', async () => {
            mockSearchState.selectedTransactions = {};
            mockSearchState.selectedTransactionIDs = ['txn_a', 'txn_b'];
            const {result} = await renderWithConciergeReport();
            await waitForBatchedUpdates();
            expect(result.current).toMatchObject({selectedTransactionIDs: 'txn_a,txn_b'});
        });

        it('prefers the map over the array when both are non-empty', async () => {
            mockSearchState.selectedTransactions = {txnMap: {isSelected: true, transaction: {}}};
            mockSearchState.selectedTransactionIDs = ['txnArray'];
            const {result} = await renderWithConciergeReport();
            await waitForBatchedUpdates();
            expect(result.current).toMatchObject({selectedTransactionIDs: 'txnMap'});
        });
    });

    it('returns all available context when every field is populated', async () => {
        mockIsInSidePanel = true;
        mockCurrentReportIDState = {currentRHPReportID: 'rhp_report', currentReportID: undefined};
        mockSearchState.selectedTransactions = {txn1: {isSelected: true, transaction: {}}};
        mockSearchState.selectedReports = [{reportID: 'report_1'}];
        const {result} = await renderWithConciergeReport();
        await waitForBatchedUpdates();
        expect(result.current).toEqual({
            reportID: 'rhp_report',
            selectedTransactionIDs: 'txn1',
            selectedReportIDs: 'report_1',
        });
    });
});
