import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useSearchSectionsState from '@hooks/useSearchSectionsState';
import {clearLastSearchParams, saveLastSearchParams, saveSortedReportIDs} from '@libs/actions/ReportNavigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@src/libs/Log');

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
const MOCK_QUERY_JSON: LastSearchParams['queryJSON'] = {hash: 99999} as any;

const MOCK_REPORT_IDS = ['1001', '1002', '1003', '1004', '1005'];

const MOCK_LAST_SEARCH_PARAMS: LastSearchParams = {
    queryJSON: MOCK_QUERY_JSON,
    hasMoreResults: false,
    offset: 0,
};

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

beforeEach(() => {
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });
});

describe('useSearchSectionsState', () => {
    it('returns empty allReports and no loading state when Onyx has no data', async () => {
        const {result} = renderHook(() => useSearchSectionsState());
        await act(async () => {
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.allReports).toEqual([]);
        expect(result.current.isSearchLoading).toBe(false);
        expect(result.current.lastSearchQuery).toBeUndefined();
    });

    it('returns sortedReportIDs from the dedicated Onyx key', async () => {
        await act(async () => {
            saveSortedReportIDs(MOCK_REPORT_IDS);
            await Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, MOCK_LAST_SEARCH_PARAMS);
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useSearchSectionsState());
        await act(async () => {
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.allReports).toEqual(MOCK_REPORT_IDS);
        expect(result.current.lastSearchQuery?.queryJSON?.hash).toBe(MOCK_QUERY_JSON?.hash);
    });

    it('reflects isSearchLoading from snapshot', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, MOCK_LAST_SEARCH_PARAMS);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${MOCK_QUERY_JSON?.hash}` as typeof ONYXKEYS.COLLECTION.SNAPSHOT, {
                search: {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    status: CONST.SEARCH.STATUS.EXPENSE_REPORT.ALL,
                    offset: 0,
                    hasMoreResults: false,
                    isLoading: true,
                    hasResults: true,
                },
                data: {},
            });
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useSearchSectionsState());
        await act(async () => {
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.isSearchLoading).toBe(true);
    });

    it('sortedReportIDs survive a saveLastSearchParams (Onyx.set) call', async () => {
        // Critical regression test: saveLastSearchParams uses Onyx.set on
        // REPORT_NAVIGATION_LAST_SEARCH_QUERY. If sortedReportIDs were stored in
        // the same key, any saveLastSearchParams call without them would wipe the list.
        await act(async () => {
            saveSortedReportIDs(MOCK_REPORT_IDS);
            saveLastSearchParams(MOCK_LAST_SEARCH_PARAMS);
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useSearchSectionsState());
        await act(async () => {
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.allReports).toEqual(MOCK_REPORT_IDS);
    });

    it('sortedReportIDs survive clearLastSearchParams', async () => {
        await act(async () => {
            saveSortedReportIDs(MOCK_REPORT_IDS);
            clearLastSearchParams();
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useSearchSectionsState());
        await act(async () => {
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.allReports).toEqual(MOCK_REPORT_IDS);
    });

    it('saveSortedReportIDs replaces the list on each call', async () => {
        await act(async () => {
            saveSortedReportIDs(MOCK_REPORT_IDS);
            await waitForBatchedUpdatesWithAct();
        });

        const updatedIDs = ['2001', '2002'];
        await act(async () => {
            saveSortedReportIDs(updatedIDs);
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useSearchSectionsState());
        await act(async () => {
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.allReports).toEqual(updatedIDs);
    });
});
