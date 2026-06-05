import React from 'react';
import SearchQueryProvider from './SearchQueryProvider';
import SearchResultsProvider from './SearchResultsProvider';
import {SearchSelectionProvider, useSyncSelectedReports} from './SearchSelectionProvider';

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

export {SearchContextProvider, useSyncSelectedReports};
