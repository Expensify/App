import {renderHook} from '@testing-library/react-hooks';
import useSearchBulkActions from './useSearchBulkActions';
import {isDeletedTransaction} from '@libs/TransactionUtils';

jest.mock('@libs/TransactionUtils', () => ({
    isDeletedTransaction: jest.fn(),
}));

describe('useSearchBulkActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return true for non-deleted transaction in allTransactions', () => {
        const transaction = {transactionID: '1', status: 'pending'};
        const allTransactions = {'1': transaction};
        const groupedTransactions = {};
        (isDeletedTransaction as jest.Mock).mockReturnValue(false);

        const {result} = renderHook(() => useSearchBulkActions({allTransactions, groupedTransactions}));
        const shouldShow = result.current.shouldShowBulkDuplicateOption(['1'], []);
        expect(shouldShow).toBe(true);
    });

    it('should return false for deleted transaction in allTransactions', () => {
        const transaction = {transactionID: '1', status: 'deleted'};
        const allTransactions = {'1': transaction};
        const groupedTransactions = {};
        (isDeletedTransaction as jest.Mock).mockReturnValue(true);

        const {result} = renderHook(() => useSearchBulkActions({allTransactions, groupedTransactions}));
        const shouldShow = result.current.shouldShowBulkDuplicateOption(['1'], []);
        expect(shouldShow).toBe(false);
    });

    it('should return true for non-deleted transaction in groupedTransactions', () => {
        const transaction = {transactionID: '1', status: 'pending'};
        const allTransactions = {};
        const groupedTransactions = {'1': transaction};
        (isDeletedTransaction as jest.Mock).mockReturnValue(false);

        const {result} = renderHook(() => useSearchBulkActions({allTransactions, groupedTransactions}));
        const shouldShow = result.current.shouldShowBulkDuplicateOption(['1'], []);
        expect(shouldShow).toBe(true);
    });

    it('should return false for deleted transaction in groupedTransactions', () => {
        const transaction = {transactionID: '1', status: 'deleted'};
        const allTransactions = {};
        const groupedTransactions = {'1': transaction};
        (isDeletedTransaction as jest.Mock).mockReturnValue(true);

        const {result} = renderHook(() => useSearchBulkActions({allTransactions, groupedTransactions}));
        const shouldShow = result.current.shouldShowBulkDuplicateOption(['1'], []);
        expect(shouldShow).toBe(false);
    });

    it('should return false when transaction not found in either collection', () => {
        const allTransactions = {};
        const groupedTransactions = {};

        const {result} = renderHook(() => useSearchBulkActions({allTransactions, groupedTransactions}));
        const shouldShow = result.current.shouldShowBulkDuplicateOption(['1'], []);
        expect(shouldShow).toBe(false);
    });

    it('should return false when multiple transactions selected', () => {
        const transaction1 = {transactionID: '1', status: 'pending'};
        const transaction2 = {transactionID: '2', status: 'pending'};
        const allTransactions = {'1': transaction1, '2': transaction2};
        const groupedTransactions = {};

        const {result} = renderHook(() => useSearchBulkActions({allTransactions, groupedTransactions}));
        const shouldShow = result.current.shouldShowBulkDuplicateOption(['1', '2'], []);
        expect(shouldShow).toBe(false);
    });

    it('should return false when reports are selected', () => {
        const transaction = {transactionID: '1', status: 'pending'};
        const allTransactions = {'1': transaction};
        const groupedTransactions = {};

        const {result} = renderHook(() => useSearchBulkActions({allTransactions, groupedTransactions}));
        const shouldShow = result.current.shouldShowBulkDuplicateOption(['1'], ['report1']);
        expect(shouldShow).toBe(false);
    });
});