import React from 'react';
import {SearchQueryActionsContext, SearchQueryContext, SearchQueryProvider, useSearchQueryActions, useSearchQueryContext} from './SearchQueryProvider';
import {SearchResultsActionsContext, SearchResultsContext, SearchResultsProvider, useSearchResultsActions, useSearchResultsContext} from './SearchResultsProvider';
import {SearchSelectionActionsContext, SearchSelectionContext, SearchSelectionProvider, useSearchSelectionActions, useSearchSelectionContext} from './SearchSelectionProvider';
import type {SearchActionsContextValue, SearchStateContextValue} from './types';

type SearchContextProps = {
    children: React.ReactNode;
};

function SearchContextProvider({children}: SearchContextProps) {
    return (
        <SearchQueryProvider>
            <SearchResultsProvider>
                <SearchSelectionProvider>{children}</SearchSelectionProvider>
            </SearchResultsProvider>
        </SearchQueryProvider>
    );
}

// Back-compat shim returning the composed bag. Prefer the narrow `useSearchQueryContext` /
// `useSearchResultsContext` / `useSearchSelectionContext` hooks: reading the bag re-renders
// the consumer whenever any of the three contexts updates.
function useSearchStateContext(): SearchStateContextValue {
    const query = useSearchQueryContext();
    const results = useSearchResultsContext();
    const selection = useSearchSelectionContext();
    return {...query, ...results, ...selection};
}

// Back-compat shim returning the composed actions bag. Prefer the narrow action hooks.
function useSearchActionsContext(): SearchActionsContextValue {
    const queryActions = useSearchQueryActions();
    const resultsActions = useSearchResultsActions();
    const selectionActions = useSearchSelectionActions();
    return {...queryActions, ...resultsActions, ...selectionActions};
}

export {
    SearchContextProvider,
    useSearchStateContext,
    useSearchActionsContext,
    useSearchQueryContext,
    useSearchQueryActions,
    useSearchResultsContext,
    useSearchResultsActions,
    useSearchSelectionContext,
    useSearchSelectionActions,
    SearchQueryContext,
    SearchQueryActionsContext,
    SearchResultsContext,
    SearchResultsActionsContext,
    SearchSelectionContext,
    SearchSelectionActionsContext,
};
