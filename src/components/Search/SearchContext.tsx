import {useContext} from 'react';

import {
    SearchQueryActionsContext,
    SearchQueryContext,
    SearchResultsActionsContext,
    SearchResultsContext,
    SearchRowSelectionActionsContext,
    SearchSelectionActionsContext,
    SearchSelectionContext,
    SearchShiftRangeChildrenContext,
} from './SearchContextDefinitions';

// Lightweight public surface for search contexts.
// `useOnyx` imports the context instances from here; pulling in the providers (and their useOnyx
// users like useCardFeedsForDisplay) would create a cycle that breaks jest mock resolution in tests
// like ReportActionItemTest. Providers live in `SearchContextProvider.tsx`.

function useSearchQueryContext() {
    return useContext(SearchQueryContext);
}

function useSearchQueryActions() {
    return useContext(SearchQueryActionsContext);
}

function useSearchResultsContext() {
    return useContext(SearchResultsContext);
}

function useSearchResultsActions() {
    return useContext(SearchResultsActionsContext);
}

function useSearchSelectionContext() {
    return useContext(SearchSelectionContext);
}

function useSearchSelectionActions() {
    return useContext(SearchSelectionActionsContext);
}

function useSearchRowSelectionActions() {
    return useContext(SearchRowSelectionActionsContext);
}

function useSearchShiftRangeChildren() {
    return useContext(SearchShiftRangeChildrenContext);
}

export {
    SearchQueryContext,
    SearchQueryActionsContext,
    SearchResultsContext,
    SearchResultsActionsContext,
    SearchSelectionContext,
    SearchSelectionActionsContext,
    useSearchQueryContext,
    useSearchQueryActions,
    useSearchResultsContext,
    useSearchResultsActions,
    useSearchSelectionContext,
    useSearchSelectionActions,
    useSearchRowSelectionActions,
    useSearchShiftRangeChildren,
};
