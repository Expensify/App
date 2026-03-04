import React from 'react';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import type {SearchKey} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {SearchHighlightContext} from './SearchHighlightContext';
import type {SearchQueryJSON} from './types';

type SearchNewItemDetectorProps = ChildrenProps & {
    searchResults: SearchResults | undefined;
    queryJSON: SearchQueryJSON;
    searchKey: SearchKey | undefined;
    offset: number;
    shouldCalculateTotals: boolean;
    shouldUseLiveData: boolean;
};

/**
 * Renderless component that isolates COLLECTION.TRANSACTION and COLLECTION.REPORT_ACTIONS
 * subscriptions from the Search component. When these collections change, only this component
 * re-renders — its children prop (from Search's scope) is referentially stable, so React
 * skips re-rendering children. Context consumers re-render only when highlight data changes.
 */
function SearchNewItemDetector({children, searchResults, queryJSON, searchKey, offset, shouldCalculateTotals, shouldUseLiveData}: SearchNewItemDetectorProps) {
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const previousTransactions = usePrevious(transactions);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const previousReportActions = usePrevious(reportActions);

    const highlightData = useSearchHighlightAndScroll({
        searchResults,
        transactions,
        previousTransactions,
        reportActions,
        previousReportActions,
        queryJSON,
        searchKey,
        offset,
        shouldCalculateTotals,
        shouldUseLiveData,
    });

    return <SearchHighlightContext value={highlightData}>{children}</SearchHighlightContext>;
}

SearchNewItemDetector.displayName = 'SearchNewItemDetector';

export default SearchNewItemDetector;
