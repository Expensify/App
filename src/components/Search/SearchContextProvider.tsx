import React from 'react';
import useReplayPendingWorkspaceUpgradeApprovalOnSearch from '@hooks/useReplayPendingWorkspaceUpgradeApprovalOnSearch';
import SearchQueryProvider from './SearchQueryProvider';
import SearchResultsProvider from './SearchResultsProvider';
import {SearchSelectionProvider, useSyncSelectedReports} from './SearchSelectionProvider';

type SearchContextProps = {
    children: React.ReactNode;
};

function SearchPendingUpgradeReplay() {
    useReplayPendingWorkspaceUpgradeApprovalOnSearch();
    return null;
}

function SearchContextProvider({children}: SearchContextProps) {
    return (
        <SearchQueryProvider>
            <SearchResultsProvider>
                <SearchSelectionProvider>
                    <SearchPendingUpgradeReplay />
                    {children}
                </SearchSelectionProvider>
            </SearchResultsProvider>
        </SearchQueryProvider>
    );
}

export {SearchContextProvider, useSyncSelectedReports};
