import React from 'react';
import {SearchQueryActionsContext, SearchQueryContext, SearchQueryProvider, useSearchQueryActions, useSearchQueryContext} from './SearchQueryProvider';
import {SearchResultsActionsContext, SearchResultsContext, SearchResultsProvider, useSearchResultsActions, useSearchResultsContext} from './SearchResultsProvider';
import {SearchSelectionActionsContext, SearchSelectionContext, SearchSelectionProvider, useSearchSelectionActions, useSearchSelectionContext} from './SearchSelectionProvider';

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

export {
    SearchContextProvider,
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
