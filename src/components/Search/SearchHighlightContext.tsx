import React, {useContext} from 'react';
import type {SearchListItem} from '@components/SelectionListWithSections/types';
import type {Transaction} from '@src/types/onyx';

type ScrollableHandle = {
    scrollToIndex: (index: number, animated?: boolean) => void;
} | null;

type SearchHighlightContextValue = {
    newSearchResultKeys: Set<string> | null;
    newTransactions: Transaction[];
    handleSelectionListScroll: (data: SearchListItem[], ref: ScrollableHandle) => void;
};

const defaultValue: SearchHighlightContextValue = {
    newSearchResultKeys: null,
    newTransactions: [],
    handleSelectionListScroll: () => {},
};

const SearchHighlightContext = React.createContext<SearchHighlightContextValue>(defaultValue);

function useSearchHighlightContext() {
    return useContext(SearchHighlightContext);
}

export {SearchHighlightContext, useSearchHighlightContext};
export type {SearchHighlightContextValue};
