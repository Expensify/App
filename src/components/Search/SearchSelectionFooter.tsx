import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';

import {isGroupEntry} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionContext} from './SearchContext';
import SearchPageFooter from './SearchPageFooter';

type SearchSelectionFooterProps = {
    /** The (sorting-aware) results the page is displaying; source of the footer's totals metadata. */
    searchResults: OnyxEntry<SearchResults>;
};

// Self-subscribing footer leaf. Owns the `selectedTransactions` read so a checkbox press re-renders only this
// footer — not SearchPage and the <Search> list it contains.
function SearchSelectionFooter({searchResults}: SearchSelectionFooterProps) {
    const {selectedTransactions, excludedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {currentSearchResults} = useSearchResultsContext();
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const shouldAllowFooterTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const metadata = searchResults?.search;
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});
    const excludedTransactionsValues = Object.values(excludedTransactions);
    const excludedCount = excludedTransactionsValues.length;
    const shouldShowFooter = (!areAllMatchingItemsSelected && selectedTransactionsKeys.length > 0) || (shouldAllowFooterTotals && !!metadata?.count);

    if (!shouldShowFooter) {
        return null;
    }

    const shouldUseClientTotal = !metadata?.count || (selectedTransactionsKeys.length > 0 && !areAllMatchingItemsSelected);
    const selectedTransactionItems = Object.values(selectedTransactions);
    const currency = metadata?.currency ?? selectedTransactionItems.at(0)?.groupCurrency ?? selectedTransactionItems.at(0)?.currency;
    const count = shouldUseClientTotal
        ? selectedTransactionsKeys.reduce((acc, key) => {
              if (isGroupEntry(key)) {
                  const group = currentSearchResults?.data?.[key];
                  return acc + (group?.count ?? 0);
              }
              const item = selectedTransactions[key];
              if (item.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === item.reportID) {
                  return acc;
              }
              return acc + 1;
          }, 0)
        : Math.max((metadata?.count ?? 0) - excludedCount, 0);
    const total = shouldUseClientTotal
        ? selectedTransactionItems.reduce((acc, transaction) => acc - (transaction.groupAmount ?? -Math.abs(transaction.amount)), 0)
        : (metadata?.total ?? 0) - excludedTransactionsValues.reduce((acc, transaction) => acc - (transaction.groupAmount ?? -Math.abs(transaction.amount)), 0);

    return (
        <SearchPageFooter
            count={count}
            total={total}
            currency={currency}
        />
    );
}

export default SearchSelectionFooter;
