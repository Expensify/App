import {renderHook} from '@testing-library/react-native';

import useNavigateToTransactionThread from '@hooks/useNavigateToTransactionThread';

import {setActiveTransactionIDs, shouldPreserveActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';

import type {Report} from '@src/types/onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import {createExpenseReport} from '../../utils/collections/reports';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TRANSACTION_ID = 'B2';
const SIBLING_TRANSACTION_IDS = ['B1', 'B2'];
const THREAD_REPORT_ID = 'thread-1';

const report: Report = {...createExpenseReport(1), reportID: 'reportB'};
// An IOU action that already has a thread, so the hook takes the short path to navigation.
const iouAction = {...createRandomReportAction(1), reportActionID: 'action1', childReportID: THREAD_REPORT_ID};

jest.mock('@libs/actions/TransactionThreadNavigation', () => ({
    setActiveTransactionIDs: jest.fn(() => Promise.resolve()),
    shouldPreserveActiveTransactionIDs: jest.fn(() => false),
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
const mockedShouldPreserve = jest.mocked(shouldPreserveActiveTransactionIDs);
const mockedNavigate = jest.mocked(Navigation.navigate);

function callHook(overrides?: {shouldPreserveBroaderCarousel?: boolean}) {
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

/**
 * Regression guard for https://github.com/Expensify/App/issues/98196: an expense row inside a report that was opened
 * from a broader carousel (e.g. the Spend page) must not re-seed the carousel with just that report's expenses, which
 * shrank the "x of y" counter and left the wrong list behind after navigating back.
 */
describe('useNavigateToTransactionThread', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedGetIOUAction.mockReturnValue(iouAction);
        mockedShouldPreserve.mockReturnValue(false);
        mockedSetActiveTransactionIDs.mockReturnValue(Promise.resolve());
    });

    it('seeds the carousel with the given siblings by default', async () => {
        await callHook();

        expect(mockedSetActiveTransactionIDs).toHaveBeenCalledWith(SIBLING_TRANSACTION_IDS);
        expect(mockedShouldPreserve).not.toHaveBeenCalled();
    });

    it('still seeds when preservation is requested but no broader carousel is active', async () => {
        await callHook({shouldPreserveBroaderCarousel: true});

        expect(mockedShouldPreserve).toHaveBeenCalledWith(SIBLING_TRANSACTION_IDS, TRANSACTION_ID);
        expect(mockedSetActiveTransactionIDs).toHaveBeenCalledWith(SIBLING_TRANSACTION_IDS);
    });

    it('leaves a broader carousel untouched when preservation is requested', async () => {
        mockedShouldPreserve.mockReturnValue(true);

        await callHook({shouldPreserveBroaderCarousel: true});

        expect(mockedSetActiveTransactionIDs).not.toHaveBeenCalled();
    });

    it('navigates to the thread whether or not the carousel was re-seeded', async () => {
        mockedShouldPreserve.mockReturnValue(true);

        await callHook({shouldPreserveBroaderCarousel: true});

        // Navigation used to be chained onto the seeding promise, so skipping the write must not skip the hop.
        expect(mockedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigate.mock.calls.at(0)?.at(0)).toContain(THREAD_REPORT_ID);
    });
});
