import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useAllTransactions from '@hooks/useAllTransactions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import createRandomTransaction from '../../utils/collections/transaction';

const mockCurrentSearchHash = 12345;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchContext: () => ({
        currentSearchHash: mockCurrentSearchHash,
    }),
}));

describe('useAllTransactions', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
    });

    it('should return all transactions from collection when no search results', async () => {
        const transaction1 = createRandomTransaction(1);
        const transaction2 = createRandomTransaction(2);
        transaction1.transactionID = 'txn1';
        transaction2.transactionID = 'txn2';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`, transaction1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}txn2`, transaction2);

        const {result} = renderHook(() => useAllTransactions());

        await waitFor(() => {
            expect(result.current).toBeDefined();
        });

        expect(result.current).toEqual({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction1,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn2`]: transaction2,
        });
    });

    it('should return transactions from collection when search results data is empty', async () => {
        const transaction1 = createRandomTransaction(1);
        transaction1.transactionID = 'txn1';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`, transaction1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${mockCurrentSearchHash}`, {
            search: {
                offset: 0,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                hasMoreResults: false,
                hasResults: false,
                isLoading: false,
            },
            data: undefined,
        });

        const {result} = renderHook(() => useAllTransactions());

        await waitFor(() => {
            expect(result.current).toBeDefined();
        });

        expect(result.current).toEqual({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction1,
        });
    });

    it('should merge search results transactions with collection transactions', async () => {
        const searchTransaction = createRandomTransaction(1);
        const collectionTransaction = createRandomTransaction(2);
        searchTransaction.transactionID = 'searchTxn1';
        collectionTransaction.transactionID = 'collectionTxn1';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${mockCurrentSearchHash}`, {
            search: {
                offset: 0,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
            },
            data: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}searchTxn1`]: searchTransaction,
            },
        } as unknown as SearchResults);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}collectionTxn1`, collectionTransaction);

        const {result} = renderHook(() => useAllTransactions());

        await waitFor(() => {
            expect(result.current).toBeDefined();
            expect(Object.keys(result.current ?? {}).length).toBe(2);
        });

        expect(result.current).toEqual({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}searchTxn1`]: searchTransaction,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}collectionTxn1`]: collectionTransaction,
        });
    });

    it('should prioritize collection transactions over search results when same transaction exists in both', async () => {
        const searchTransaction = createRandomTransaction(1);
        const collectionTransaction = createRandomTransaction(1);
        searchTransaction.transactionID = 'txn1';
        collectionTransaction.transactionID = 'txn1';
        searchTransaction.amount = 1000;
        collectionTransaction.amount = 2000;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${mockCurrentSearchHash}`, {
            search: {
                offset: 0,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
            },
            data: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: searchTransaction,
            },
        } as unknown as SearchResults);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`, collectionTransaction);

        const {result} = renderHook(() => useAllTransactions());

        await waitFor(() => {
            expect(result.current).toBeDefined();
        });

        // Collection transaction should override search transaction
        expect(result.current?.[`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]?.amount).toBe(2000);
    });

    it('should filter out non-transaction keys from search results', async () => {
        const transaction = createRandomTransaction(1);
        transaction.transactionID = 'txn1';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${mockCurrentSearchHash}`, {
            search: {
                offset: 0,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
            },
            data: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction,
                [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {reportID: 'report1'},
            },
        } as unknown as SearchResults);

        const {result} = renderHook(() => useAllTransactions());

        await waitFor(() => {
            expect(result.current).toBeDefined();
        });

        // Should only include transaction keys
        expect(Object.keys(result.current ?? {}).length).toBe(1);
        expect(result.current).toEqual({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction,
        });
    });

    it('should handle empty collection and empty search results', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${mockCurrentSearchHash}`, {
            search: {
                offset: 0,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                hasMoreResults: false,
                hasResults: false,
                isLoading: false,
            },
            data: {},
        });

        const {result} = renderHook(() => useAllTransactions());

        await waitFor(() => {
            expect(result.current).toBeDefined();
        });

        expect(result.current).toEqual({});
    });

    it('should handle null/undefined transactions in search results', async () => {
        const transaction = createRandomTransaction(1);
        transaction.transactionID = 'txn1';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${mockCurrentSearchHash}`, {
            search: {
                offset: 0,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
            },
            data: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn2`]: null,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn3`]: undefined,
            },
        } as unknown as SearchResults);

        const {result} = renderHook(() => useAllTransactions());

        await waitFor(() => {
            expect(result.current).toBeDefined();
        });

        // Should only include non-null transactions
        expect(result.current).toEqual({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction,
        });
    });

    it('should update when transactions collection changes', async () => {
        const transaction1 = createRandomTransaction(1);
        transaction1.transactionID = 'txn1';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`, transaction1);

        const {result} = renderHook(() => useAllTransactions());

        await waitFor(() => {
            expect(result.current).toBeDefined();
            expect(Object.keys(result.current ?? {}).length).toBe(1);
        });

        // Add another transaction
        const transaction2 = createRandomTransaction(2);
        transaction2.transactionID = 'txn2';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}txn2`, transaction2);

        await waitFor(() => {
            expect(Object.keys(result.current ?? {}).length).toBe(2);
        });

        expect(result.current).toEqual({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction1,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn2`]: transaction2,
        });
    });

    it('should update when search results change', async () => {
        const transaction1 = createRandomTransaction(1);
        transaction1.transactionID = 'txn1';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${mockCurrentSearchHash}`, {
            search: {
                offset: 0,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
            },
            data: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction1,
            },
        } as unknown as SearchResults);

        const {result} = renderHook(() => useAllTransactions());

        await waitFor(() => {
            expect(result.current).toBeDefined();
            expect(Object.keys(result.current ?? {}).length).toBe(1);
        });

        // Update search results
        const transaction2 = createRandomTransaction(2);
        transaction2.transactionID = 'txn2';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${mockCurrentSearchHash}`, {
            search: {
                offset: 0,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
            },
            data: {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}txn2`]: transaction2,
            },
        } as unknown as SearchResults);

        await waitFor(() => {
            expect(Object.keys(result.current ?? {}).length).toBe(2);
        });

        expect(result.current).toEqual({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction1,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn2`]: transaction2,
        });
    });

    it('should use default search hash when context hash is not available', async () => {
        const transaction = createRandomTransaction(1);
        transaction.transactionID = 'txn1';
        const searchHash = CONST.DEFAULT_NUMBER_ID;

        // Mock context without search hash
        jest.doMock('@components/Search/SearchContext', () => ({
            useSearchContext: () => ({
                currentSearchHash: undefined,
            }),
        }));

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}`, {
            search: {
                offset: 0,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                hasMoreResults: false,
                hasResults: false,
                isLoading: false,
            },
            data: {},
        });

        const {result} = renderHook(() => useAllTransactions());

        await waitFor(() => {
            expect(result.current).toBeDefined();
        });

        expect(result.current).toEqual({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}txn1`]: transaction,
        });
    });
});
