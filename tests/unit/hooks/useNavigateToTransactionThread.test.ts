import {renderHook} from '@testing-library/react-native';

import useNavigateToTransactionThread from '@hooks/useNavigateToTransactionThread';

import {CAROUSEL_SOURCE, setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';

import type {Report} from '@src/types/onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import {createExpenseReport} from '../../utils/collections/reports';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TRANSACTION_ID = 'B2';
const SIBLING_TRANSACTION_IDS = ['B1', 'B2'];
const THREAD_REPORT_ID = 'thread-1';
const CAROUSEL_SOURCE_FOR_REPORT = 'reportRow:reportB';

const report: Report = {...createExpenseReport(1), reportID: 'reportB'};
// An IOU action that already has a thread, so the hook takes the short path to navigation.
const iouAction = {...createRandomReportAction(1), reportActionID: 'action1', childReportID: THREAD_REPORT_ID};

jest.mock('@libs/actions/TransactionThreadNavigation', () => ({
    setActiveTransactionIDs: jest.fn(() => Promise.resolve()),
    CAROUSEL_SOURCE: {reportRow: (reportID: string | undefined) => `reportRow:${reportID}`},
}));

jest.mock('@libs/actions/Report', () => ({
    createTransactionThreadReport: jest.fn(),
    setOptimisticTransactionThread: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {getActiveRoute: jest.fn(() => '/search'), navigate: jest.fn()},
}));

jest.mock('@libs/ReportActionsUtils', () => ({getIOUActionForTransactionID: jest.fn()}));

jest.mock('@components/WideRHPContextProvider', () => ({useWideRHPActions: jest.fn(() => ({markReportRHPWidth: jest.fn()}))}));

// The personal details context is only forwarded to createTransactionThreadReport (mocked above), so an empty map is enough.
jest.mock('@components/OnyxListItemProvider', () => ({usePersonalDetails: jest.fn(() => ({}))}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({email: 'a@b.com', accountID: 1})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

const mockedGetIOUAction = jest.mocked(getIOUActionForTransactionID);
const mockedSetActiveTransactionIDs = jest.mocked(setActiveTransactionIDs);
const mockedNavigate = jest.mocked(Navigation.navigate);

function callHook(overrides?: {carouselSource?: string}) {
    const {result} = renderHook(() => useNavigateToTransactionThread());
    result.current({
        transactionID: TRANSACTION_ID,
        reportActions: [iouAction],
        report,
        transaction: undefined,
        siblingTransactionIDs: SIBLING_TRANSACTION_IDS,
        ...overrides,
    });
    return waitForBatchedUpdates();
}

describe('useNavigateToTransactionThread', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedGetIOUAction.mockReturnValue(iouAction);
        mockedSetActiveTransactionIDs.mockReturnValue(Promise.resolve());
    });

    it('seeds the carousel with the given siblings', async () => {
        await callHook();

        expect(mockedSetActiveTransactionIDs).toHaveBeenCalledWith(SIBLING_TRANSACTION_IDS, {source: undefined});
    });

    /**
     * Regression guard for https://github.com/Expensify/App/issues/99609: the pressed row's screen has to take
     * ownership of the carousel. An earlier fix kept a broader list (e.g. the Spend page's) alive here, which left the
     * report showing a counter and arrows covering expenses that weren't in it.
     */
    it('stamps the carousel with the source that seeded it', async () => {
        await callHook({carouselSource: CAROUSEL_SOURCE.reportRow(report.reportID)});

        expect(mockedSetActiveTransactionIDs).toHaveBeenCalledWith(SIBLING_TRANSACTION_IDS, {source: CAROUSEL_SOURCE_FOR_REPORT});
    });

    it('anchors the opened thread to the pressed expense so the header can show the carousel before data loads', async () => {
        await callHook();

        expect(mockedNavigate).toHaveBeenCalledTimes(1);
        const route = mockedNavigate.mock.calls.at(0)?.at(0);
        expect(route).toContain(THREAD_REPORT_ID);
        expect(route).toContain(`anchorTransactionID=${TRANSACTION_ID}`);
    });
});
