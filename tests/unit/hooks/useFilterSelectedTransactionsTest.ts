import {act, renderHook} from '@testing-library/react-native';
import type {Transaction} from '@src/types/onyx';
import createRandomTransaction from '../../utils/collections/transaction';

// Mock variables that can be modified in tests
let mockSelectedTransactionIDs: string[] = [];
const mockSetSelectedTransactions = jest.fn();

jest.mock('@components/Search/SearchContext', () => ({
    useSearchContext: () => ({
        selectedTransactionIDs: mockSelectedTransactionIDs,
        setSelectedTransactions: mockSetSelectedTransactions,
        clearSelectedTransactions: jest.fn(),
        selectedTransactions: {},
        currentSearchHash: 12345,
    }),
}));

// Import the actual hook after setting up the mock
// eslint-disable-next-line @typescript-eslint/no-require-imports
const useFilterSelectedTransactions = require('@hooks/useFilterSelectedTransactions').default;

describe('useFilterSelectedTransactions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectedTransactionIDs = [];
    });

    it('should not call setSelectedTransactions when no transactions are selected', () => {
        const transactions = [createRandomTransaction(1), createRandomTransaction(2)];
        transactions[0].transactionID = 'trans1';
        transactions[1].transactionID = 'trans2';

        mockSelectedTransactionIDs = [];

        renderHook(() => useFilterSelectedTransactions(transactions));

        expect(mockSetSelectedTransactions).not.toHaveBeenCalled();
    });

    it('should not call setSelectedTransactions when all selected transactions exist in the list', () => {
        const transactions = [createRandomTransaction(1), createRandomTransaction(2)];
        transactions[0].transactionID = 'trans1';
        transactions[1].transactionID = 'trans2';

        mockSelectedTransactionIDs = ['trans1', 'trans2'];

        renderHook(() => useFilterSelectedTransactions(transactions));

        expect(mockSetSelectedTransactions).not.toHaveBeenCalled();
    });

    it('should filter out selected transactions that no longer exist in the transactions list', () => {
        const transactions = [createRandomTransaction(1)];
        transactions[0].transactionID = 'trans1';

        // trans2 and trans3 are selected but don't exist in transactions
        mockSelectedTransactionIDs = ['trans1', 'trans2', 'trans3'];

        renderHook(() => useFilterSelectedTransactions(transactions));

        expect(mockSetSelectedTransactions).toHaveBeenCalledWith(['trans1']);
    });

    it('should clear all selections when all selected transactions are removed', () => {
        const transactions = [createRandomTransaction(1)];
        transactions[0].transactionID = 'trans1';

        // All selected transactions don't exist in the current list
        mockSelectedTransactionIDs = ['trans2', 'trans3'];

        renderHook(() => useFilterSelectedTransactions(transactions));

        expect(mockSetSelectedTransactions).toHaveBeenCalledWith([]);
    });

    it('should update filtered transactions when transactions list changes', () => {
        // Initial state: 3 transactions, 3 selected
        const initialTransactions = [createRandomTransaction(1), createRandomTransaction(2), createRandomTransaction(3)];
        initialTransactions[0].transactionID = 'trans1';
        initialTransactions[1].transactionID = 'trans2';
        initialTransactions[2].transactionID = 'trans3';

        mockSelectedTransactionIDs = ['trans1', 'trans2', 'trans3'];

        const {rerender} = renderHook(({transactions}) => useFilterSelectedTransactions(transactions), {
            initialProps: {transactions: initialTransactions},
        });

        // No filtering needed initially
        expect(mockSetSelectedTransactions).not.toHaveBeenCalled();

        // Now remove trans2 from the list (simulating deletion)
        const updatedTransactions = [initialTransactions[0], initialTransactions[2]];

        act(() => {
            rerender({transactions: updatedTransactions});
        });

        // Should filter out trans2 from selection
        expect(mockSetSelectedTransactions).toHaveBeenCalledWith(['trans1', 'trans3']);
    });

    it('should handle empty transactions list', () => {
        const transactions: Transaction[] = [];

        mockSelectedTransactionIDs = ['trans1', 'trans2'];

        renderHook(() => useFilterSelectedTransactions(transactions));

        // All selections should be cleared since no transactions exist
        expect(mockSetSelectedTransactions).toHaveBeenCalledWith([]);
    });

    it('should preserve order of selected transactions after filtering', () => {
        const transactions = [createRandomTransaction(1), createRandomTransaction(2), createRandomTransaction(3)];
        transactions[0].transactionID = 'trans1';
        transactions[1].transactionID = 'trans2';
        transactions[2].transactionID = 'trans3';

        // Selected in specific order, with some non-existent IDs interspersed
        mockSelectedTransactionIDs = ['trans3', 'nonexistent1', 'trans1', 'nonexistent2', 'trans2'];

        renderHook(() => useFilterSelectedTransactions(transactions));

        // Should maintain the original order of valid selections
        expect(mockSetSelectedTransactions).toHaveBeenCalledWith(['trans3', 'trans1', 'trans2']);
    });
});
