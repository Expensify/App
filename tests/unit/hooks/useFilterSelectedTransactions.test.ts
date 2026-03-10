import {renderHook} from '@testing-library/react-native';
import useFilterSelectedTransactions from '@hooks/useFilterSelectedTransactions';
import createRandomTransaction from '../../utils/collections/transaction';

const mockSetSelectedTransactions = jest.fn();
let mockSelectedTransactionIDs: string[] = [];
let mockCurrentSelectedTransactionReportID: string | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchStateContext: () => ({
        selectedTransactionIDs: mockSelectedTransactionIDs,
        currentSelectedTransactionReportID: mockCurrentSelectedTransactionReportID,
    }),
    useSearchActionsContext: () => ({
        setSelectedTransactions: mockSetSelectedTransactions,
    }),
}));

describe('useFilterSelectedTransactions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectedTransactionIDs = [];
        mockCurrentSelectedTransactionReportID = undefined;
    });

    it('does not clear selected transactions owned by another report', () => {
        const localTransaction = createRandomTransaction(1);
        localTransaction.transactionID = 'localTx';
        localTransaction.reportID = 'reportA';

        mockSelectedTransactionIDs = ['foreignTx'];
        mockCurrentSelectedTransactionReportID = 'reportB';

        renderHook(() => useFilterSelectedTransactions([localTransaction], 'reportA'));

        expect(mockSetSelectedTransactions).not.toHaveBeenCalled();
    });

    it('filters out removed selected transactions for the active report', () => {
        const remainingTransaction = createRandomTransaction(2);
        remainingTransaction.transactionID = 'keptTx';
        remainingTransaction.reportID = 'reportA';

        mockSelectedTransactionIDs = ['keptTx', 'removedTx'];
        mockCurrentSelectedTransactionReportID = 'reportA';

        renderHook(() => useFilterSelectedTransactions([remainingTransaction], 'reportA'));

        expect(mockSetSelectedTransactions).toHaveBeenCalledWith(['keptTx']);
    });
});
