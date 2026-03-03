import {act, renderHook} from '@testing-library/react-native';
import type {OnyxCollection} from 'react-native-onyx';
import {useSearchStateContext} from '@components/Search/SearchContext';
import useSearchDeleteTransactions from '@hooks/useSearchDeleteTransactions';
import type {deleteMoneyRequestOnSearch, revertSplitTransactionOnSearch} from '@libs/actions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults, Transaction} from '@src/types/onyx';
import createRandomTransaction from '../../utils/collections/transaction';

const mockDeleteMoneyRequestOnSearch = jest.fn();
const mockRevertSplitTransactionOnSearch = jest.fn();

let mockCurrentSearchResults: SearchResults | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchStateContext: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    deleteMoneyRequestOnSearch: (...args: Parameters<typeof deleteMoneyRequestOnSearch>) => {
        mockDeleteMoneyRequestOnSearch(...args);
    },
    revertSplitTransactionOnSearch: (...args: Parameters<typeof revertSplitTransactionOnSearch>) => {
        mockRevertSplitTransactionOnSearch(...args);
    },
}));

function createSplitTransaction(transactionID: string, originalTransactionID: string, amount = 100): Transaction {
    const transaction = createRandomTransaction(Number(transactionID));
    transaction.transactionID = transactionID;
    transaction.amount = amount;
    transaction.modifiedAmount = amount;
    transaction.created = '2026-02-16 00:00:00.000';
    transaction.category = 'Travel';
    transaction.tag = 'Tag';
    transaction.merchant = 'Merchant';
    transaction.comment = {
        ...(transaction.comment ?? {}),
        source: CONST.IOU.TYPE.SPLIT,
        originalTransactionID,
        comment: `split-${transactionID}`,
    };
    return transaction;
}

function createSearchResults(data: Record<string, unknown>): SearchResults {
    return {
        search: {
            offset: 0,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
        },
        data,
    } as SearchResults;
}

describe('useSearchDeleteTransactions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCurrentSearchResults = undefined;
        (useSearchStateContext as jest.MockedFunction<typeof useSearchStateContext>).mockReturnValue({
            currentSearchResults: mockCurrentSearchResults,
        } as ReturnType<typeof useSearchStateContext>);
    });

    it('reverts split deletion when exactly one hidden sibling remains in the full transactions collection', () => {
        const hash = 111;
        const originalTransactionID = '1000';
        const selectedSplitID = '2001';
        const hiddenRemainingSplitID = '2002';

        const selectedSplit = createSplitTransaction(selectedSplitID, originalTransactionID, 300);
        const hiddenRemainingSplit = createSplitTransaction(hiddenRemainingSplitID, originalTransactionID, 700);
        hiddenRemainingSplit.modifiedMerchant = 'Hidden Merchant';

        mockCurrentSearchResults = createSearchResults({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${selectedSplitID}`]: selectedSplit,
        });

        (useSearchStateContext as jest.MockedFunction<typeof useSearchStateContext>).mockReturnValue({
            currentSearchResults: mockCurrentSearchResults,
        } as ReturnType<typeof useSearchStateContext>);

        const transactions: OnyxCollection<Transaction> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${selectedSplitID}`]: selectedSplit,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${hiddenRemainingSplitID}`]: hiddenRemainingSplit,
        };

        const {result} = renderHook(() => useSearchDeleteTransactions());

        act(() => {
            result.current.deleteTransactionsOnSearch(hash, [selectedSplitID], transactions);
        });

        expect(mockDeleteMoneyRequestOnSearch).not.toHaveBeenCalled();
        expect(mockRevertSplitTransactionOnSearch).toHaveBeenCalledTimes(1);
        expect(mockRevertSplitTransactionOnSearch).toHaveBeenCalledWith(
            hash,
            originalTransactionID,
            expect.objectContaining({
                transactionID: hiddenRemainingSplitID,
                amount: 700,
                merchant: 'Hidden Merchant',
                comment: `split-${hiddenRemainingSplitID}`,
                reportID: hiddenRemainingSplit.reportID,
            }),
            [selectedSplitID, hiddenRemainingSplitID],
            expect.objectContaining({
                transactionID: originalTransactionID,
                amount: hiddenRemainingSplit.amount,
                modifiedAmount: hiddenRemainingSplit.modifiedAmount,
                merchant: hiddenRemainingSplit.merchant,
                comment: expect.objectContaining({
                    source: undefined,
                    originalTransactionID: undefined,
                    comment: `split-${hiddenRemainingSplitID}`,
                }),
            }),
        );
    });

    it('does not revert when full transactions collection still has multiple siblings, even if search results only show one sibling', () => {
        const hash = 222;
        const originalTransactionID = '5000';
        const selectedSplitID = '6001';
        const visibleSiblingID = '6002';
        const hiddenSiblingID = '6003';

        const selectedSplit = createSplitTransaction(selectedSplitID, originalTransactionID, 100);
        const visibleSibling = createSplitTransaction(visibleSiblingID, originalTransactionID, 200);
        const hiddenSibling = createSplitTransaction(hiddenSiblingID, originalTransactionID, 300);

        mockCurrentSearchResults = createSearchResults({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${selectedSplitID}`]: selectedSplit,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${visibleSiblingID}`]: visibleSibling,
        });

        (useSearchStateContext as jest.MockedFunction<typeof useSearchStateContext>).mockReturnValue({
            currentSearchResults: mockCurrentSearchResults,
        } as ReturnType<typeof useSearchStateContext>);

        const transactions: OnyxCollection<Transaction> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${selectedSplitID}`]: selectedSplit,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${visibleSiblingID}`]: visibleSibling,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${hiddenSiblingID}`]: hiddenSibling,
        };

        const {result} = renderHook(() => useSearchDeleteTransactions());

        act(() => {
            result.current.deleteTransactionsOnSearch(hash, [selectedSplitID], transactions);
        });

        expect(mockRevertSplitTransactionOnSearch).not.toHaveBeenCalled();
        expect(mockDeleteMoneyRequestOnSearch).toHaveBeenCalledTimes(1);
        expect(mockDeleteMoneyRequestOnSearch).toHaveBeenCalledWith(hash, [selectedSplitID], transactions);
    });
});
