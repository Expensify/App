/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
import type * as ReactNavigation from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import {shouldDisplayReportTableView, shouldWaitForTransactions} from '@libs/MoneyRequestReportUtils';
import {isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import ReportActionsListBody from '@pages/inbox/report/ReportActionsList';
import UserTypingEventListener from '@pages/inbox/report/UserTypingEventListener';
import ReportActions from '@pages/inbox/ReportActions';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '123';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: jest.fn(() => ({params: {reportID: REPORT_ID}})),
    };
});

jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePaginatedReportActions', () => jest.fn());
jest.mock('@hooks/useReportTransactionsCollection', () => jest.fn());

// Only the two helpers the orchestrator branches on are mocked, so each branch can be driven
// deterministically without constructing full transaction fixtures.
jest.mock('@libs/MoneyRequestReportUtils', () => ({
    getAllNonDeletedTransactions: jest.fn(() => []),
    shouldDisplayReportTableView: jest.fn(() => false),
    shouldWaitForTransactions: jest.fn(() => false),
}));
jest.mock('@libs/ReportUtils', () => ({
    isMoneyRequestReport: jest.fn(() => false),
    isInvoiceReport: jest.fn(() => false),
}));

// The children are mocked so these tests assert only the orchestrator's branching decision, not the
// children's internals (the body has its own dedicated coverage). The skeleton view is kept real so
// we can observe it via its testID.
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportActionsList', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ReportActionsList', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/UserTypingEventListener', () => jest.fn(() => null));
jest.mock('@libs/telemetry/markOpenReportEnd', () => jest.fn());

const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockUsePaginatedReportActions = usePaginatedReportActions as jest.MockedFunction<typeof usePaginatedReportActions>;
const mockUseReportTransactionsCollection = useReportTransactionsCollection as jest.MockedFunction<typeof useReportTransactionsCollection>;
const mockShouldDisplayReportTableView = shouldDisplayReportTableView as jest.MockedFunction<typeof shouldDisplayReportTableView>;
const mockShouldWaitForTransactions = shouldWaitForTransactions as jest.MockedFunction<typeof shouldWaitForTransactions>;
const mockIsMoneyRequestReport = isMoneyRequestReport as jest.MockedFunction<typeof isMoneyRequestReport>;
const mockIsInvoiceReport = isInvoiceReport as jest.MockedFunction<typeof isInvoiceReport>;
const mockMoneyRequestList = MoneyRequestReportActionsList as jest.MockedFunction<typeof MoneyRequestReportActionsList>;
const mockReportActionsListBody = ReportActionsListBody as jest.MockedFunction<typeof ReportActionsListBody>;
const mockUserTypingEventListener = UserTypingEventListener as jest.MockedFunction<typeof UserTypingEventListener>;
const mockMarkOpenReportEnd = markOpenReportEnd as jest.MockedFunction<typeof markOpenReportEnd>;

const defaultPaginatedReportActionsResult: ReturnType<typeof usePaginatedReportActions> = {
    reportActions: [],
    linkedAction: undefined,
    oldestUnreadReportAction: undefined,
    sortedAllReportActions: undefined,
    hasNewerActions: false,
    hasOlderActions: false,
    report: undefined,
};

const mockReport: OnyxTypes.Report = {
    reportID: REPORT_ID,
    reportName: 'Test Report',
    chatReportID: '456',
    ownerAccountID: 123,
    lastVisibleActionCreated: '2023-01-01',
    total: 0,
};

type ReportLoadingStateOverrides = Partial<{isLoadingInitialReportActions: boolean; hasOnceLoadedReportActions: boolean}>;

/** Builds the keyed useOnyx mock the orchestrator reads: the report, its loading state and IS_LOADING_APP. */
const setupUseOnyx = (options: {report?: OnyxTypes.Report | undefined; isLoadingApp?: boolean; loadingState?: ReportLoadingStateOverrides} = {}) => {
    // `'report' in options` distinguishes "not passed" (default to mockReport) from an explicit
    // `{report: undefined}` (the report-not-available case) — a destructuring default would swallow the latter.
    const report = 'report' in options ? options.report : mockReport;
    const isLoadingApp = options.isLoadingApp ?? false;
    const loadingState = options.loadingState ?? {};
    mockUseOnyx.mockImplementation((key: string) => {
        if (key === ONYXKEYS.IS_LOADING_APP) {
            return [isLoadingApp, {status: 'loaded'}];
        }
        if (key.includes('reportLoadingState')) {
            return [{isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true, ...loadingState}, {status: 'loaded'}];
        }
        if (key === `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`) {
            return [report, {status: 'loaded'}];
        }
        return [undefined, {status: 'loaded'}];
    });
};

describe('ReportActions (orchestrator)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUsePaginatedReportActions.mockReturnValue(defaultPaginatedReportActionsResult);
        mockUseReportTransactionsCollection.mockReturnValue({});
        mockShouldWaitForTransactions.mockReturnValue(false);
        mockShouldDisplayReportTableView.mockReturnValue(false);
        mockIsMoneyRequestReport.mockReturnValue(false);
        mockIsInvoiceReport.mockReturnValue(false);
        setupUseOnyx();
    });

    afterEach(async () => {
        await waitForBatchedUpdatesWithAct();
        await Onyx.clear();
    });

    it('renders a skeleton when the report is not available yet', () => {
        setupUseOnyx({report: undefined});

        render(<ReportActions />);

        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(mockMoneyRequestList).not.toHaveBeenCalled();
    });

    it('renders a skeleton while waiting for transactions', () => {
        mockShouldWaitForTransactions.mockReturnValue(true);

        render(<ReportActions />);

        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(mockMoneyRequestList).not.toHaveBeenCalled();
    });

    it('renders the money-request table view for a money-request report', () => {
        mockIsMoneyRequestReport.mockReturnValue(true);
        mockShouldDisplayReportTableView.mockReturnValue(true);

        render(<ReportActions />);

        expect(mockMoneyRequestList).toHaveBeenCalled();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
    });

    it('renders the chat list body and the typing listener for a chat report', () => {
        render(<ReportActions />);

        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(mockMoneyRequestList).not.toHaveBeenCalled();
        expect(mockReportActionsListBody).toHaveBeenCalled();
        expect(mockReportActionsListBody.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({reportID: REPORT_ID}));
        expect(mockUserTypingEventListener).toHaveBeenCalled();
        expect(mockUserTypingEventListener.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({report: mockReport}));
    });

    it('renders the app-load skeleton on the chat path and closes the open-report span with warm:false', () => {
        setupUseOnyx({isLoadingApp: true});

        render(<ReportActions />);

        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(mockMarkOpenReportEnd).toHaveBeenCalledWith(mockReport, {warm: false});
    });

    it('does not show the app-load skeleton (or fire telemetry) while offline', () => {
        mockUseNetwork.mockReturnValue({isOffline: true});
        setupUseOnyx({isLoadingApp: true});

        render(<ReportActions />);

        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(mockReportActionsListBody).toHaveBeenCalled();
        expect(mockMarkOpenReportEnd).not.toHaveBeenCalled();
    });

    it('does not show the app-load skeleton for a money-request report', () => {
        mockIsMoneyRequestReport.mockReturnValue(true);
        mockShouldDisplayReportTableView.mockReturnValue(true);
        setupUseOnyx({isLoadingApp: true});

        render(<ReportActions />);

        expect(mockMoneyRequestList).toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(mockMarkOpenReportEnd).not.toHaveBeenCalled();
    });
});
