import {useMemo} from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import {useSearchSelectionContext} from '@components/Search/SearchSelectionContext';
import CONST from '@src/CONST';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';

type SearchFooterResult = {
    count: number | undefined;
    total: number | undefined;
    currency: string | undefined;
    shouldShow: boolean;
};

function useSearchFooter(): SearchFooterResult {
    const {currentSearchKey, currentSearchHash, currentSearchResults} = useSearchContext();
    const {selectedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);
    const shouldAllowFooterTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchHash, true);
    const metadata = currentSearchResults?.search;

    return useMemo(() => {
        if (!shouldAllowFooterTotals && selectedTransactionsKeys.length === 0) {
            return {
                count: undefined,
                total: undefined,
                currency: undefined,
                shouldShow: false,
            };
        }

        const shouldUseClientTotal = selectedTransactionsKeys.length > 0 || !metadata?.count || (selectedTransactionsKeys.length > 0 && !areAllMatchingItemsSelected);
        const selectedTransactionItems = Object.values(selectedTransactions);
        const currency = metadata?.currency ?? selectedTransactionItems.at(0)?.groupCurrency;
        const numberOfExpense = shouldUseClientTotal
            ? selectedTransactionsKeys.reduce((count, key) => {
                  const item = selectedTransactions[key];
                  if (item.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === item.reportID) {
                      return count;
                  }
                  return count + 1;
              }, 0)
            : metadata?.count;
        const total = shouldUseClientTotal ? selectedTransactionItems.reduce((acc, transaction) => acc - (transaction.groupAmount ?? 0), 0) : metadata?.total;

        const shouldShow = selectedTransactionsKeys.length > 0 || (shouldAllowFooterTotals && !!metadata?.count);

        return {
            count: numberOfExpense,
            total,
            currency,
            shouldShow,
        };
    }, [areAllMatchingItemsSelected, metadata?.count, metadata?.currency, metadata?.total, selectedTransactions, selectedTransactionsKeys, shouldAllowFooterTotals]);
}

export default useSearchFooter;
