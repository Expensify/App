import CONST from '@src/CONST';

import React from 'react';

import type {SearchQueryJSON} from './types';

import SearchBulkActionsButton from './SearchBulkActionsButton';
import {useSearchSelectionContext} from './SearchContext';
import {useSelectionCounts} from './SearchSelectionProvider';

type SearchBulkActionsBarWideProps = {
    queryJSON: SearchQueryJSON;
};

/**
 * Mounts the wide layout's bulk actions only while rows are selected, so the work `useSearchBulkActions` does to build
 * the action list stays off the page until it is needed. Kept separate from the page so that reading the selection
 * re-renders this component alone rather than the list beside it.
 */
function SearchBulkActionsBarWide({queryJSON}: SearchBulkActionsBarWideProps) {
    const {hasSelectedTransactions} = useSearchSelectionContext();
    const {selected} = useSelectionCounts();
    const shouldShowBulkActions = queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE ? hasSelectedTransactions : selected > 0;

    if (!shouldShowBulkActions) {
        return null;
    }

    return <SearchBulkActionsButton queryJSON={queryJSON} />;
}

SearchBulkActionsBarWide.displayName = 'SearchBulkActionsBarWide';

export default SearchBulkActionsBarWide;
