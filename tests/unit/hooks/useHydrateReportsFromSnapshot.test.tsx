import {renderHook} from '@testing-library/react-native';

import useHydrateReportsFromSnapshot from '@hooks/useHydrateReportsFromSnapshot';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

const REPORT_ID_1 = '1';
const REPORT_ID_2 = '2';
const TRANSACTION_ID = 'transaction-1';

const report1: Report = {reportID: REPORT_ID_1};
const report2: Report = {reportID: REPORT_ID_2};
const transaction: Transaction = {
    amount: 100,
    created: '2026-01-01',
    currency: CONST.CURRENCY.USD,
    merchant: 'Test merchant',
    reportID: REPORT_ID_1,
    transactionID: TRANSACTION_ID,
};

const reportKey1 = `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_1}` as const;
const reportKey2 = `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_2}` as const;
const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}` as const;

function buildSearchResults(data: SearchResults['data']): SearchResults {
    return {
        data,
        search: {
            offset: 0,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            hash: 1,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        },
    };
}

describe('useHydrateReportsFromSnapshot', () => {
    const updateSpy = jest.spyOn(Onyx, 'update').mockResolvedValue(undefined);

    beforeEach(() => {
        updateSpy.mockClear();
    });

    afterAll(() => {
        updateSpy.mockRestore();
    });

    it('hydrates only once on mount for legacy callers even when snapshot data arrives later', () => {
        // Given a legacy caller mounted before snapshot data is available
        const {rerender} = renderHook(({currentSearchResults}: {currentSearchResults?: SearchResults}) => useHydrateReportsFromSnapshot(currentSearchResults, {}), {
            initialProps: {currentSearchResults: undefined} as {currentSearchResults?: SearchResults},
        });

        expect(updateSpy).not.toHaveBeenCalled();

        // When snapshot data arrives after the initial hydration attempt
        rerender({currentSearchResults: buildSearchResults({[reportKey1]: report1})});

        // Then the hook does not hydrate again
        expect(updateSpy).not.toHaveBeenCalled();
    });

    it('hydrates transactions once when allTransactions becomes available without selectedReportIDs', () => {
        // Given the hook is mounted with a snapshot transaction before the transaction collection is available
        const currentSearchResults = buildSearchResults({
            [transactionKey]: transaction,
        });
        const {rerender} = renderHook(({allTransactions}: {allTransactions?: OnyxCollection<Transaction>}) => useHydrateReportsFromSnapshot(currentSearchResults, {}, allTransactions), {
            initialProps: {allTransactions: undefined} as {
                allTransactions?: OnyxCollection<Transaction>;
            },
        });

        expect(updateSpy).not.toHaveBeenCalled();

        // When the transaction collection becomes available
        rerender({allTransactions: {} as OnyxCollection<Transaction>});

        // Then transactions hydrate even without selectedReportIDs
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenLastCalledWith([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: transactionKey,
                value: transaction,
            },
        ]);
    });

    it('hydrates reports once, then hydrates transactions once when allTransactions becomes available', () => {
        // Given Merge Reports mounts with snapshot reports before the transaction collection is available
        const initialSearchResults = buildSearchResults({
            [reportKey1]: report1,
            [transactionKey]: transaction,
        });
        const {rerender} = renderHook(
            ({currentSearchResults, allTransactions}: {currentSearchResults: SearchResults; allTransactions?: OnyxCollection<Transaction>}) =>
                useHydrateReportsFromSnapshot(currentSearchResults, {}, allTransactions, [REPORT_ID_1, REPORT_ID_2]),
            {
                initialProps: {currentSearchResults: initialSearchResults, allTransactions: undefined} as {
                    currentSearchResults: SearchResults;
                    allTransactions?: OnyxCollection<Transaction>;
                },
            },
        );

        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenLastCalledWith([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportKey1,
                value: report1,
            },
        ]);
        updateSpy.mockClear();

        // When snapshot data changes before allTransactions becomes available
        // and the transaction collection then loads
        const updatedSearchResults = buildSearchResults({
            [reportKey1]: report1,
            [reportKey2]: report2,
            [transactionKey]: transaction,
        });
        rerender({currentSearchResults: updatedSearchResults, allTransactions: {} as OnyxCollection<Transaction>});

        // Then only the transaction phase hydrates; reports are not compared/hydrated again
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenLastCalledWith([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: transactionKey,
                value: transaction,
            },
        ]);
        updateSpy.mockClear();

        // When allTransactions changes again after transaction hydration completed
        rerender({
            currentSearchResults: buildSearchResults({
                [reportKey1]: report1,
                [reportKey2]: report2,
                [transactionKey]: transaction,
            }),
            allTransactions: {[transactionKey]: transaction} as OnyxCollection<Transaction>,
        });

        // Then neither reports nor transactions hydrate again
        expect(updateSpy).not.toHaveBeenCalled();
    });
});
